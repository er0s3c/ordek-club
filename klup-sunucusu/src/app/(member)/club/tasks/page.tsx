import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { canManageClassroom } from "@/server/auth/policy";
import { clubTasks } from "@/server/club/ops";
import { VolunteerBoard } from "./VolunteerBoard";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Gönüllü görevler") };
}

export default async function TasksPage() {
  const tl = await getT();
  const { user } = await requirePageSession();
  await pageFeature("club-ops");
  const rows = await clubTasks();
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{tl("Kulüp")}</div><h1 className="page-title">{tl("Gönüllü görevler")}</h1><p className="page-sub">{tl("Etkinlik hazırlığı, sunum, afiş, kurulum… Bir görevi üstlen, bitince işaretle. Gönüllülük XP üretmez; kulübe katkın profilinde görünür.")}</p></header>
      <VolunteerBoard userId={user.id} staff={canManageClassroom({ id: user.id, role: user.role, status: user.status })} rows={rows.map((t) => ({ id: t.id, title: t.title, description: t.description, dueAt: t.dueAt?.toISOString() ?? null, status: t.status, claimedBy: t.claimedBy ? { id: t.claimedBy.id, name: t.claimedBy.displayName } : null }))} />
    </div>
  );
}
