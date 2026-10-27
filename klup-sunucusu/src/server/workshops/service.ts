// Atölye servisi: senaryoların istemci görünümü, sunucuda puanlama ve deneme kaydı.
// Başarılı ilk tamamlama öğrenme olayı (seri) ve bir kez XP üretir.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, notFound, tooMany } from "@/server/errors";
import { type Actor } from "@/server/auth/policy";
import { hit } from "@/server/rate-limit";
import { award } from "@/server/xp/engine";
import { recordLearning } from "@/server/learning/events";
import { evaluateFirewall, orderScore, runQuery, type FwRule } from "@/lib/workshop-query";
import { EVIDENCE_MAP, NETWORK, QUERY, SECURE_CODE, TIMELINE } from "./data";

export const WORKSHOP_KINDS = ["secure-code", "network", "query", "timeline", "evidence-map"] as const;
export type WorkshopKind = (typeof WORKSHOP_KINDS)[number];

export function publicWorkshop(kind: WorkshopKind) {
  switch (kind) {
    case "secure-code": return SECURE_CODE.map(({ key, title, story, language, lines, sandbox }) => ({ key, title, story, language, lines, sandbox: sandbox ?? null }));
    case "network": return NETWORK.map(({ key, title, story, nodes, packets, starter }) => ({ key, title, story, nodes, starter, packets: packets.map(({ from, to, port }) => ({ from, to, port })) }));
    case "query": return QUERY.map(({ key, title, story, question, rows, example }) => ({ key, title, story, question, rows, example }));
    case "timeline": return TIMELINE.map(({ key, title, story, cards }) => ({ key, title, story, cards: [...cards].sort((a, b) => a.text.localeCompare(b.text, "tr")) }));
    case "evidence-map": return EVIDENCE_MAP.map(({ key, title, story, nodes }) => ({ key, title, story, nodes }));
  }
}

type Feedback = { score: number; passed: boolean; checks: { name: string; ok: boolean; hint?: string }[]; explanation?: string };

const ruleSchema = z.object({ from: z.string().max(20), to: z.string().max(20), port: z.string().regex(/^(any|\d{1,5})$/), action: z.enum(["allow", "deny"]) });
const payloads = {
  // span: düzenleyicide değiştirilen özgün satır sayısı (varsayılan 1); en çok 3 satırlık bölge "satırı buldu" sayılır.
  "secure-code": z.object({ line: z.number().int().min(0).max(50), span: z.number().int().min(0).max(50).default(1), fix: z.string().max(2000) }),
  network: z.object({ rules: z.array(ruleSchema).max(20) }),
  query: z.object({ query: z.string().max(400), answer: z.string().trim().max(120) }),
  timeline: z.object({ order: z.array(z.string().max(10)).max(20), explanation: z.string().trim().max(2000) }),
  "evidence-map": z.object({ links: z.array(z.object({ from: z.string().max(10), to: z.string().max(10), reason: z.string().trim().max(400) })).max(30) }),
};

export function grade(kind: WorkshopKind, key: string, raw: unknown): Feedback {
  switch (kind) {
    case "secure-code": {
      const s = SECURE_CODE.find((x) => x.key === key); if (!s) throw notFound();
      const p = payloads[kind].parse(raw);
      const lineOk = p.span <= 3 && s.vulnerable.some((v) => v >= p.line && v < p.line + Math.max(1, p.span));
      const checks = [{ name: "Zafiyetli satırı doğru işaretledin", ok: lineOk, hint: lineOk ? undefined : "Kullanıcı girdisinin işlendiği satıra bak." }];
      for (const t of s.tests) {
        const ok = (t.require ?? []).every((r) => new RegExp(r, "i").test(p.fix)) && !(t.forbid ?? []).some((r) => new RegExp(r, "i").test(p.fix));
        checks.push({ name: `${t.group === "fix" ? "Zafiyet" : "Davranış"} · ${t.name}`, ok, hint: ok ? undefined : t.hint });
      }
      const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
      return { score, passed: checks.every((c) => c.ok), checks, explanation: checks.every((c) => c.ok) ? s.explanation : undefined };
    }
    case "network": {
      const s = NETWORK.find((x) => x.key === key); if (!s) throw notFound();
      const p = payloads[kind].parse(raw);
      const ids = new Set(["any", ...s.nodes.map((n) => n.id)]);
      if (p.rules.some((r) => !ids.has(r.from) || !ids.has(r.to))) throw badRequest("Kurallarda bilinmeyen düğüm var.");
      const checks = s.packets.map((pk) => { const got = evaluateFirewall(p.rules as FwRule[], pk).action; return { name: `${pk.from} → ${pk.to}:${pk.port} ${pk.expect === "allow" ? "geçmeli" : "engellenmeli"}`, ok: got === pk.expect, hint: got === pk.expect ? undefined : pk.why }; });
      const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
      return { score, passed: score === 100, checks, explanation: score === 100 ? "Kurallar yukarıdan aşağı okunur; ilk eşleşen uygulanır ve hiçbiri eşleşmezse varsayılan red geçerlidir. En az ayrıcalık: yalnız gereken akışlara izin ver." : undefined };
    }
    case "query": {
      const s = QUERY.find((x) => x.key === key); if (!s) throw notFound();
      const p = payloads[kind].parse(raw);
      const r = runQuery(s.rows, p.query);
      const answerOk = p.answer.toLowerCase() === s.answer.toLowerCase();
      const queryOk = r.ok && r.rows.some((row) => Object.values(row).some((v) => String(v).toLowerCase() === s.answer.toLowerCase()));
      const checks = [
        { name: "Sorgu çalışıyor", ok: r.ok, hint: r.ok ? undefined : r.error },
        { name: "Sorgu sonucu cevabı gösteriyor", ok: queryOk, hint: queryOk ? undefined : "Cevabı sorgunun sonucundan okuyabilmelisin; tahmin değil kanıt." },
        { name: "Cevap doğru", ok: answerOk, hint: answerOk ? undefined : "Sonuçları say ya da sırala; en üstteki değeri kontrol et." },
      ];
      const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
      return { score, passed: checks.every((c) => c.ok), checks, explanation: checks.every((c) => c.ok) ? `Örnek çözüm: ${s.example}` : undefined };
    }
    case "timeline": {
      const s = TIMELINE.find((x) => x.key === key); if (!s) throw notFound();
      const p = payloads[kind].parse(raw);
      const score = orderScore(p.order, s.order);
      const exact = p.order.join() === s.order.join();
      const explained = p.explanation.length >= 40;
      const checks = [
        { name: "Olaylar doğru sırada", ok: exact, hint: exact ? undefined : "Saat dilimlerini aynı zamana çevir (UTC+3 → UTC için 3 saat çıkar)." },
        { name: "Olayın gelişimini kendi cümlelerinle açıkladın", ok: explained, hint: explained ? undefined : "En az iki cümleyle neden bu sırada olduğunu anlat." },
      ];
      return { score, passed: exact && explained, checks, explanation: exact ? s.explanation : undefined };
    }
    case "evidence-map": {
      const s = EVIDENCE_MAP.find((x) => x.key === key); if (!s) throw notFound();
      const p = payloads[kind].parse(raw);
      const has = (a: string, b: string) => p.links.some((l) => (l.from === a && l.to === b) || (l.from === b && l.to === a));
      const extra = p.links.filter((l) => !s.required.some(([a, b]) => (l.from === a && l.to === b) || (l.from === b && l.to === a)));
      const label = (id: string) => s.nodes.find((n) => n.id === id)?.label ?? id;
      const checks = s.required.map(([a, b]) => ({ name: `${label(a)} ↔ ${label(b)}`, ok: has(a, b), hint: has(a, b) ? undefined : "Bu iki kanıt arasında bir bağ var; ayrıntılarına yeniden bak." }));
      checks.push({ name: "Gerekçesiz bağlantı yok", ok: p.links.every((l) => l.reason.length >= 10), hint: "Her bağlantıya en az bir cümlelik gerekçe yaz." });
      checks.push({ name: "Dayanaksız bağlantı en fazla bir tane", ok: extra.length <= 1, hint: "Normal trafik (ör. kulüp içi IP) olayla ilişkilendirilmemeli." });
      const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
      return { score, passed: checks.every((c) => c.ok), checks, explanation: checks.every((c) => c.ok) ? "Otomatik kontrol geçti; gerekçelerin öğretmen tarafından da incelenecek." : undefined };
    }
  }
}

export async function submitWorkshop(actor: Actor, kind: WorkshopKind, key: string, payload: unknown) {
  const r = hit(`workshop:${actor.id}`, 60, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const fb = grade(kind, key, payload);
  const xp = await db.$transaction(async (tx) => {
    await tx.workshopAttempt.create({ data: { userId: actor.id, kind, key, payload: payload as object, score: fb.score, passed: fb.passed } });
    if (!fb.passed) return 0;
    await recordLearning(tx, actor.id, `workshop:${kind}:${key}`, "workshop");
    return award(tx, { userId: actor.id, ruleKey: "workshop.complete", key: `workshop:${actor.id}:${kind}:${key}`, source: "TASK", reason: `Atölye: ${kind}/${key}`, refType: "WorkshopAttempt" });
  });
  return { ...fb, xp };
}

export async function workshopProgress(userId: string) {
  const rows = await db.workshopAttempt.groupBy({ by: ["kind", "key", "passed"], where: { userId }, _count: true, _max: { score: true } });
  return rows.map((r) => ({ kind: r.kind, key: r.key, passed: r.passed, attempts: r._count, best: r._max.score ?? 0 }));
}
