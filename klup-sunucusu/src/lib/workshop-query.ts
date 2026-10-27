// Sorgu geliştirme atölyesinin güvenli mini sorgu dili (istemci önizleme + sunucu puanlama ortak).
// Kod çalıştırılmaz: yalnız aşağıdaki biçimler ayrıştırılır.
//   where alan=değer and alan!=değer and alan~parça and alan>sayı
//   | count by alan
//   | sort alan desc
//   | fields alan1,alan2
//   | limit 10
export type Row = Record<string, string | number>;
export type QueryResult = { ok: true; rows: Row[]; columns: string[] } | { ok: false; error: string };

type Cond = { field: string; op: "=" | "!=" | "~" | ">" | "<"; value: string };
const FIELD = /^[a-z_][a-z0-9_]{0,30}$/i;

function parseWhere(text: string): Cond[] | string {
  const parts = text.split(/\s+and\s+/i).map((p) => p.trim()).filter(Boolean);
  const out: Cond[] = [];
  for (const p of parts) {
    const m = p.match(/^([a-z_][a-z0-9_]*)\s*(!=|=|~|>|<)\s*(?:"([^"]*)"|'([^']*)'|(\S+))$/i);
    if (!m) return `Koşul anlaşılamadı: “${p}”. Örnek: status=FAIL`;
    out.push({ field: m[1]!.toLowerCase(), op: m[2] as Cond["op"], value: m[3] ?? m[4] ?? m[5] ?? "" });
  }
  return out;
}

const match = (r: Row, c: Cond) => {
  const v = r[c.field];
  if (v === undefined) return false;
  const s = String(v).toLowerCase(), t = c.value.toLowerCase();
  switch (c.op) {
    case "=": return s === t;
    case "!=": return s !== t;
    case "~": return s.includes(t);
    case ">": return Number(v) > Number(c.value);
    case "<": return Number(v) < Number(c.value);
  }
};

export function runQuery(rows: Row[], query: string): QueryResult {
  const q = query.trim();
  if (q.length > 400) return { ok: false, error: "Sorgu çok uzun." };
  const stages = q.split("|").map((s) => s.trim()).filter(Boolean);
  let out = rows.slice();
  let columns = rows[0] ? Object.keys(rows[0]) : [];
  const known = new Set(columns);
  for (const st of stages) {
    const [head, ...rest] = st.split(/\s+/);
    const arg = rest.join(" ");
    switch (head!.toLowerCase()) {
      case "where": {
        const conds = parseWhere(arg);
        if (typeof conds === "string") return { ok: false, error: conds };
        const unknown = conds.find((c) => !known.has(c.field));
        if (unknown) return { ok: false, error: `Bilinmeyen alan: ${unknown.field}. Alanlar: ${[...known].join(", ")}` };
        out = out.filter((r) => conds.every((c) => match(r, c)));
        break;
      }
      case "count": {
        const m = arg.match(/^by\s+([a-z_][a-z0-9_]*)$/i);
        if (!m || !known.has(m[1]!.toLowerCase())) return { ok: false, error: "Kullanım: count by alan" };
        const f = m[1]!.toLowerCase();
        const counts = new Map<string, number>();
        for (const r of out) counts.set(String(r[f]), (counts.get(String(r[f])) ?? 0) + 1);
        out = [...counts.entries()].map(([k, n]) => ({ [f]: k, count: n })).sort((a, b) => Number(b.count) - Number(a.count));
        columns = [f, "count"];
        known.clear(); columns.forEach((c) => known.add(c));
        break;
      }
      case "sort": {
        const m = arg.match(/^([a-z_][a-z0-9_]*)(?:\s+(asc|desc))?$/i);
        if (!m || !known.has(m[1]!.toLowerCase())) return { ok: false, error: "Kullanım: sort alan desc" };
        const f = m[1]!.toLowerCase(), dir = m[2]?.toLowerCase() === "desc" ? -1 : 1;
        out = [...out].sort((a, b) => { const x = a[f]!, y = b[f]!; return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "tr")) * dir; });
        break;
      }
      case "fields": {
        const fs = arg.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
        if (!fs.length || fs.some((f) => !FIELD.test(f) || !known.has(f))) return { ok: false, error: "Kullanım: fields alan1,alan2" };
        out = out.map((r) => Object.fromEntries(fs.map((f) => [f, r[f]!])));
        columns = fs;
        break;
      }
      case "limit": {
        const n = Number(arg);
        if (!Number.isInteger(n) || n < 1 || n > 500) return { ok: false, error: "Kullanım: limit 10" };
        out = out.slice(0, n);
        break;
      }
      default:
        return { ok: false, error: `Bilinmeyen komut: ${head}. Kullanılabilir: where, count by, sort, fields, limit` };
    }
  }
  return { ok: true, rows: out.slice(0, 500), columns };
}

// Ağ kurma atölyesi: ilk eşleşen kural uygulanır, eşleşme yoksa varsayılan red.
export type FwRule = { from: string; to: string; port: string; action: "allow" | "deny" };
export type Packet = { from: string; to: string; port: number };
export function evaluateFirewall(rules: FwRule[], p: Packet): { action: "allow" | "deny"; rule: number | null } {
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]!;
    const hit = (r.from === "any" || r.from === p.from) && (r.to === "any" || r.to === p.to) && (r.port === "any" || Number(r.port) === p.port);
    if (hit) return { action: r.action, rule: i };
  }
  return { action: "deny", rule: null };
}

// Zaman çizelgesi: doğru sıradaki ardışık çiftlerin oranı (0–100).
export function orderScore(answer: string[], correct: string[]) {
  if (answer.length !== correct.length) return 0;
  const pos = new Map(correct.map((id, i) => [id, i]));
  let ok = 0;
  for (let i = 0; i + 1 < answer.length; i++) if ((pos.get(answer[i]!) ?? -1) + 1 === pos.get(answer[i + 1]!)) ok++;
  return Math.round((ok / Math.max(1, answer.length - 1)) * 100);
}
