"use client";
// Ders öncesi yoklama (notsuz): öğretmen anlatımını yanıtların dağılımına göre ayarlar.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Check = { id: string; title: string; closesAt: string; questions: { question: string; options: string[] }[]; answered: boolean };

export function PrecheckCard({ checks }: { checks: Check[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  if (!checks.length) return null;
  return (
    <section id="precheck" className="card card-primary" aria-labelledby="pre-h">
      <div className="card-h"><h2 id="pre-h"><ClipboardCheck size={16} aria-hidden />{" "}{t("Ders öncesi yoklama")}</h2><span className="tiny faint">{t("notlandırılmaz")}</span></div>
      <div className="card-b stack">
        {checks.map((c) => (
          <div key={c.id} className="stack-sm">
            <div className="row-between"><strong>{c.title}</strong>{c.answered ? <StatusPill tone="ok">{t("yanıtladın")}</StatusPill> : <span className="tiny faint">{t("{date} tarihine kadar", { date: new Date(c.closesAt).toLocaleString(t.intl) })}</span>}</div>
            {!c.answered && (
              <>
                {c.questions.map((q, i) => (
                  <fieldset key={i} className="field">
                    <legend className="small">{i + 1}. {q.question}</legend>
                    <div className="chips">{q.options.map((o, k) => <button key={k} type="button" className="chip" aria-pressed={answers[c.id]?.[i] === k} onClick={() => setAnswers((a) => { const arr = [...(a[c.id] ?? c.questions.map(() => -1))]; arr[i] = k; return { ...a, [c.id]: arr }; })}>{o}</button>)}</div>
                  </fieldset>
                ))}
                <div><button type="button" className="btn btn-sm btn-primary" disabled={(answers[c.id] ?? []).filter((x) => x >= 0).length !== c.questions.length} onClick={async () => { try { await api(`/api/prechecks/${c.id}`, { body: { answers: answers[c.id] } }); toast("ok", t("Yanıtların öğretmenine iletildi.")); router.refresh(); } catch (e) { toast("error", (e as Error).message); } }}>{t("Gönder")}</button></div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
