import { AppShell, type NavGroup } from "@/components/shell/AppShell";
import { BrandMark } from "@/components/ui/Brand";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { db } from "@/server/db";
import { getSettings, publicSettings } from "@/server/settings";
import { getMessages } from "@/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = publicSettings(await getSettings());
  const m = getMessages(s.locale);
  const pending = await db.user.count({ where: { status: "PENDING" } });
  // Yalnızca çalışan ekranlar menüde: sonraki fazların ekranları hazır olduklarında eklenir.
  const groups: NavGroup[] = [
    {
      label: m.nav.admin,
      items: [
        { href: "/admin", label: m.nav.dashboard, icon: "LayoutDashboard", exact: true },
        { href: "/admin/members", label: m.nav.members, icon: "Users", count: pending },
        { href: "/admin/invitations", label: m.nav.invitations, icon: "Ticket" },
        { href: "/admin/academy", label: m.nav.academy, icon: "GraduationCap" },
        { href: "/admin/xp", label: m.nav.xp, icon: "Gauge" },
        { href: "/admin/badges", label: m.nav.badges, icon: "Medal" },
      ],
    },
    {
      label: "Sistem",
      items: [
        { href: "/admin/settings", label: m.nav.settings, icon: "Settings" },
        { href: "/admin/audit", label: m.nav.audit, icon: "ScrollText" },
        { href: "/admin/system", label: m.nav.system, icon: "Activity" },
      ],
    },
    { items: [{ href: "/dashboard", label: m.nav.backToApp, icon: "ArrowLeft" }] },
  ];
  return (
    <AppShell
      user={user}
      groups={groups}
      brand={
        <>
          <BrandMark settings={s} />
          <div>
            <div className="brand-name">{s.clubName}</div>
            <div className="brand-sub">Yönetim paneli</div>
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
