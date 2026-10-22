import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { assignableRoles, canManageMember, nextStatus, type MemberAction } from "@/server/auth/policy";
import { getMemberDetail } from "@/server/members";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDateTime } from "@/components/ui/format";
import { actionLabel } from "@/components/admin/audit-labels";
import { MemberActions } from "./MemberActions";

export const metadata: Metadata = { title: "Üye ayrıntısı" };

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user: me } = await requirePageSession(ADMIN_ROLES);
  const { id } = await params;
  if (!/^[a-z0-9]{1,64}$/i.test(id)) notFound();
  const detail = await getMemberDetail(id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!detail) notFound();
  const { user, activity } = detail;
  const s = await getSettings();
  const m = getMessages(s.locale);

  // Aynı politika fonksiyonları API'de de uygulanır; burada yalnızca hangi düğmelerin gösterileceğini belirler.
  const actor = { id: me.id, role: me.role, status: me.status };
  const manageable = canManageMember(actor, user);
  const actions = manageable
    ? (["approve", "reject", "disable", "enable"] as MemberAction[]).filter((a) => nextStatus(user.status, a) !== null)
    : [];
  const roles = manageable && user.status === "ACTIVE" ? assignableRoles(actor) : [];

  return (
    <div className="stack fade-up">
      <Link href="/admin/members" className="small row" style={{ gap: 6 }}><ArrowLeft size={14} aria-hidden /> Üyeler</Link>
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">{m.roles[user.role]} · {m.statuses[user.status]}</div>
          <h1 className="page-title">{user.displayName}</h1>
          <p className="page-sub mono">@{user.username}</p>
        </div>
      </div>
      <div className="grid-2">
        <section className="card" aria-labelledby="info-h">
          <div className="card-h"><h2 id="info-h">Bilgiler</h2></div>
          <div className="card-b stack">
            <dl className="kv">
              <dt>E-posta</dt><dd>{user.email}</dd>
              <dt>Öğrenci no</dt><dd>{user.studentNumber ?? "—"}</dd>
              <dt>Bölüm</dt><dd>{user.department ?? "—"}</dd>
              <dt>Kayıt</dt><dd>{formatDateTime(user.createdAt, s.timezone)}</dd>
              <dt>Katılım (onay)</dt><dd>{formatDateTime(user.joinedAt, s.timezone)}</dd>
              <dt>Son giriş</dt><dd>{user.lastLoginAt ? formatDateTime(user.lastLoginAt, s.timezone) : m.common.never}</dd>
              <dt>Açık oturum</dt><dd>{user._count.sessions}</dd>
              <dt>Davet</dt><dd>{user.invitation ? <>{user.invitation.label} <span className="mono faint">({user.invitation.codePrefix}…)</span></> : "—"}</dd>
              {user.reviewedBy && <><dt>İnceleyen</dt><dd>@{user.reviewedBy.username} · {formatDateTime(user.reviewedAt, s.timezone)}</dd></>}
              {user.reviewNote && <><dt>İnceleme notu</dt><dd>{user.reviewNote}</dd></>}
            </dl>
            {user.applicationNote && (
              <div>
                <div className="tiny faint" style={{ marginBottom: 4 }}>Başvuru notu</div>
                {/* React metni otomatik kaçışlar; kullanıcı girdisi HTML olarak yorumlanmaz. */}
                <blockquote className="alert" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{user.applicationNote}</blockquote>
              </div>
            )}
          </div>
        </section>
        <section className="card" aria-labelledby="act-h">
          <div className="card-h"><h2 id="act-h">İşlemler</h2></div>
          <div className="card-b">
            {manageable ? (
              <MemberActions memberId={user.id} name={user.displayName} actions={actions} roles={roles} currentRole={user.role} />
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {user.id === me.id ? "Kendi hesabını buradan yönetemezsin." : "Bu üyeyi yönetme yetkin yok (kurucu ya da senden yüksek/eşit rol)."}
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="card" aria-labelledby="hist-h">
        <div className="card-h"><h2 id="hist-h">Geçmiş</h2></div>
        <div className="card-b">
          {activity.length === 0 ? <div className="empty">Kayıt yok.</div> : (
            <ul className="timeline">
              {activity.map((a) => (
                <li key={a.id}>
                  <time dateTime={a.createdAt.toISOString()}>{formatDateTime(a.createdAt, s.timezone)}</time>
                  <span>{actionLabel(a.action)}{a.actor ? <span className="faint"> · @{a.actor.username}</span> : null}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
