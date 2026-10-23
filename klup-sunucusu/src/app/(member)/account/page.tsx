import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDate, formatDateTime } from "@/components/ui/format";
import { PasswordForm } from "./PasswordForm";
import { EmailPref, SessionsCard } from "./AccountClient";
import { listSessions } from "@/server/auth/account";
import { mailMode } from "@/server/mail/outbox";

export const metadata: Metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const { user, sessionId } = await requirePageSession();
  const s = await getSettings();
  const m = getMessages(s.locale);
  const me = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { emailNotifications: true, email: true, studentNumber: true, department: true, joinedAt: true, createdAt: true, lastLoginAt: true, passwordChangedAt: true, _count: { select: { sessions: true } } },
  });
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{m.nav.account}</div>
        <h1 className="page-title">{user.displayName}</h1>
        <p className="page-sub mono">@{user.username}</p>
      </div>
      <div className="grid-2">
        <section className="card" aria-labelledby="profile-h">
          <div className="card-h"><h2 id="profile-h">{m.account.profile}</h2></div>
          <div className="card-b">
            <dl className="kv">
              <dt>{m.auth.email}</dt><dd>{me.email}</dd>
              <dt>Rol</dt><dd>{m.roles[user.role]}</dd>
              {me.studentNumber && <><dt>{m.auth.studentNumber}</dt><dd>{me.studentNumber}</dd></>}
              {me.department && <><dt>{m.auth.department}</dt><dd>{me.department}</dd></>}
              <dt>{m.account.memberSince}</dt><dd>{formatDate(me.joinedAt ?? me.createdAt, s.timezone)}</dd>
              <dt>{m.account.lastLogin}</dt><dd>{formatDateTime(me.lastLoginAt, s.timezone)}</dd>
              <dt>Parola değişimi</dt><dd>{formatDateTime(me.passwordChangedAt, s.timezone)}</dd>
              <dt>Açık oturum</dt><dd>{me._count.sessions}</dd>
            </dl>
          </div>
        </section>
        <section className="card" aria-labelledby="pw-h">
          <div className="card-h"><h2 id="pw-h">{m.account.changePassword}</h2></div>
          <div className="card-b"><PasswordForm /></div>
        </section>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <SessionsCard
          items={(await listSessions({ id: user.id, role: user.role, status: user.status }, sessionId)).map((x) => ({ id: x.id, userAgent: x.userAgent ?? "", current: x.current, createdAt: formatDateTime(x.createdAt, s.timezone), lastSeenAt: formatDateTime(x.lastSeenAt, s.timezone) }))}
        />
        <EmailPref initial={me.emailNotifications} mode={mailMode()} />
      </div>
    </div>
  );
}
