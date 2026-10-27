"use client";
// Rozet yol haritası + paylaşılabilir başarı kartı. Kart tarayıcıda çizilir ve yalnız kişinin cihazına indirilir;
// sunucuya bir şey gönderilmez, ad gösterimi kişinin seçimine bağlıdır.
import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { BadgeIcon } from "@/components/xp/BadgeIcon";
import { Drawer } from "@/components/ui/Drawer";
import { StatusPill } from "@/components/ui/states";
import { translateClient, useT } from "@/i18n/client";

type Badge = { id: string; name: string; description: string; icon: string; rule: string; owned: boolean; awardedAt: string | null; progress: { value: number; target: number } | null };
type Achievement = { title: string; subtitle: string; date: string };

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ENT[c]!);
function cardSvg(a: Achievement, name: string | null) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0.35" stop-color="#5c1fe2"/><stop offset="1" stop-color="#ed04fa"/></linearGradient></defs><rect width="1200" height="630" rx="40" fill="url(#g)"/><rect x="40" y="40" width="1120" height="550" rx="28" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2"/><text x="80" y="130" font-family="Arial, sans-serif" font-size="28" fill="#ffffff" fill-opacity=".85" letter-spacing="4">ÖRDEK CLUB · BAŞARI</text><text x="80" y="290" font-family="Arial, sans-serif" font-weight="700" font-size="72" fill="#ffffff">${esc(a.title.slice(0, 32))}</text><text x="80" y="360" font-family="Arial, sans-serif" font-size="32" fill="#ffffff" fill-opacity=".9">${esc(a.subtitle.slice(0, 70))}</text><text x="80" y="520" font-family="Arial, sans-serif" font-size="30" fill="#17ff74">${name ? `${esc(name.slice(0, 40))} · ` : ""}${esc(a.date)}</text></svg>`;
}
async function download(a: Achievement, name: string | null) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(a, name))}`;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 630;
  c.getContext("2d")!.drawImage(img, 0, 0);
  const link = document.createElement("a");
  link.href = c.toDataURL("image/png");
  link.download = `ordek-club-basari-${Date.now()}.png`;
  link.click();
}
const pct = (p: { value: number; target: number }) => Math.min(100, Math.round((p.value / Math.max(1, p.target)) * 100));

export function BadgeRoadmap({ badges, certs, name }: { badges: Badge[]; certs: { title: string; at: string }[]; name: string }) {
  const t = useT();
  const [share, setShare] = useState<Achievement | null>(null);
  const [withName, setWithName] = useState(false);
  const owned = badges.filter((b) => b.owned);
  const next = badges.filter((b) => !b.owned).sort((a, b) => (b.progress ? pct(b.progress) : -1) - (a.progress ? pct(a.progress) : -1));
  return (
    <div className="stack-lg">
      <section aria-labelledby="next-h" className="stack-sm">
        <h2 id="next-h" className="section-title">{t("Sıradaki rozetler")}</h2>
        <div className="grid-3">
          {next.map((b) => (
            <article key={b.id} className="card card-b stack-sm">
              <div className="row"><span className="badge-road-icon is-locked"><Lock size={14} aria-hidden /><BadgeIcon icon={b.icon} size={20} /></span><strong>{t(b.name)}</strong></div>
              <span className="small muted">{t(b.description)}</span>
              <span className="tiny">{t("Koşul: {rule}", { rule: translateClient(b.rule) })}</span>
              {b.progress ? (
                <>
                  <div className="bar" role="img" aria-label={`${b.progress.value}/${b.progress.target}`}><span style={{ width: `${pct(b.progress)}%` }} /></div>
                  <span className="tiny faint">{Math.min(b.progress.value, b.progress.target)} / {b.progress.target}</span>
                </>
              ) : <span className="tiny faint">{t("Bu rozetin ilerlemesi otomatik ölçülmüyor.")}</span>}
            </article>
          ))}
          {!next.length && <p className="muted">{t("Bütün etkin rozetleri kazandın.")}</p>}
        </div>
      </section>
      <section aria-labelledby="own-h" className="stack-sm">
        <h2 id="own-h" className="section-title">{t("Kazandıkların ({v0})", { v0: owned.length + certs.length })}</h2>
        <div className="grid-3">
          {owned.map((b) => (
            <article key={b.id} className="card card-b stack-sm">
              <div className="row"><span className="badge-road-icon"><BadgeIcon icon={b.icon} size={20} /></span><strong>{t(b.name)}</strong><StatusPill tone="ok">{t("kazanıldı")}</StatusPill></div>
              <span className="small muted">{t(b.description)}</span>
              <div><button type="button" className="btn btn-sm" onClick={() => setShare({ title: t(b.name), subtitle: t(b.description), date: new Date(b.awardedAt!).toLocaleDateString(t.intl) })}><Download size={14} aria-hidden />{" "}{t("Başarı kartı")}</button></div>
            </article>
          ))}
          {certs.map((c) => (
            <article key={c.title} className="card card-b stack-sm">
              <div className="row"><span className="badge-road-icon"><BadgeIcon icon="graduation-cap" size={20} /></span><strong>{c.title}</strong><StatusPill tone="ok">{t("belge")}</StatusPill></div>
              <div><button type="button" className="btn btn-sm" onClick={() => setShare({ title: c.title, subtitle: t("Yol sınavı başarıyla tamamlandı"), date: new Date(c.at).toLocaleDateString(t.intl) })}><Download size={14} aria-hidden />{" "}{t("Başarı kartı")}</button></div>
            </article>
          ))}
        </div>
      </section>
      <Drawer open={!!share} onClose={() => setShare(null)} title={t("Başarı kartı")}>
        {share && (
          <div className="stack">
            {/* eslint-disable-next-line @next/next/no-img-element -- yerel olarak üretilmiş önizleme */}
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(cardSvg(share, withName ? name : null))}`} alt={t("{title} başarı kartı önizlemesi", { title: share.title })} style={{ width: "100%", borderRadius: 12 }} />
            <label className="check"><input type="checkbox" checked={withName} onChange={(e) => setWithName(e.target.checked)} />{" "}{t("Kartta adım görünsün")}</label>
            <p className="tiny faint">{t("Kart yalnız cihazına indirilir; nerede paylaşacağına sen karar verirsin.")}</p>
            <div><button type="button" className="btn btn-primary btn-sm" onClick={() => download(share, withName ? name : null)}><Download size={14} aria-hidden />{" "}{t("PNG olarak indir")}</button></div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
