import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { isStaff } from "@/server/auth/policy";
import { getGroup } from "@/server/classroom/groups";
import { HttpError } from "@/server/errors";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { FileList } from "@/components/classroom/FileList";
import { ASSIGNMENT_STATUS } from "@/components/classroom/labels";
import { groupValues } from "@/components/classroom/form-values";
import { ArchiveGroup, GroupForm, JoinButton, MembersEditor } from "../GroupsClient";
import { GroupExtras } from "./GroupExtras";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sınıf / etkinlik") };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession();
  const { id } = await params;
  const actor = { id: user.id, role: user.role, status: user.status };
  const g = await getGroup(actor, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  const staff = isStaff(user.role);
  const s = await getSettings();
  // Görev ve dosyalar: personel hepsini, öğrenci yalnız üyeyse ve yayınlanmış olanları görür.
  const canSee = staff || g.isMember;
  const [tasks, files] = canSee
    ? await Promise.all([
        db.assignment.findMany({
          where: { groupId: id, ...(staff ? {} : { status: { in: ["PUBLISHED", "CLOSED"] }, startsAt: { lte: new Date() } }) },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, status: true, dueAt: true },
        }),
        db.fileAsset.findMany({ where: { groupId: id, deletedAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, size: true } }),
      ])
    : [[], []];
  const full = g.capacity !== null && g._count.members >= g.capacity;

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/groups">{tl("Sınıflar ve etkinlikler")}</Link> · {g.kind === "CLASS" ? tl("Sınıf") : tl("Etkinlik")}</div>
        <h1 className="page-title">{g.name}</h1>
        <p className="page-sub">
          {g.kind === "EVENT" && <>{g.startsAt ? formatDateTime(g.startsAt, s.timezone, tl.intl) : tl("tarih belirsiz")}{g.endsAt && ` – ${formatDateTime(g.endsAt, s.timezone, tl.intl)}`}{g.location && ` · ${g.location}`} · </>}
          {g._count.members}{g.capacity !== null ? ` / ${g.capacity}` : ""}{" "}{tl("üye · {v0}", { v0: g.createdBy?.displayName ?? "—" })}
        </p>
      </div>
      {g.description && <div className="card"><div className="card-b prose-plain">{g.description}</div></div>}
      {!staff && g.kind === "EVENT" && g.selfJoin && <div><JoinButton id={g.id} joined={g.isMember} full={full} /></div>}

      {canSee && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <section className="card">
            <div className="card-h"><h2>{tl("Görevler")}</h2>{staff && <Link className="small" href="/teach/tasks/new">{tl("+ Yeni görev")}</Link>}</div>
            <div className="card-b">
              {tasks.length ? (
                <ul className="list-tight">
                  {tasks.map((t) => (
                    <li key={t.id}>
                      <span style={{ flex: 1, minWidth: 0 }}><Link href={staff ? `/teach/tasks/${t.id}` : `/tasks/${t.id}`}>{t.title}</Link></span>
                      {staff && <span className={ASSIGNMENT_STATUS[t.status]!.cls}>{tl(ASSIGNMENT_STATUS[t.status]!.label)}</span>}
                      <span className="tiny faint">{t.dueAt ? formatDateTime(t.dueAt, s.timezone, tl.intl) : ""}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="small muted" style={{ margin: 0 }}>{tl("Bu gruba hedeflenmiş görev yok.")}</p>}
            </div>
          </section>
          <section className="card">
            <div className="card-h"><h2>{tl("Dosyalar")}</h2>{staff && <Link className="small" href="/files">{tl("+ Dosya paylaş")}</Link>}</div>
            <div className="card-b"><FileList files={files} empty={tl("Bu gruba paylaşılmış dosya yok.")} /></div>
          </section>
        </div>
      )}

      {g.canEdit && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <section className="card">
            <div className="card-h"><h2>{tl("Üyeler")}</h2><span className="badge">{g._count.members}</span></div>
            <div className="card-b"><MembersEditor id={g.id} initial={g.members.map((m) => m.user.username)} /></div>
          </section>
          <div className="stack">
            <GroupForm id={g.id} initial={groupValues(g)} />
            <div><ArchiveGroup id={g.id} /></div>
          </div>
        </div>
      )}
      <GroupExtras groupId={g.id} kind={g.kind} canSee={canSee} isMember={g.isMember} staff={staff} canEdit={g.canEdit} full={full} timezone={s.timezone} userId={user.id} endsAt={g.endsAt} startsAt={g.startsAt} />
      {staff && !g.canEdit && g.members.length > 0 && (
        <section className="card">
          <div className="card-h"><h2>{tl("Üyeler")}</h2></div>
          <div className="card-b small">{g.members.map((m) => m.user.displayName).join(", ")}</div>
        </section>
      )}
    </div>
  );
}
