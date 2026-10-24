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
  // TryHackMe tarzı üst menü: sık kullanılanlar doğrudan, sınıf ve eğitmen araçları açılır menüde.
  const groups: NavGroup[] = [
    {
      items: [
        { href: "/dashboard", label: m.nav.home, icon: "Home" },
        { href: "/academy", label: m.nav.academy, icon: "GraduationCap" },
        { href: "/live", label: m.nav.live, icon: "Radio" },
      ],
    },
    {
      label: m.nav.classroom,
      items: [
        { href: staff ? "/teach/tasks" : "/tasks", label: m.nav.tasks, icon: "ClipboardList", count: openTasks },
        { href: "/groups", label: m.nav.groups, icon: "School" },
        { href: "/files", label: m.nav.files, icon: "FolderOpen" },
        { href: "/announcements", label: m.nav.announcements, icon: "Megaphone" },
      ],
    },
    { items: [{ href: "/leaderboard", label: m.nav.leaderboard, icon: "Trophy" }] },
  ];
  if (staff)
    groups.push({
      label: m.nav.instructor,
      items: [
        { href: "/teach", label: m.nav.teach, icon: "Presentation", exact: true },
        { href: "/teach/analytics", label: m.nav.analytics, icon: "BarChart3" },
      ],
    });
  if (isAdmin(user.role)) groups.push({ items: [{ href: "/admin", label: m.nav.admin, icon: "Shield" }] });
  return (
    <AppShell
      user={user}
      groups={groups}
      bell={{ href: "/notifications", count: unread }}
      userMenu={[
        { href: `/u/${user.username}`, label: m.nav.profile, icon: "Medal" },
        { href: "/account", label: m.nav.account, icon: "UserRound" },
      ]}
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
