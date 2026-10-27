import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isStaff } from "@/server/auth/policy";
import { listAssignmentsForStudent } from "@/server/classroom/assignments";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { DIFFICULTY_LABEL, KIND_LABEL, SUBMISSION_STATUS } from "@/components/classroom/labels";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görevler") };
}

export default async function TasksPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  if (isStaff(user.role)) redirect("/teach/tasks");
  const [items, s] = await Promise.all([listAssignmentsForStudent({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const now = Date.now();
  const open = items.filter((a) => a.status === "PUBLISHED" && (!a.mine || a.mine.status === "RETURNED"));
  const rest = items.filter((a) => !open.includes(a));

  const Row = async ({ a }: { a: (typeof items)[number] }) => {
    const t = await getT();
    const past = a.dueAt && a.dueAt.getTime() < now;
    return (
      <tr>
        <td><Link href={`/tasks/${a.id}`}><strong>{a.title}</strong></Link><div className="tiny faint">{t(KIND_LABEL[a.kind])} · {t(DIFFICULTY_LABEL[a.difficulty])}</div></td>
        <td className={past ? "small text-warn" : "small"}>{a.dueAt ? formatDateTime(a.dueAt, s.timezone, t.intl) : "—"}{past && a.status === "PUBLISHED" && <div className="tiny">{a.allowLate ? t("geç teslim kabul") : t("süre doldu")}</div>}</td>
        <td>{a.mine ? <span className={SUBMISSION_STATUS[a.mine.status]!.cls}>{t(SUBMISSION_STATUS[a.mine.status]!.label)}</span> : a.status === "CLOSED" ? <span className="badge">{t("kapalı")}</span> : <span className="badge badge-blue">{t("teslim edilmedi")}</span>}</td>
        <td className="num mono small">{a.mine?.score ?? "—"}/{a.maxScore}</td>
      </tr>
    );
  };

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Sınıf")}</div>
        <h1 className="page-title">{t("Görevler")}</h1>
        <p className="page-sub">{t("Eğitmenlerin verdiği görevler. XP, teslimin eğitmen tarafından onaylanmasından sonra hesabına eklenir.")}</p>
      </div>
      {!items.length ? (
        <div className="card"><div className="empty"><ClipboardList size={28} aria-hidden /><div>{t("Şu an sana atanmış görev yok.")}</div></div></div>
      ) : (
        <>
          <section className="card" aria-labelledby="open-h">
            <div className="card-h"><h2 id="open-h">{t("Yapılacaklar")}</h2><span className="badge badge-amber">{open.length}</span></div>
            {open.length ? (
              <div className="table-wrap"><table className="table"><thead><tr><th>{t("Görev")}</th><th>{t("Son teslim")}</th><th>{t("Durum")}</th><th className="num">{t("Puan")}</th></tr></thead><tbody>{open.map((a) => <Row key={a.id} a={a} />)}</tbody></table></div>
            ) : <div className="card-b"><p className="muted small" style={{ margin: 0 }}>{t("Bekleyen görevin yok. 🎉")}</p></div>}
          </section>
          {rest.length > 0 && (
            <section className="card" aria-labelledby="done-h">
              <div className="card-h"><h2 id="done-h">{t("Teslim edilenler ve kapananlar")}</h2></div>
              <div className="table-wrap"><table className="table"><thead><tr><th>{t("Görev")}</th><th>{t("Son teslim")}</th><th>{t("Durum")}</th><th className="num">{t("Puan")}</th></tr></thead><tbody>{rest.map((a) => <Row key={a.id} a={a} />)}</tbody></table></div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
