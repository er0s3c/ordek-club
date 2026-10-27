"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight, Lightbulb, Lock, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { MissionClosing, PublicMission, StepAnswer } from "@/server/academy/missions";
import { useT } from "@/i18n/client";

// Mini görev (docs/design-council/04 §6.7, 05 §6.6): kanca → posta maketi → "Gönderene dokun" → karar → kanıt →
// kapanış (DOSYA KAPANDI). Cevap anahtarı istemcide yok; her adım sunucuda puanlanır, XP "tamamla"da yeniden doğrulanır.
// Güvenlik: maket kurgudur; hiçbir <a href> ve input (özellikle parola) çizilmez, dış istek yapılmaz.

export type MissionData = PublicMission & { solved: boolean; closing: Closing | null };
type Closing = MissionClosing & { portrait: string | null; villain: string | null };
type StepResult = { correct: boolean; feedback: string; hint: boolean; scene: "giris" | null; solution: string | null };
type Done = { xp: number; alreadySolved: boolean; badges: string[]; closing: Closing };
type Saved = { step: number; answers: StepAnswer[]; hints: number };

// Okulun adresiyle mesajın adresi arasındaki farklı parçayı işaretlemek için ortak baş/son.
function splitDiff(a: string, b: string) {
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const part = (s: string) => ({ head: s.slice(0, pre), mid: s.slice(pre, s.length - suf), tail: s.slice(s.length - suf) });
  return [part(a), part(b)] as const;
}

function Diff({ p }: { p: { head: string; mid: string; tail: string } }) {
  return (
    <code className="mail-addr">
      {p.head}
      {p.mid && <mark>{p.mid}</mark>}
      {p.tail}
    </code>
  );
}

function useCountUp(target: number, reduced: boolean) {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced || target <= 0) return setN(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      setN(Math.round(target * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // arka plandaki sekmede rAF durur: son değer her durumda yerine otursun
    const done = setTimeout(() => setN(target), 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [target, reduced]);
  return n;
}

const storeKey = (slug: string, id: string) => `ciu-mission:${slug}:${id}`;
function load(key: string): Saved | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(key) ?? "null");
    return v && typeof v.step === "number" && Array.isArray(v.answers) ? v : null;
  } catch {
    return null;
  }
}
function save(key: string, v: Saved | null) {
  try {
    if (v) sessionStorage.setItem(key, JSON.stringify(v));
    else sessionStorage.removeItem(key);
  } catch {
    /* depolama kapalıysa görev baştan başlar */
  }
}

export function MissionCard({ slug, mission, next, trackHref, readOnly = false, lang }: {
  slug: string;
  lang?: "tr" | "en"; // görev metinlerinin dili; geri bildirim aynı dilde gelir
  mission: MissionData;
  next?: { href: string; title: string } | null;
  trackHref?: string;
  readOnly?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion();
  const key = storeKey(slug, mission.id);
  const total = mission.steps.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<StepAnswer[]>(() => mission.steps.map(() => null));
  const [hints, setHints] = useState(0); // toplam açılan ipucu (yalnız gözlem; XP'yi etkilemez)
  const [shown, setShown] = useState(0); // bu adımda açık ipucu sayısı
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<StepResult | null>(null);
  const [shake, setShake] = useState(0);
  const [senderOpen, setSenderOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [scene, setScene] = useState<"giris" | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [replay, setReplay] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Yenilemede kaldığı adımdan devam (sessionStorage; boş/erişilemezse baştan)
  useEffect(() => {
    if (readOnly || mission.solved) return;
    const s = load(key);
    if (s && s.step < total) {
      setStep(s.step);
      setAnswers(Array.from({ length: total }, (_, i) => s.answers[i] ?? null));
      setHints(s.hints || 0);
      if (s.step > 0) setSenderOpen(true);
    }
  }, [key, total, readOnly, mission.solved]);

  const s = mission.steps[step]!;
  const solvedStep = result?.correct === true;
  const gated = s.kind === "choose" && s.panel && !senderOpen;
  const domain = mission.mail.address.split("@")[1] ?? mission.mail.address;
  const [officialP, messageP] = useMemo(() => splitDiff(mission.mail.official, domain), [mission.mail.official, domain]);
  const closing = done?.closing ?? (mission.solved && !replay ? mission.closing : null);

  function resetStep() {
    setResult(null);
    setWrong(new Set());
    setPicked([]);
    setShown(0);
  }

  function revealHint() {
    if (shown >= s.hints.length) return;
    setShown((n) => n + 1);
    setHints((n) => n + 1);
    // 2. ipucu karşılaştırma panelini kendiliğinden açar (05 §6.3 Sayfa 2)
    if (shown === 1 && s.kind === "choose" && s.panel) setSenderOpen(true);
  }

  async function check(answer: StepAnswer) {
    if (readOnly || busy || solvedStep) return;
    setBusy(true);
    try {
      const r = await api<StepResult>(`/api/academy/lessons/${slug}/missions/${mission.id}/check`, { body: { step, answer, hints, lang } });
      setResult(r);
      if (r.correct) {
        const nextAnswers = answers.map((a, i) => (i === step ? answer : a));
        setAnswers(nextAnswers);
        save(key, { step, answers: nextAnswers, hints });
      } else {
        if (typeof answer === "number") setWrong((w) => new Set(w).add(answer));
        setShake((n) => n + 1);
        if (r.hint && shown === 0) {
          setShown(1);
          setHints((n) => n + 1);
        }
        if (r.scene) setScene(r.scene);
      }
      requestAnimationFrame(() => feedbackRef.current?.focus());
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function advance() {
    if (step < total - 1) {
      const n = step + 1;
      setStep(n);
      resetStep();
      save(key, { step: n, answers, hints });
      return;
    }
    setBusy(true);
    try {
      const r = await api<Done>(`/api/academy/lessons/${slug}/missions/${mission.id}/complete`, { body: { answers, hints, lang } });
      setDone(r);
      setReplay(false);
      save(key, null);
      r.badges.forEach((b) => toast("ok", t("🏅 Yeni rozet: {b}", { b })));
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    setReplay(true);
    setDone(null);
    setStep(0);
    setAnswers(mission.steps.map(() => null));
    setSenderOpen(false);
    setTargetOpen(false);
    resetStep();
  }

  const mail = (
    <article className="mail" aria-label={t("Simülasyon e-postası")}>
      <header className="mail-head">
        <div className="mail-row">
          <span className="mail-label">{t("Gönderen")}</span>
          <span className="mail-from">{mission.mail.from}</span>
          <button type="button" className="mail-chip" aria-expanded={senderOpen} aria-controls={`${mission.id}-sender`} onClick={() => setSenderOpen((v) => !v)}>
            {t("Gönderene dokun")}{" "}<ChevronRight size={14} aria-hidden />
          </button>
        </div>
        {senderOpen && (
          <div id={`${mission.id}-sender`} className="mail-compare" role="group" aria-label={t("Adres karşılaştırması")}>
            <div className="mail-compare-row"><span>{t("Yer imindeki okul")}</span><Diff p={officialP} /></div>
            <div className="mail-compare-row"><span>{t("Bu mesaj")}</span><Diff p={messageP} /></div>
            <div className="mail-compare-full">{t("Tam adres:")}{" "}<code>{mission.mail.address}</code></div>
          </div>
        )}
        <div className="mail-row"><span className="mail-label">{t("Konu")}</span><strong className="mail-subject">{mission.mail.subject}</strong></div>
        <div className="mail-time">{mission.mail.time}</div>
      </header>
      <div className="mail-body">{mission.mail.body.trim().split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div>
      {mission.mail.button && (
        <div className="mail-cta">
          {/* Maket içi sahte düğme: bağlantı değil; simülasyon giriş ekranını gösterir */}
          <button type="button" className="mail-fake-btn" onClick={() => !readOnly && setScene("giris")}>{mission.mail.button}</button>
          {mission.mail.target && (
            <button type="button" className="mail-chip" aria-expanded={targetOpen} aria-controls={`${mission.id}-target`} onClick={() => setTargetOpen((v) => !v)}>
              {t("“{button}” nereye gidiyor?", { button: mission.mail.button })}{" "}<ChevronRight size={14} aria-hidden />
            </button>
          )}
        </div>
      )}
      {targetOpen && mission.mail.target && (
        <div id={`${mission.id}-target`} className="mail-compare">
          <div className="mail-compare-row"><span>{t("Düğmenin gittiği adres")}</span><code className="mail-addr">{mission.mail.target}</code></div>
        </div>
      )}
    </article>
  );

  const sim = (
    <div className="mission-sim" role="note"><ShieldCheck size={15} aria-hidden />{" "}{t("SİMÜLASYON · Gerçek e-posta değil, hiçbir şey sana zarar veremez")}</div>
  );

  if (readOnly)
    return (
      <section id={`gorev-${mission.id}`} className="mission is-readonly" aria-label={mission.title}>
        {sim}
        <p className="mission-hook"><time>{mission.hook.time}</time> {mission.hook.text}</p>
        {mail}
        <ol className="mission-preview">
          {mission.steps.map((st, i) => <li key={i}><strong>{st.title}</strong> — {st.prompt}</li>)}
        </ol>
        <p className="mission-note">{t("Önizleme · Görev her öğrencinin kendi cihazında çözülür.")}</p>
      </section>
    );

  if (closing) return <ClosingCard closing={closing} done={done} next={next} trackHref={trackHref} reduced={reduced} onReplay={restart} />;

  return (
    <section id={`gorev-${mission.id}`} className="mission" aria-label={mission.title}>
      {sim}
      {step === 0 && <p className="mission-hook"><time>{mission.hook.time}</time> {mission.hook.text}</p>}
      <div className="mission-rail">
        <div className="lab-progress-rail" role="progressbar" aria-label={t("Görev ilerlemesi")} aria-valuemin={0} aria-valuemax={total} aria-valuenow={step + (solvedStep ? 1 : 0)}>
          <div className="lab-progress-fill" style={{ width: `${((step + (solvedStep ? 1 : 0)) / total) * 100}%` }} />
        </div>
        <span className="lab-progress-label">{t("Karar {v0}/{total}", { v0: step + 1, total })}</span>
      </div>

      {mail}

      {scene === "giris" && (
        <div className="mission-scene" role="group" aria-label={t("Simülasyon giriş ekranı")}>
          <div className="sim-bar"><Lock size={13} aria-hidden /> {mission.mail.target ?? domain}</div>
          {/* Bilerek input yok: öğrenci gerçek parolasını yazamaz */}
          <div className="sim-form" aria-hidden>
            <div className="sim-field">{t("Öğrenci numarası")}</div>
            <div className="sim-field">{t("Şifre")}</div>
            <div className="sim-submit">{t("Giriş yap")}</div>
          </div>
          <p>{t("Sahte giriş sayfası gerçeğine çok benzeyebilir. Farkı adres çubuğunda: bu okulun adresi değil.")}</p>
          <button type="button" className="btn" onClick={() => setScene(null)}><RotateCcw size={15} aria-hidden />{" "}{t("Tekrar bak")}</button>
        </div>
      )}

      <div className="mission-step">
        <h3 className="mission-step-title">{s.title}</h3>
        <p className="mission-prompt">{s.prompt}</p>
        {gated && <p className="mission-gate">{t("Önce yukarıdaki")}{" "}<strong>{t("Gönderene dokun")}</strong>{" "}{t("çipine dokun, sonra karar ver.")}</p>}

        {s.kind === "evidence" && !s.single ? (
          <>
            <div className="mission-options" role="group" aria-label={s.prompt}>
              {s.options.map((o, j) => {
                const on = picked.includes(j);
                return (
                  <button key={j} type="button" role="checkbox" aria-checked={on} className={`mission-opt${on ? " is-on" : ""}`} disabled={busy || solvedStep}
                    onClick={() => setPicked((p) => (on ? p.filter((x) => x !== j) : [...p, j]))}>
                    {o}
                  </button>
                );
              })}
            </div>
            {!solvedStep && <button type="button" className="btn btn-primary" disabled={busy || picked.length === 0} onClick={() => check(picked)}>{t("Kanıtları gönder")}</button>}
          </>
        ) : (
          <div className="mission-options" role="group" aria-label={s.prompt}>
            {s.options.map((o, j) => {
              const chosen = solvedStep && answers[step] === j;
              return (
                <button key={j} type="button" className={`mission-opt${wrong.has(j) ? " is-wrong" : ""}${chosen ? " is-right" : ""}`}
                  disabled={busy || gated || wrong.has(j) || (solvedStep && !chosen)} aria-pressed={chosen || wrong.has(j)} onClick={() => check(j)}>
                  {wrong.has(j) && <X size={15} aria-hidden />}
                  {chosen && <Check size={15} aria-hidden />}
                  {o}
                </button>
              );
            })}
          </div>
        )}

        <div ref={feedbackRef} tabIndex={-1} className="mission-feedback" aria-live="polite">
          {result && (
            <div key={shake} className={`mission-verdict ${result.correct ? "is-ok" : "is-bad"}`}>
              {result.correct ? <Check size={17} aria-hidden /> : <X size={17} aria-hidden />}
              <span>{result.feedback}</span>
            </div>
          )}
          {result?.solution && !result.correct && (
            <div className="mission-solution"><strong>{t("Birlikte bakalım:")}</strong> {result.solution.replace(/^Birlikte bakalım:\s*/, "")}</div>
          )}
        </div>

        {shown > 0 && (
          <ul className="mission-hints">
            {s.hints.slice(0, shown).map((h, i) => <li key={i}><Lightbulb size={15} aria-hidden /> {h}</li>)}
          </ul>
        )}

        <div className="mission-actions">
          {!solvedStep && (wrong.size > 0 || result) && shown < s.hints.length && (
            <span className="stack-sm" style={{ gap: 2 }}>
              {/* Aşamalı ipucu: önce küçük yönlendirme, sonra daha ayrıntılı; etkisi önceden yazılır */}
              <button type="button" className="btn" onClick={revealHint}><Lightbulb size={15} aria-hidden /> {shown === 0 ? t("Küçük bir yönlendirme") : shown === s.hints.length - 1 ? t("Ayrıntılı ipucu") : t("Biraz daha")} ({shown + 1}/{s.hints.length})</button>
              <span className="tiny faint">{t("İpucu XP’ni ve değerlendirmeni etkilemez; yalnız kaç ipucu kullandığın kaydedilir.")}</span>
            </span>
          )}
          {solvedStep && (
            <button type="button" className="btn btn-primary" onClick={advance} disabled={busy}>
              {busy ? <span className="spinner" aria-hidden /> : null} {step < total - 1 ? t("Devam ({v0}/{total})", { v0: step + 2, total }) : t("Dosyayı kapat")} <ArrowRight size={15} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ClosingCard({ closing, done, next, trackHref, reduced, onReplay }: {
  closing: Closing;
  done: Done | null;
  next?: { href: string; title: string } | null;
  trackHref?: string;
  reduced: boolean;
  onReplay: () => void;
}) {
  const t = useT();
  const xp = useCountUp(done?.xp ?? 0, reduced);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (done) ref.current?.focus();
  }, [done]);
  return (
    <section className="mission mission-closing" aria-label={t("Dosya kapandı")}>
      <div ref={ref} tabIndex={-1} className="mission-closing-head">
        <span className="mission-stamp">{t("DOSYA KAPANDI")}</span>
      </div>
      <div className="mission-closing-body">
        {closing.portrait && (
          // eslint-disable-next-line @next/next/no-img-element -- portre kendi API'mizden
          <img className="mission-portrait" src={closing.portrait} alt={closing.villain ?? ""} width={140} height={210} loading="lazy" decoding="async" />
        )}
        <div className="mission-closing-text">
          <p className="mission-reveal">{closing.reveal}</p>
          <p className="mission-xp" aria-live="polite">
            {done && done.xp > 0 && <>{t("+{xp} XP · Nedenini yakaladın. İlk denemede ya da ipucuyla, fark etmez.", { xp })}</>}
            {done && done.xp === 0 && (done.alreadySolved ? t("Bu görevi çözdün. XP bir kez verilir.") : t("Görev çözüldü."))}
            {!done && t("Bu görevi çözdün.")}
          </p>
        </div>
      </div>
      <ol className="mission-rules">{closing.rules.map((r, i) => <li key={i}>{r}</li>)}</ol>
      {closing.next && <p className="mission-next">{closing.next}</p>}
      <div className="mission-actions">
        {next && <Link className="btn btn-primary" href={next.href}>{t("Sıradaki: {title}", { title: next.title })}{" "}<ArrowRight size={15} aria-hidden /></Link>}
        <Link className="btn btn-ghost" href="/dashboard">{t("Bugünlük yeter")}</Link>
        <button type="button" className="btn btn-ghost" onClick={onReplay}><RotateCcw size={15} aria-hidden />{" "}{t("Yeniden oyna")}</button>
      </div>
      {trackHref && <Link className="mission-story" href={trackHref}>{t("Gölge Ağ hikâyesi →")}</Link>}
    </section>
  );
}
