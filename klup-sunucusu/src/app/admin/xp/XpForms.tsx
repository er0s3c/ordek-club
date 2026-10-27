"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, RotateCcw, Save, Trash2, Undo2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type Rule = { key: string; label: string; amount: number; enabled: boolean };
type Level = { number: number; minXp: number; title: string };

function useAction() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast("ok", ok);
      router.refresh();
      return true;
    } catch (e) {
      toast("error", (e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, run };
}

export function RulesForm({ initial }: { initial: Rule[] }) {
  const t = useT();
  const [rules, setRules] = useState(initial);
  const { busy, run } = useAction();
  const set = (key: string, patch: Partial<Rule>) => setRules((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => api("/api/admin/xp/rules", { method: "PATCH", body: { rules: rules.map(({ key, amount, enabled }) => ({ key, amount, enabled })) } }), "Kurallar kaydedildi.");
      }}
    >
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>{t("Kural")}</th><th className="num">XP</th><th>{t("Açık")}</th></tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.key}>
                <td>{r.label}<div className="tiny faint mono">{r.key}</div></td>
                <td className="num"><input className="input input-num" type="number" min={0} max={5000} value={r.amount} aria-label={t("{label} XP", { label: r.label })} onChange={(e) => set(r.key, { amount: Number(e.target.value) })} /></td>
                <td><input type="checkbox" checked={r.enabled} aria-label={t("{label} açık", { label: r.label })} onChange={(e) => set(r.key, { enabled: e.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-b"><button className="btn btn-primary" disabled={busy}><Save size={16} aria-hidden />{" "}{t("Kuralları kaydet")}</button></div>
    </form>
  );
}

export function LevelsForm({ initial }: { initial: Level[] }) {
  const t = useT();
  const [levels, setLevels] = useState(initial);
  const { busy, run } = useAction();
  const set = (i: number, patch: Partial<Level>) => setLevels((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => api("/api/admin/xp/levels", { method: "PUT", body: { levels: levels.map((l, i) => ({ ...l, number: i + 1 })) } }), "Seviyeler kaydedildi.");
      }}
    >
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th className="num">{t("Seviye")}</th><th>{t("Unvan")}</th><th className="num">{t("En az XP")}</th><th><span className="sr-only">{t("Sil")}</span></th></tr></thead>
          <tbody>
            {levels.map((l, i) => (
              <tr key={i}>
                <td className="num mono">{i + 1}</td>
                <td><input className="input" value={l.title} maxLength={40} aria-label={t("Seviye {v0} unvanı", { v0: i + 1 })} onChange={(e) => set(i, { title: e.target.value })} /></td>
                <td className="num"><input className="input input-num" type="number" min={0} value={l.minXp} disabled={i === 0} aria-label={t("Seviye {v0} eşiği", { v0: i + 1 })} onChange={(e) => set(i, { minXp: Number(e.target.value) })} /></td>
                <td>{i > 0 && levels.length > 2 && <button type="button" className="btn btn-sm btn-ghost" aria-label={t("Seviye {v0}'i sil", { v0: i + 1 })} onClick={() => setLevels((ls) => ls.filter((_, j) => j !== i))}><Trash2 size={14} aria-hidden /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-b row">
        <button type="button" className="btn" onClick={() => setLevels((ls) => [...ls, { number: ls.length + 1, title: t("Yeni seviye"), minXp: (ls.at(-1)?.minXp ?? 0) + 1000 }])}><Plus size={16} aria-hidden />{" "}{t("Seviye ekle")}</button>
        <button className="btn btn-primary" disabled={busy}><Save size={16} aria-hidden />{" "}{t("Seviyeleri kaydet")}</button>
        <span className="tiny faint">{t("Eşikler seviyeyle birlikte artmalı; 1. seviye 0 XP.")}</span>
      </div>
    </form>
  );
}

export function AdjustForm() {
  const t = useT();
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState("");
  const { busy, run } = useAction();
  return (
    <form
      className="stack-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await run(() => api("/api/admin/xp/adjust", { body: { username, amount, reason } }), t("Düzeltme kaydedildi."))) setReason("");
      }}
    >
      <div className="row">
        <input className="input" placeholder={t("kullanıcı adı")} value={username} onChange={(e) => setUsername(e.target.value)} aria-label={t("Kullanıcı adı")} required style={{ maxWidth: 200 }} />
        <input className="input input-num" type="number" min={-5000} max={5000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label={t("XP miktarı (eksi olabilir)")} />
      </div>
      <input className="input" placeholder={t("Gerekçe (zorunlu, denetim kaydına yazılır)")} value={reason} onChange={(e) => setReason(e.target.value)} aria-label={t("Gerekçe")} required minLength={5} maxLength={300} />
      <div><button className="btn btn-primary" disabled={busy}><Plus size={16} aria-hidden />{" "}{t("Düzeltmeyi kaydet")}</button></div>
    </form>
  );
}

export function ReverseButton({ id, label }: { id: string; label: string }) {
  const t = useT();
  const { busy, run } = useAction();
  return (
    <button
      className="btn btn-sm btn-ghost"
      disabled={busy}
      aria-label={t("{label} işlemini geri al", { label })}
      onClick={() => {
        const reason = window.prompt(t("Geri alma gerekçesi (en az 5 karakter):"))?.trim();
        if (reason) void run(() => api(`/api/admin/xp/transactions/${id}/reverse`, { body: { reason } }), t("İşlem geri alındı."));
      }}
    >
      <Undo2 size={14} aria-hidden />{" "}{t("Geri al")}
    </button>
  );
}

export function ResetHint() {
  const t = useT();
  return <span className="tiny faint"><RotateCcw size={12} aria-hidden />{" "}{t("Geri alma asıl kaydı silmez; karşı kayıt yazar.")}</span>;
}
