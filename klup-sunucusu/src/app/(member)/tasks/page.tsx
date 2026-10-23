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

export const metadata: Metadata = { title: "Görevler" };

export default async function TasksPage() {
  const { user } = await requirePageSession();
  if (isStaff(user.role)) redirect("/teach/tasks");
  const [items, s] = await Promise.all([listAssignmentsForStudent({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const now = Date.now();
  const open = items.filter((a) => a.status === "PUBLISHED" && (!a.mine || a.mine.status === "RETURNED"));
  const rest = items.filter((a) => !open.includes(a));

  const Row = ({ a }: { a: (typeof items)[number] }) => {
    const past = a.dueAt && a.dueAt.getTime() < now;
    return (
      <tr>
        <td><Link href={`/tasks/${a.id}`}><strong>{a.title}</strong></Link><div className="tiny faint">{KIND_LABEL[a.kind]} · {DIFFICULTY_LABEL[a.difficulty]}</div></td>
        <td className={past ? "small text-warn" : "small"}>{a.dueAt ? formatDateTime(a.dueAt, s.timezone) : "—"}{past && a.status === "PUBLISHED" && <div className="tiny">{a.allowLate ? "geç teslim kabul" : "süre doldu"}</div>}</td>
        <td>{a.mine ? <span className={SUBMISSION_STATUS[a.mine.status]!.cls}>{SUBMISSION_STATUS[a.mine.status]!.label}</span> : a.status === "CLOSED" ? <span className="badge">kapalı</span> : <span className="badge badge-blue">teslim edilmedi</span>}</td>
        <td className="num mono small">{a.mine?.score ?? "—"}/{a.maxScore}</td>
      </tr>
    );
  };

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Sınıf</div>
        <h1 className="page-title">Görevler</h1>
        <p className="page-sub">Eğitmenlerin verdiği görevler. XP, teslimin eğitmen tarafından onaylanmasından sonra hesabına eklenir.</p>
      </div>
      {!items.length ? (
        <div className="card"><div className="empty"><ClipboardList size={28} aria-hidden /><div>Şu an sana atanmış görev yok.</div></div></div>
      ) : (
        <>
          <section className="card" aria-labelledby="open-h">
            <div className="card-h"><h2 id="open-h">Yapılacaklar</h2><span className="badge badge-amber">{open.length}</span></div>
            {open.length ? (
              <div className="table-wrap"><table className="table"><thead><tr><th>Görev</th><th>Son teslim</th><th>Durum</th><th className="num">Puan</th></tr></thead><tbody>{open.map((a) => <Row key={a.id} a={a} />)}</tbody></table></div>
            ) : <div className="card-b"><p className="muted small" style={{ margin: 0 }}>Bekleyen görevin yok. 🎉</p></div>}
          </section>
          {rest.length > 0 && (
            <section className="card" aria-labelledby="done-h">
              <div className="card-h"><h2 id="done-h">Teslim edilenler ve kapananlar</h2></div>
              <div className="table-wrap"><table className="table"><thead><tr><th>Görev</th><th>Son teslim</th><th>Durum</th><th className="num">Puan</th></tr></thead><tbody>{rest.map((a) => <Row key={a.id} a={a} />)}</tbody></table></div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
