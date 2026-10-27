import { AppShell, type NavGroup } from "@/components/shell/AppShell";
import { BrandMark } from "@/components/ui/Brand";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { db } from "@/server/db";
import { getSettings, publicSettings } from "@/server/settings";
import { A11yPrefs } from "@/components/shell/A11yPrefs";
import { getT, getServerMessages } from "@/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = publicSettings(await getSettings());
  const m = await getServerMessages();
  const pending = await db.user.count({ where: { status: "PENDING" } });
  const prefs = await db.learningPreference.findUnique({ where: { userId: user.id }, select: { fontScale: true, lineHeight: true, readableFont: true, highContrast: true, reduceMotion: true } });
  // Yalnızca çalışan ekranlar menüde: sonraki fazların ekranları hazır olduklarında eklenir.
  const groups: NavGroup[] = [
    {
      items: [
        { href: "/admin", label: m.nav.dashboard, icon: "LayoutDashboard", exact: true },
        { href: "/admin/members", label: m.nav.members, icon: "Users", count: pending },
        { href: "/admin/invitations", label: m.nav.invitations, icon: "Ticket" },
      ],
    },
    {
      label: m.nav.content,
      items: [
        { href: "/admin/academy", label: m.nav.academy, icon: "GraduationCap" },
        { href: "/admin/xp", label: m.nav.xp, icon: "Gauge" },
        { href: "/admin/badges", label: m.nav.badges, icon: "Medal" },
      ],
    },
    {
      label: m.nav.systemGroup,
      items: [
        { href: "/admin/features", label: t("Özellik yönetimi"), icon: "Settings" },
        { href: "/admin/usage", label: t("Özellik kullanımı"), icon: "BarChart3" },
        { href: "/admin/settings", label: m.nav.settings, icon: "Settings" },
        { href: "/admin/audit", label: m.nav.audit, icon: "ScrollText" },
        { href: "/admin/system", label: m.nav.system, icon: "Activity" },
      ],
    },
  ];
  return (
    <AppShell
      user={user}
      groups={groups}
      home="/admin"
      userMenu={[{ href: "/dashboard", label: m.nav.backToApp, icon: "ArrowLeft" }]}
      brand={
        <>
          <BrandMark settings={s} />
          <div>
            <div className="brand-name">{s.clubName}</div>
            <div className="brand-sub">{t("Yönetim paneli")}</div>
          </div>
        </>
      }
    >
      <A11yPrefs prefs={prefs} />{children}
    </AppShell>
  );
}
