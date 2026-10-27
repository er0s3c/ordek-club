import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { listLibrary } from "@/server/files/service";
import { groupOptions } from "@/server/classroom/groups";
import { getSettings } from "@/server/settings";
import { formatBytes, formatDate } from "@/components/ui/format";
import { SCOPE_LABEL } from "@/components/classroom/labels";
import { FileActions, UploadForm } from "./FilesClient";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Dosyalar") };
}

export default async function FilesPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  const actor = { id: user.id, role: user.role, status: user.status };
  const [items, s] = await Promise.all([listLibrary(actor), getSettings()]);
  const staff = isStaff(user.role);
  const groups = staff ? (await groupOptions()).map((g) => ({ id: g.id, name: g.name, kind: g.kind })) : [];
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Sınıf")}</div>
        <h1 className="page-title">{t("Dosyalar")}</h1>
        <p className="page-sub">{t("Eğitmenlerin paylaştığı ders notları, laboratuvar verileri ve görev ekleri. Her indirme yetki kontrolünden geçer.")}</p>
      </div>
      {staff && <UploadForm maxMb={s.maxUploadMb} groups={groups} />}
      <section className="card">
        {!items.length ? (
          <div className="empty"><FolderOpen size={28} aria-hidden /><div>{t("Paylaşılmış dosya yok.")}</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t("Dosya")}</th>{staff && <th>{t("Kapsam")}</th>}<th>{t("Paylaşan")}</th><th>{t("Tarih")}</th><th className="num">{t("Boyut")}</th><th /></tr></thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id}>
                    <td style={{ maxWidth: 360 }}>
                      <a href={`/api/files/${f.id}`} download style={{ overflowWrap: "anywhere" }}><strong>{f.name}</strong></a>
                      {f.description && <div className="tiny faint">{f.description}</div>}
                      {f.group && <div className="tiny"><Link href={`/groups/${f.group.id}`}>{t("Grup: {name}", { name: f.group.name })}</Link></div>}
                      {f.assignment && <div className="tiny"><Link href={staff ? `/teach/tasks/${f.assignment.id}` : `/tasks/${f.assignment.id}`}>{t("Görev: {title}", { title: f.assignment.title })}</Link></div>}
                    </td>
                    {staff && <td className="small">{t(SCOPE_LABEL[f.scope])}{f.scope === "USERS" && ` (${f._count.grants})`}</td>}
                    <td className="small">{f.owner?.displayName ?? "—"}</td>
                    <td className="small">{formatDate(f.createdAt, s.timezone, t.intl)}</td>
                    <td className="num mono small">{formatBytes(f.size)}</td>
                    <td><FileActions id={f.id} name={f.name} canDelete={isAdmin(user.role) || (staff && f.ownerId === user.id)} /></td>
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
