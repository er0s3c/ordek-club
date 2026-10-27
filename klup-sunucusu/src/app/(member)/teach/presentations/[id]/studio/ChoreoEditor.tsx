"use client";
// Theatre.js zaman çizelgesi: eğitmen başlık ve blokların giriş hareketini anahtar karelerle düzenler.
// Theatre Studio arayüzü yalnız bu panel açıkken görünür; durum saniyede bir slayta (motion) yazılır.
import { useEffect, useRef, useState } from "react";
import { Clapperboard, Eraser, Play } from "lucide-react";
import { SHEET, applyValues, choreoProps, objectKey, parseChoreo, type Values } from "@/components/presentation/choreo";
import { useT } from "@/i18n/client";

const MAX = 60_000;
let initialized = false;
let seq = 0;

type Live = { projectId: string; play: () => void; stop: () => void };

export function ChoreoEditor({ motion, count, slideKey, previewSelector, onChange, onActive }: { motion: string; count: number; slideKey: string | number; previewSelector: string; onChange: (motion: string) => void; onActive: (on: boolean) => void }) {
  const t = useT();
  const [on, setOn] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const live = useRef<Live | null>(null);
  const last = useRef(motion);
  const change = useRef(onChange);
  change.current = onChange;
  const [reset, setReset] = useState(0);

  useEffect(() => { onActive(on); }, [on, onActive]);

  useEffect(() => {
    if (!on) return;
    let alive = true;
    const offs: (() => void)[] = [];
    let timer: ReturnType<typeof setInterval> | null = null;
    const targets = () => {
      const root = document.querySelector<HTMLElement>(previewSelector);
      return root ? [root.querySelector<HTMLElement>(".slide-title"), ...Array.from(root.querySelectorAll<HTMLElement>(".slide-body > *"))] : [];
    };
    void Promise.all([import("@/lib/theatre/core"), import("@/lib/theatre/studio")]).then(([core, { default: studio }]) => {
      if (!alive) return;
      if (!initialized) {
        // Theatre Studio açılınca updates.theatrejs.com'a sürüm kontrolü yapar (kapatma ayarı yok). Dış sunucuya
        // istek gitmesin (gizlilik, CSP) diye yalnız bu adres ağa çıkmadan "erişilemedi" yanıtı alır.
        const nativeFetch = window.fetch.bind(window);
        window.fetch = (input, init) => {
          const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
          return url.startsWith("https://updates.theatrejs.com/") ? Promise.resolve(new Response(null, { status: 503 })) : nativeFetch(input, init);
        };
        studio.initialize({ usePersistentStorage: false });
        initialized = true;
      }
      const projectId = t("Slayt düzeni {v0}", { v0: ++seq });
      const project = core.getProject(projectId, { state: parseChoreo(last.current) ?? undefined });
      const sheet = project.sheet(SHEET);
      const objects = Array.from({ length: count + 1 }, (_, k) => sheet.object(objectKey(k - 1), choreoProps(core.types)));
      objects.forEach((o, k) => offs.push(o.onValuesChange((v) => applyValues(targets()[k], v as Values))));
      studio.ui.restore();
      studio.setSelection([objects[0]]);
      live.current = { projectId, play: () => { sheet.sequence.position = 0; void sheet.sequence.play({ iterationCount: 1 }); }, stop: () => sheet.sequence.pause() };
      timer = setInterval(() => {
        const json = JSON.stringify(studio.createContentOfSaveFile(projectId));
        // Anahtar karesi olmayan durum kaydedilmez (slayt varsayılan hâliyle kalır).
        const hasKeys = json.includes("keyframes");
        const next = hasKeys ? json : "";
        if (next === last.current) return;
        if (next.length > MAX) { setErr(t("Zaman çizelgesi çok büyük; bazı anahtar kareleri sil.")); return; }
        setErr(null);
        last.current = next;
        change.current(next);
      }, 1000);
    }).catch(() => alive && setErr(t("Theatre.js yüklenemedi.")));
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
      live.current?.stop();
      live.current = null;
      offs.forEach((f) => f());
      for (const el of targets()) if (el) { el.style.opacity = ""; el.style.transform = ""; el.style.filter = ""; }
      void import("@/lib/theatre/studio").then(({ default: studio }) => { if (initialized) studio.ui.hide(); });
    };
  }, [on, count, slideKey, previewSelector, reset, t]);

  // Başka slayta geçince son kaydedilen durum o slaytınki olur.
  useEffect(() => { last.current = motion; }, [slideKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="choreo-bar row" style={{ flexWrap: "wrap", gap: 6 }}>
      <button type="button" className="btn btn-sm" aria-pressed={on} onClick={() => setOn((v) => !v)}><Clapperboard size={14} aria-hidden /> {on ? t("Zaman çizelgesini kapat") : t("Hareket zaman çizelgesi")}</button>
      {on && <button type="button" className="btn btn-sm btn-ghost" onClick={() => live.current?.play()}><Play size={14} aria-hidden />{" "}{t("Oynat")}</button>}
      {(on || motion) && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { last.current = ""; change.current(""); setReset((r) => r + 1); }}><Eraser size={14} aria-hidden />{" "}{t("Hareketi temizle")}</button>}
      <span className="tiny faint">{err ?? (on ? t("Alttaki Theatre panelinde bir nesne seç, özelliğin yanındaki elmasla anahtar kare ekle. Değişiklikler otomatik kaydedilir.") : motion ? t("Bu slaytta özel giriş hareketi var.") : t("Başlık ve bloklar için anahtar kareli giriş hareketi tasarla."))}</span>
    </div>
  );
}
