"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Send } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Drawer } from "@/components/ui/Drawer";
import { StatusPill, type Tone } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Ch = { key: string; skill: string; title: string; summary: string; minutes: number; evidencePrompt: string; questions: { text: string; options: string[] }[] };
type Mine = { id: string; challengeKey: string; score: number; status: string; exemption: boolean; note: string; createdAt: string };
const TONE: Record<string, Tone> = { SUBMITTED: "warn", ACCEPTED: "ok", REJECTED: "neutral" };
const LABEL: Record<string, string> = { SUBMITTED: "öğretmen incelemesinde", ACCEPTED: "kabul edildi", REJECTED: "kabul edilmedi" };

export function ChallengeList({ challenges, mine }: { challenges: Ch[]; mine: Mine[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<Ch | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!open) return;
    setBusy(true);
    try {
      const r = await api<{ score: number; passed: boolean }>(`/api/challenges/${open.key}`, { body: { answers, evidence } });
      toast(r.passed ? "ok" : "info", r.passed ? t("Ön eleme %{score}: başvurun öğretmene iletildi.", { score: r.score }) : t("Ön eleme %{score}: en az %80 gerekiyor. Bir hafta sonra yeniden deneyebilirsin.", { score: r.score }));
      setOpen(null); router.refresh();
    } catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return (
    <>
      <div className="grid-3">
        {challenges.map((c) => {
          const last = mine.find((m) => m.challengeKey === c.key);
          return (
            <article key={c.key} className="card card-b stack-sm">
              <strong><Award size={15} aria-hidden /> {c.title}</strong>
              <span className="small muted">{c.summary}</span>
              <span className="tiny faint">{t("~{minutes} dk · {length} soru + açıklama", { minutes: c.minutes, length: c.questions.length })}</span>
              {last && <span className="row"><StatusPill tone={TONE[last.status] ?? "neutral"}>{t(LABEL[last.status] ?? last.status)}</StatusPill>{last.exemption && <StatusPill tone="ok">{t("muafiyet")}</StatusPill>}</span>}
              {last?.note && <span className="tiny faint">{last.note}</span>}
              {(!last || last.status === "REJECTED") && <div><button type="button" className="btn btn-sm" onClick={() => { setOpen(c); setAnswers(c.questions.map(() => -1)); setEvidence(""); }}>{t("Başvur")}</button></div>}
            </article>
          );
        })}
      </div>
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""}>
        {open && (
          <div className="stack">
            {open.questions.map((q, i) => (
              <fieldset key={i} className="field">
                <legend className="small"><strong>{i + 1}.</strong> {q.text}</legend>
                {q.options.map((o, k) => <label key={k} className="check"><input type="radio" name={`ch-${i}`} checked={answers[i] === k} onChange={() => setAnswers((a) => a.map((x, j) => (j === i ? k : x)))} /> {o}</label>)}
              </fieldset>
            ))}
            <label className="field">{open.evidencePrompt}<textarea className="textarea" rows={6} maxLength={4000} value={evidence} onChange={(e) => setEvidence(e.target.value)} /></label>
            <span className="tiny faint">{t("{length}/80 karakter en az", { length: evidence.trim().length })}</span>
            <div><button type="button" className="btn btn-primary btn-sm" disabled={busy || answers.some((a) => a < 0) || evidence.trim().length < 80} onClick={submit}><Send size={14} aria-hidden />{" "}{t("Gönder")}</button></div>
          </div>
        )}
      </Drawer>
    </>
  );
}
