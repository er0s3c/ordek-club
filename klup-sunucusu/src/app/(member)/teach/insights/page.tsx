import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { heatmap, interventions, myGroups, supportList } from "@/server/teaching/insights";
import { SKILLS } from "@/server/academy/placement";
import { db } from "@/server/db";
import { EmptyState } from "@/components/ui/states";
import { InterventionForm } from "./InterventionForm";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sınıf içgörüleri") };
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ group?: string; track?: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const actor = { id: user.id, role: user.role, status: user.status };
  const sp = await searchParams;
  const [groups, tracks] = await Promise.all([myGroups(actor), db.track.findMany({ where: { archivedAt: null, kind: { not: "PROGRAM" } }, orderBy: { position: "asc" }, select: { key: true, code: true, title: true } })]);
  const groupId = sp.group ?? groups[0]?.id;
  const trackKey = sp.track ?? tracks[0]?.key;
  if (!groupId || !trackKey) return <div className="stack"><header className="page-head"><h1 className="page-title">{tl("Sınıf içgörüleri")}</h1></header><EmptyState title={tl("Henüz sınıfın yok")} text={tl("Önce bir sınıf oluştur ve öğrencileri ekle.")} action={{ href: "/groups", label: tl("Sınıflar") }} /></div>;
  const [map, support, ints, members] = await Promise.all([heatmap(actor, groupId, trackKey), supportList(actor, groupId), interventions(actor, groupId), db.classGroupMember.findMany({ where: { groupId, user: { role: "STUDENT", status: "ACTIVE" } }, select: { userId: true, user: { select: { displayName: true } } } })]);
  const lessonsDone = (i: number) => map.rows.filter((r) => r.cells[i] === 2).length;
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{tl("Eğitmen")}</div><h1 className="page-title">{tl("Sınıf içgörüleri")}</h1><p className="page-sub">{tl("Bu ekran yalnız öğretmene görünür. Gerekçeler kurallara dayanır; öğrenciye etiket olarak gösterilmez.")}</p></header>
      <form className="row" method="get">
        <label className="field"><span className="tiny faint">{tl("Sınıf")}</span><select className="select" name="group" defaultValue={groupId}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g._count.members})</option>)}</select></label>
        <label className="field"><span className="tiny faint">{tl("Yol")}</span><select className="select" name="track" defaultValue={trackKey}>{tracks.map((t) => <option key={t.key} value={t.key}>{t.code} · {t.title}</option>)}</select></label>
        <button className="btn btn-sm" style={{ alignSelf: "flex-end" }}>{tl("Göster")}</button>
        <Link className="btn btn-sm btn-ghost" style={{ alignSelf: "flex-end" }} href={`/teach/radar`}>{tl("Öğrenme radarı →")}</Link>
      </form>

      <section className="card" aria-labelledby="heat-h">
        <div className="card-h"><h2 id="heat-h">{tl("İlerleme ısı haritası")}</h2><span className="tiny faint">{tl("■ tamamladı · ▣ başladı · □ başlamadı")}</span></div>
        <div className="card-b table-wrap">
          {map.rows.length === 0 ? <EmptyState title={tl("Sınıfta öğrenci yok")} /> : (
            <table className="heat" aria-label={tl("Öğrenci × ders ilerlemesi")}>
              <thead><tr><th scope="col" className="tiny">{tl("Öğrenci")}</th>{map.lessons.map((l, i) => <th key={l.slug} scope="col" className="tiny" title={tl("{title} · {v0}/{length} tamamladı", { title: l.title, v0: lessonsDone(i), length: map.rows.length })}>{l.no}</th>)}</tr></thead>
              <tbody>{map.rows.map((r) => <tr key={r.id}><th scope="row" className="small" style={{ textAlign: "left", paddingRight: 10, whiteSpace: "nowrap" }}>{r.name}</th>{r.cells.map((c, i) => <td key={i} className="cell" data-v={c} title={`${map.lessons[i]!.title}: ${c === 2 ? "tamamladı" : c === 1 ? "başladı" : "başlamadı"}`}><span className="sr-only">{c === 2 ? tl("tamamladı") : c === 1 ? tl("başladı") : tl("başlamadı")}</span></td>)}</tr>)}</tbody>
              <tfoot><tr><th className="tiny" style={{ textAlign: "left" }}>{tl("Tamamlayan")}</th>{map.lessons.map((l, i) => <td key={l.slug} className="tiny mono" style={{ textAlign: "center" }}>{lessonsDone(i)}</td>)}</tr></tfoot>
            </table>
          )}
        </div>
      </section>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="sup-h">
          <div className="card-h"><h2 id="sup-h">{tl("Destek gerekebilecek öğrenciler")}</h2><span className="tiny faint">{tl("karar öğretmende")}</span></div>
          <div className="card-b">
            {support.length ? <ul className="qa-list">{support.map((s) => <li key={s.id} className="qa-item"><strong>{s.name}</strong> <span className="tiny faint">@{s.username}</span><ul className="small" style={{ margin: "4px 0 0" }}>{s.reasons.map((r) => <li key={r}>{r}</li>)}</ul></li>)}</ul> : <EmptyState duck="cheer" title={tl("Şu an işaretlenen öğrenci yok")} />}
          </div>
        </section>
        <section className="card" aria-labelledby="int-h">
          <div className="card-h"><h2 id="int-h">{tl("Radardan müdahale")}</h2></div>
          <div className="card-b stack">
            <InterventionForm groupId={groupId} skills={SKILLS.map((s) => ({ key: s.key, tr: tl.locale === "en" ? s.en : s.tr }))} students={members.map((m) => ({ id: m.userId, name: m.user.displayName, flagged: support.some((s) => s.id === m.userId) }))} />
            {ints.length > 0 && (
              <ul className="list-tight">
                {ints.map((i) => <li key={i.id}><span style={{ flex: 1, minWidth: 0 }}><strong>{SKILLS.find((s) => s.key === i.skill)?.[tl.locale] ?? i.skill}</strong>{" "}{tl("· {targets} öğrenci · {length} ders", { targets: i.targets, length: i.lessons.length })}<span className="tiny faint" style={{ display: "block" }}>{new Date(i.createdAt).toLocaleDateString(tl.intl)}{" "}{tl("· paketi bitiren {completed}/{targets}", { completed: i.completed, targets: i.targets })}</span></span><span className={`small ${i.now > i.before ? "trend-up" : ""}`}>%{i.before} → %{i.now}</span></li>)}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
