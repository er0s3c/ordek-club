// Oturum özeti ekleri: operasyon rol dağılımı ve dersi kaçıranlara özet bildirimi.
import { db } from "@/server/db";
import { scenario } from "@/server/learning/operation-scenario";
import { MissedSummaryForm } from "./MissedSummaryForm";
import { getT } from "@/i18n/server";

export async function RoleSummary({ operationId }: { operationId: string }) {
  const t = await getT();
  const parts = await db.operationParticipant.findMany({ where: { operationId }, include: { user: { select: { displayName: true } } } });
  if (!parts.length) return null;
  const roles = scenario.roles as readonly string[];
  const count = roles.map((_, r) => parts.reduce((a, p) => a + (p.roleHistory as { role: number }[]).filter((h) => h.role === r).length, 0));
  return (
    <section className="card" aria-labelledby="roles-h">
      <div className="card-h"><h2 id="roles-h">{t("Operasyon rol dağılımı")}</h2><span className="tiny faint">{roles.map((r, i) => `${r}: ${count[i]}`).join(" · ")}</span></div>
      <div className="card-b table-wrap">
        <table className="table">
          <thead><tr><th>{t("Öğrenci")}</th>{[1, 2].map((s) => <th key={s}>{t("{s}. aşama", { s })}</th>)}</tr></thead>
          <tbody>{parts.map((p) => { const h = p.roleHistory as { stage: number; role: number }[]; return <tr key={p.userId}><td>{p.user.displayName}</td>{[0, 1].map((s) => <td key={s}>{roles[h.find((x) => x.stage === s)?.role ?? -1] ?? "—"}</td>)}</tr>; })}</tbody>
        </table>
      </div>
    </section>
  );
}

export async function MissedSummaryButton({ sessionId }: { sessionId: string }) {
  const s = await db.liveSession.findUnique({ where: { id: sessionId }, select: { status: true } });
  if (s?.status !== "ENDED") return null;
  const groups = await db.classGroup.findMany({ where: { archivedAt: null, kind: "CLASS" }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <MissedSummaryForm sessionId={sessionId} groups={groups} />;
}
