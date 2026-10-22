import { AppShell, type NavGroup } from "@/components/shell/AppShell";
import { BrandMark } from "@/components/ui/Brand";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { getSettings, publicSettings } from "@/server/settings";
import { getMessages } from "@/i18n";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePageSession();
  const s = publicSettings(await getSettings());
  const m = getMessages(s.locale);
  const groups: NavGroup[] = [
    {
      items: [
        { href: "/dashboard", label: m.nav.home, icon: "Home" },
        { href: "/live", label: m.nav.live, icon: "Radio" },
        ...(isStaff(user.role) ? [{ href: "/teach", label: m.nav.teach, icon: "Presentation" as const }] : []),
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
