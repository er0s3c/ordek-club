"use client";
// Öğretmen görev araçları: akran değerlendirmesi dağıtımı, teslim benzerlik kontrolü, görevi klonlama ve CSV not çizelgesi.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, ScanSearch, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Peer = { id: string; author: string; reviewer: string; status: string; rubricScores: number[] | null; comment: string };

export function TeacherTaskTools({ taskId, canEdit, peerEnabled, peerCount, groups, peers }: { taskId: string; canEdit: boolean; peerEnabled: boolean; peerCount: number; groups: { id: string; name: string }[]; peers: Peer[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [sim, setSim] = useState<{ checked: number; pairs: { a: string; b: string; score: number }[] } | null>(null);
  const [group, setGroup] = useState("");
  const [shift, setShift] = useState(7);
  async function distribute() {
    try { const r = await api<{ created: number; perStudent: number }>(`/api/tasks/${taskId}/peer`, { method: "POST" }); toast("ok", t("{created} değerlendirme ataması yapıldı (öğrenci başına {perStudent}).", { created: r.created, perStudent: r.perStudent })); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  async function check() {
    try { setSim(await api(`/api/teach/tasks/${taskId}/similarity`)); } catch (e) { toast("error", (e as Error).message); }
  }
  async function clone() {
    try { const r = await api<{ id: string }>(`/api/teach/tasks/${taskId}/clone`, { body: { groupId: group || null, shiftDays: shift } }); toast("ok", t("Taslak kopya oluşturuldu.")); router.push(`/teach/tasks/${r.id}/edit`); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card" aria-labelledby="peer-t-h">
        <div className="card-h"><h2 id="peer-t-h"><Users size={16} aria-hidden />{" "}{t("Akran değerlendirmesi")}</h2>{peerEnabled ? <StatusPill tone="ok">{t("açık · {peerCount} değerlendirme", { peerCount })}</StatusPill> : <StatusPill tone="neutral">{t("kapalı")}</StatusPill>}</div>
        <div className="card-b stack-sm">
          {!peerEnabled ? <p className="small muted" style={{ margin: 0 }}>{t("Görevi düzenleyip “Akran değerlendirmesi”ni açabilirsin (rubrik gerekir, takım görevlerinde kullanılmaz).")}</p> : (
            <>
              <p className="small muted" style={{ margin: 0 }}>{t("Teslim edenler birbirinin çalışmasını rubrikle, isimsiz değerlendirir. Puanlar yalnız geri bildirimdir; son not sende.")}</p>
              {canEdit && <div><button type="button" className="btn btn-sm btn-primary" onClick={distribute}>{t("Değerlendirmeleri dağıt")}</button></div>}
              {peers.length > 0 && (
                <details><summary className="small">{t("Atamalar (")}{peers.filter((p) => p.status === "DONE").length}{t("/{length} tamam)", { length: peers.length })}</summary>
                  <ul className="list-tight">{peers.map((p) => <li key={p.id}><span style={{ flex: 1, minWidth: 0 }}>{p.reviewer} → {p.author}{p.comment && <span className="tiny faint" style={{ display: "block" }}>{p.comment.slice(0, 140)}</span>}</span>{p.status === "DONE" ? <StatusPill tone="ok">{t("{v0} puan", { v0: p.rubricScores?.reduce((a, b) => a + b, 0) ?? 0 })}</StatusPill> : <StatusPill tone="warn">{t("bekliyor")}</StatusPill>}</li>)}</ul>
                </details>
              )}
            </>
          )}
        </div>
      </section>
      <section className="card" aria-labelledby="tools-h">
        <div className="card-h"><h2 id="tools-h">{t("Araçlar")}</h2></div>
        <div className="card-b stack">
          <div className="stack-sm">
            <div><button type="button" className="btn btn-sm" onClick={check}><ScanSearch size={14} aria-hidden />{" "}{t("Teslim benzerliğini kontrol et")}</button></div>
            {sim && (sim.pairs.length ? (
              <ul className="list-tight">{sim.pairs.map((p, i) => <li key={i}><span style={{ flex: 1 }}>{p.a} ↔ {p.b}</span><StatusPill tone={p.score >= 70 ? "err" : "warn"}>{t("%{score} örtüşme", { score: p.score })}</StatusPill></li>)}</ul>
            ) : <p className="small muted" style={{ margin: 0 }}>{t("{checked} uzun metin karşılaştırıldı; belirgin örtüşme yok.", { checked: sim.checked })}</p>)}
            {sim && <span className="tiny faint">{t("Bu yalnız bir uyarıdır. Ortak kaynak, şablon ya da takım çalışması örtüşmeye yol açabilir; karar senin.")}</span>}
          </div>
          {canEdit && (
            <div className="stack-sm">
              <div className="row">
                <label className="field"><span className="tiny faint">{t("Kopyalanacak grup")}</span><select className="select" value={group} onChange={(e) => setGroup(e.target.value)}><option value="">{t("Aynı hedef")}</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
                <label className="field"><span className="tiny faint">{t("Tarihleri kaydır (gün)")}</span><input className="input" type="number" min={0} max={365} value={shift} onChange={(e) => setShift(Number(e.target.value))} style={{ width: 110 }} /></label>
              </div>
              <div><button type="button" className="btn btn-sm" onClick={clone}><Copy size={14} aria-hidden />{" "}{t("Görevi klonla (taslak)")}</button></div>
            </div>
          )}
          <div><a className="btn btn-sm btn-ghost" href="/api/teach/gradebook" download><Download size={14} aria-hidden />{" "}{t("Not çizelgesini indir (CSV)")}</a></div>
        </div>
      </section>
    </div>
  );
}
