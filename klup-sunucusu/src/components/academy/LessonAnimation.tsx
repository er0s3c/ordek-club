"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { getAnimation } from "@/animations/registry";
import { animationStepCount } from "@/animations/types";
import { SlideView } from "@/components/presentation/SlideView";
import { useLocale, useT } from "@/i18n/client";

// Ders sayfasında tek başına oynatılan animasyon: canlı derste kullanılan sahnenin aynısı,
// öğrencinin kendi hızında adım adım ilerlettiği hâliyle.
export function LessonAnimation({ id }: { id: string }) {
  const tl = useT();
  const locale = useLocale();
  const def = getAnimation(id, locale);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = def ? animationStepCount(def) - 1 : 0;

  useEffect(() => {
    if (!playing) return;
    if (step >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), 2600);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  if (!def) return <p className="md-img-missing">{tl("Bilinmeyen animasyon: {id}", { id })}</p>;
  const note = step > 0 ? def.steps[step - 1]?.note : def.summary;

  return (
    <figure className="lesson-anim" aria-label={tl("Animasyon: {title}", { title: def.title })}>
      <SlideView
        slide={{ id, position: 0, title: def.title, layout: "default", blocks: [{ type: "animation", animation: id as never }], steps: last + 1 }}
        step={step}
        stepKey={step}
      />
      <div className="lesson-anim-bar">
        <button className="btn btn-sm" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} aria-label={tl("Önceki adım")}>
          <SkipBack size={15} aria-hidden />
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => (step >= last ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))} aria-label={playing ? tl("Duraklat") : tl("Oynat")}>
          {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />} {playing ? tl("Duraklat") : step >= last ? tl("Baştan oynat") : tl("Oynat")}
        </button>
        <button className="btn btn-sm" onClick={() => { setPlaying(false); setStep((s) => Math.min(last, s + 1)); }} disabled={step >= last} aria-label={tl("Sonraki adım")}>
          <SkipForward size={15} aria-hidden />
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => { setPlaying(false); setStep(0); }} disabled={step === 0} aria-label={tl("Başa dön")}>
          <RotateCcw size={15} aria-hidden />
        </button>
        <span className="tiny faint mono">{tl("adım {step}/{last}", { step, last })}</span>
      </div>
      {/* Sahnedeki küçük yazı telefonda okunmayabilir; açıklama burada normal boyutta tekrar edilir. */}
      <figcaption className="lesson-anim-note" aria-live="polite">{note}</figcaption>
    </figure>
  );
}
