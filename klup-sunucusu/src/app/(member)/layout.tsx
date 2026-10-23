import { AppShell, type NavGroup } from "@/components/shell/AppShell";
import { BrandMark } from "@/components/ui/Brand";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { getSettings, publicSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { unreadCount } from "@/server/classroom/notifications";
import { openTaskCount, pendingReviewCount } from "@/server/classroom/assignments";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePageSession();
  const s = publicSettings(await getSettings());
  const m = getMessages(s.locale);
  const staff = isStaff(user.role);
  const actor = { id: user.id, role: user.role, status: user.status };
  const [unread, openTasks] = await Promise.all([unreadCount(user.id), staff ? pendingReviewCount(actor) : openTaskCount(actor)]);
  const groups: NavGroup[] = [
    {
      items: [
        { href: "/dashboard", label: m.nav.home, icon: "Home" },
        { href: "/academy", label: m.nav.academy, icon: "GraduationCap" },
        { href: staff ? "/teach/tasks" : "/tasks", label: m.nav.tasks, icon: "ClipboardList", count: openTasks },
        { href: "/live", label: m.nav.live, icon: "Radio" },
        { href: "/files", label: m.nav.files, icon: "FolderOpen" },
        { href: "/announcements", label: m.nav.announcements, icon: "Megaphone" },
        { href: "/notifications", label: m.nav.notifications, icon: "Bell", count: unread },
        { href: "/leaderboard", label: m.nav.leaderboard, icon: "Trophy" },
        { href: `/u/${user.username}`, label: m.nav.profile, icon: "Medal" },
        ...(staff ? [{ href: "/teach", label: m.nav.teach, icon: "Presentation" as const, exact: true }] : []),
        { href: "/account", label: m.nav.account, icon: "UserRound" },
      ],
    },
  ];
  if (isAdmin(user.role)) groups.push({ label: m.nav.admin, items: [{ href: "/admin", label: m.nav.admin, icon: "Shield" }] });
  return (
    <AppShell
      user={user}
      groups={groups}
      brand={
        <>
          <BrandMark settings={s} />
          <div>
            <div className="brand-name">{s.clubName}</div>
            {s.universityName && <div className="brand-sub">{s.universityName}</div>}
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
