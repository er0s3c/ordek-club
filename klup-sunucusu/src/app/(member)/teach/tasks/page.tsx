import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { listAssignmentsForStaff } from "@/server/classroom/assignments";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { ASSIGNMENT_STATUS, KIND_LABEL } from "@/components/classroom/labels";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görev yönetimi") };
}

export default async function TeachTasksPage() {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const [items, s] = await Promise.all([listAssignmentsForStaff({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  return (
    <div className="stack fade-up">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow"><Link href="/teach">{t("Eğitmen paneli")}</Link></div>
          <h1 className="page-title">{t("Görev yönetimi")}</h1>
          <p className="page-sub">{t("Görev oluştur, öğrencilere ata, teslimleri ölçütlerle değerlendir. XP yalnızca onayda verilir.")}</p>
        </div>
        <Link className="btn btn-primary" href="/teach/tasks/new"><Plus size={16} aria-hidden />{" "}{t("Yeni görev")}</Link>
      </div>
      <section className="card">
        {!items.length ? (
          <div className="empty"><ClipboardList size={28} aria-hidden /><div>{t("Henüz görev yok.")}</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t("Görev")}</th><th>{t("Durum")}</th><th>{t("Son teslim")}</th><th>{t("Hedef")}</th><th className="num">{t("Teslim")}</th><th className="num">{t("Bekleyen")}</th></tr></thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/teach/tasks/${a.id}`}><strong>{a.title}</strong></Link>
                      <div className="tiny faint">{t(KIND_LABEL[a.kind])} · {a.createdBy?.displayName ?? "—"}{a.liveSession && <>{" "}{t("· canlı ders")}{" "}<span className="mono">{a.liveSession.code}</span></>}</div>
                    </td>
                    <td><span className={ASSIGNMENT_STATUS[a.status]!.cls}>{t(ASSIGNMENT_STATUS[a.status]!.label)}</span></td>
                    <td className="small">{a.dueAt ? formatDateTime(a.dueAt, s.timezone, t.intl) : "—"}</td>
                    <td className="small">{a.audience === "ALL" ? t("Tüm öğrenciler") : t("{targets} öğrenci", { targets: a._count.targets })}</td>
                    <td className="num mono">{a._count.submissions}</td>
                    <td className="num">{a.pending ? <span className="badge badge-amber">{a.pending}</span> : <span className="faint">0</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
