import { featureEnabled } from "@/server/learning/features";
import { AppShell, type NavGroup } from "@/components/shell/AppShell";
import { BrandMark } from "@/components/ui/Brand";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { getSettings, publicSettings } from "@/server/settings";
import { unreadCount } from "@/server/classroom/notifications";
import { openTaskCount, pendingReviewCount } from "@/server/classroom/assignments";
import { enabledFeatures } from "@/server/learning/features";
import { A11yPrefs } from "@/components/shell/A11yPrefs";
import { db } from "@/server/db";
import { getT, getServerMessages } from "@/i18n/server";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const { user } = await requirePageSession();
  const s = publicSettings(await getSettings());
  const m = await getServerMessages();
  const staff = isStaff(user.role);
  const learning = await featureEnabled("learning");
  const labs = await featureEnabled("labs");
  const teacherTools = staff && await featureEnabled("teacher-tools");
  const community = await featureEnabled("community");
  const academyV2 = await featureEnabled("academy-v2");
  const f = await enabledFeatures(["study", "workshops", "teacher-plus", "club-ops", "operations"]);
  const prefs = await db.learningPreference.findUnique({ where: { userId: user.id }, select: { fontScale: true, lineHeight: true, readableFont: true, highContrast: true, reduceMotion: true } });
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
        { href: "/teach/issues", label: t("Sorun bildirimleri"), icon: "Bug" },
        ...(f["teacher-plus"]
          ? [
              { href: "/teach/queue", label: t("Değerlendirme kuyruğu"), icon: "Inbox" as const },
              { href: "/teach/insights", label: t("Sınıf içgörüleri"), icon: "Map" as const },
              { href: "/teach/content", label: t("İçerik merkezi"), icon: "CheckSquare" as const },
              { href: "/teach/planning", label: t("Planlama ve yoklama"), icon: "CalendarClock" as const },
              { href: "/teach/library", label: t("Kütüphane"), icon: "Library" as const },
              { href: "/teach/translations", label: t("Çeviri incelemesi"), icon: "Layers" as const },
            ]
          : []),
      ],
    });
  if (academyV2) groups[1]!.items.push({ href: "/academy/terms", label: t("Terimler · TR/EN"), icon: "GraduationCap" });
  groups[1]!.items.push({ href: "/academy/golge-ag", label: t("Gölge Ağ"), icon: "BookOpen" as const });
  if (community) groups[1]!.items.push({ href: "/academy/practice", label: t("Uygulama meydanı"), icon: "Trophy" }, { href: "/academy/ctf", label: t("CTF panosu"), icon: "Target" });
  if (teacherTools || (staff && community)) groups.push({ label: t("Ders araçları"), items: [...(teacherTools ? [{ href: "/teach/tools", label: t("Ders paketleri ve sorular"), icon: "Presentation" as const }, { href: "/teach/radar", label: t("Öğrenme radarı"), icon: "BarChart3" as const }] : []), ...(staff && community ? [{ href: "/teach/soc", label: t("Nöbet Masası senaryoları"), icon: "Shield" as const }] : [])] });
  if (labs) groups[1]!.items.push({ href: "/academy/labs", label: t("Komut Hattı"), icon: "HardDrive" });
  if (learning || f.study || f.workshops)
    groups.push({
      label: t("Öğrenme"),
      items: [
        ...(learning ? [{ href: "/academy/workspace", label: t("Öğrenme alanım"), icon: "GraduationCap" as const }, { href: "/academy/skills", label: t("Becerilerim"), icon: "Gauge" as const }] : []),
        ...(f.study ? [{ href: "/study", label: t("Çalışma merkezi"), icon: "Timer" as const }, { href: "/study/buddies", label: t("Çalışma arkadaşları"), icon: "Users2" as const }] : []),
        ...(f.workshops ? [{ href: "/academy/workshops", label: t("Atölyeler"), icon: "FlaskConical" as const }] : []),
        ...(community ? [{ href: "/academy/badges", label: t("Rozet yol haritası"), icon: "Target" as const }] : []),
        ...(learning && staff ? [{ href: "/teach/learning", label: t("Sınav dönemleri"), icon: "School" as const }] : []),
      ],
    });
  if (f["club-ops"])
    groups.push({
      label: t("Kulüp"),
      items: [
        { href: "/club", label: t("Kulüp panosu"), icon: "Boxes", exact: true },
        { href: "/club/events", label: t("Etkinlik takvimi"), icon: "CalendarClock" },
        { href: "/club/office-hours", label: t("Görüşme saatleri"), icon: "LifeBuoy" },
        { href: "/club/polls", label: t("Anketler"), icon: "Vote" },
        { href: "/club/tasks", label: t("Gönüllü görevler"), icon: "HandHeart" },
      ],
    });
  if (isAdmin(user.role)) groups.push({ items: [{ href: "/admin", label: m.nav.admin, icon: "Shield" }, { href: "/admin/features", label: t("Özellikler"), icon: "Settings" }] });
  const tasksHref = staff ? "/teach/tasks" : "/tasks";
  return (
    <AppShell
      user={user}
      groups={groups}
      bell={{ href: "/notifications", count: unread }}
      staff={staff}
      bottomNav={[
        { href: "/dashboard", label: m.nav.home, icon: "Home" },
        { href: "/academy", label: m.nav.academy, icon: "GraduationCap" },
        { href: tasksHref, label: m.nav.tasks, icon: "ClipboardList", count: openTasks },
        { href: `/u/${user.username}`, label: m.nav.profile, icon: "Medal" },
      ]}
      userMenu={[
        { href: `/u/${user.username}`, label: m.nav.profile, icon: "Medal" },
        { href: "/account", label: m.nav.account, icon: "UserRound" },
        { href: "/reports", label: t("Sorun bildirimlerim"), icon: "Bug" },
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
      <A11yPrefs prefs={prefs} />
      {children}
    </AppShell>
  );
}
