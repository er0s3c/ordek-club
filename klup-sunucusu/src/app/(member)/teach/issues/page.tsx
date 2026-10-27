import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { listIssues } from "@/server/issues";
import { IssueQueue } from "./IssueQueue";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sorun bildirimleri") };
}

export default async function TeachIssues() {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const rows = await listIssues({ id: user.id, role: user.role, status: user.status });
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen")}</div><h1 className="page-title">{t("Sorun bildirimleri")}</h1><p className="page-sub">{t("Öğrencilerin ders ve sistem hataları. Durumu güncellediğinde bildiren kişi bilgilendirilir.")}</p></header>
      <IssueQueue rows={rows.map((r) => ({ id: r.id, no: r.no, kind: r.kind, status: r.status, body: r.body, location: r.location, createdAt: r.createdAt.toISOString(), reporter: r.user?.displayName ?? "—", lesson: r.lesson, history: r.history }))} />
    </div>
  );
}
