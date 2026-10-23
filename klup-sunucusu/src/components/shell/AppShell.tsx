"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, LogOut, Menu, X, ArrowLeft, Radio, Presentation, GraduationCap, Trophy, Medal, Gauge,
  ClipboardList, FolderOpen, Megaphone, Bell, HardDrive, School, BarChart3, PenTool, KeyRound, ChevronDown,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { initials } from "@/components/ui/format";

const ICONS = { Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, ArrowLeft, Radio, Presentation, GraduationCap, Trophy, Medal, Gauge, ClipboardList, FolderOpen, Megaphone, Bell, HardDrive, School, BarChart3, PenTool, KeyRound };
export type NavIcon = keyof typeof ICONS;
export type NavItem = { href: string; label: string; icon: NavIcon; count?: number; exact?: boolean };
// Etiketsiz grup → başlıkta tek tek bağlantı; etiketli grup → açılır menü.
export type NavGroup = { label?: string; items: NavItem[] };

type Props = {
  brand: ReactNode;
  groups: NavGroup[];
  user: { displayName: string; username: string; role: Role };
  userMenu?: NavItem[];
  bell?: { href: string; count: number };
  home?: string;
  children: ReactNode;
};

const total = (items: NavItem[]) => items.reduce((a, i) => a + (i.count ?? 0), 0);

// Üst başlıklı kabuk (kenar çubuğu yok): logo · ana menü (açılır gruplar) · bildirim · kullanıcı menüsü.
export function AppShell({ brand, groups, user, userMenu = [], bell, home = "/dashboard", children }: Props) {
  const m = useMessages();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // Sayfa değişince menüler kapanır.
  useEffect(() => {
    setMobile(false);
    setMenu(null);
  }, [pathname]);

  // Dışarı tıklayınca ya da Esc ile açılır menü kapanır.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  async function logout() {
    setLeaving(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
      setLeaving(false);
    }
  }

  const isActive = (it: NavItem) => (it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/"));
  const toggle = (key: string) => setMenu((cur) => (cur === key ? null : key));

  const link = (it: NavItem, cls: string) => {
    const Icon = ICONS[it.icon];
    return (
      <Link key={it.href} href={it.href} className={cls} aria-current={isActive(it) ? "page" : undefined}>
        <Icon size={15} aria-hidden />
        <span>{it.label}</span>
        {it.count ? <span className="hdr-count">{it.count}</span> : null}
      </Link>
    );
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#main">{m.nav.skip}</a>
      <header className="hdr">
        <div className="hdr-in" ref={bar}>
          <Link href={home} className="hdr-brand" aria-label="Ana sayfa">{brand}</Link>

          <nav className="hdr-nav" aria-label="Ana menü">
            {groups.map((g, gi) =>
              g.label ? (
                <div key={gi} className="hdr-dd" data-open={menu === g.label}>
                  <button
                    type="button"
                    className="hdr-link"
                    aria-expanded={menu === g.label}
                    aria-controls={`dd-${gi}`}
                    data-active={g.items.some(isActive)}
                    onClick={() => toggle(g.label!)}
                  >
                    <span>{g.label}</span>
                    {total(g.items) > 0 && <span className="hdr-count">{total(g.items)}</span>}
                    <ChevronDown size={13} aria-hidden className="hdr-caret" />
                  </button>
                  {menu === g.label && (
                    <div id={`dd-${gi}`} className="hdr-menu">
                      {g.items.map((it) => link(it, "hdr-menu-item"))}
                    </div>
                  )}
                </div>
              ) : (
                g.items.map((it) => link(it, "hdr-link"))
              ),
            )}
          </nav>

          <div className="hdr-end">
            {bell && (
              <Link href={bell.href} className="hdr-icon" aria-label={`Bildirimler${bell.count ? ` (${bell.count} okunmamış)` : ""}`} aria-current={isActive({ href: bell.href, label: "", icon: "Bell" }) ? "page" : undefined}>
                <Bell size={17} aria-hidden />
                {bell.count > 0 && <span className="hdr-dot" aria-hidden />}
              </Link>
            )}
            <div className="hdr-dd hdr-user" data-open={menu === "__user"}>
              <button type="button" className="hdr-avatar" aria-expanded={menu === "__user"} aria-controls="dd-user" onClick={() => toggle("__user")} aria-label={`Hesap menüsü: ${user.displayName}`}>
                <span className="avatar" aria-hidden>{initials(user.displayName)}</span>
                <ChevronDown size={13} aria-hidden className="hdr-caret" />
              </button>
              {menu === "__user" && (
                <div id="dd-user" className="hdr-menu hdr-menu-end">
                  <div className="hdr-me">
                    <strong>{user.displayName}</strong>
                    <span className="tiny faint">@{user.username} · {m.roles[user.role]}</span>
                  </div>
                  {userMenu.map((it) => link(it, "hdr-menu-item"))}
                  <button type="button" className="hdr-menu-item" onClick={logout} disabled={leaving}>
                    <LogOut size={15} aria-hidden /> <span>{m.nav.logout}</span>
                  </button>
                </div>
              )}
            </div>
            <button type="button" className="hdr-burger" aria-expanded={mobile} aria-controls="mnav" onClick={() => setMobile((o) => !o)}>
              {mobile ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              <span className="sr-only">{m.nav.menu}</span>
            </button>
          </div>
        </div>

        {/* Dar ekran: tüm menü tek panelde */}
        {mobile && (
          <nav id="mnav" className="mnav" aria-label="Menü">
            {groups.map((g, gi) => (
              <div key={gi} className="mnav-group">
                {g.label && <div className="mnav-label">{g.label}</div>}
                {g.items.map((it) => link(it, "mnav-link"))}
              </div>
            ))}
            <div className="mnav-group">
              <div className="mnav-label">{user.displayName}</div>
              {userMenu.map((it) => link(it, "mnav-link"))}
              <button type="button" className="mnav-link" onClick={logout} disabled={leaving}>
                <LogOut size={15} aria-hidden /> <span>{m.nav.logout}</span>
              </button>
            </div>
          </nav>
        )}
      </header>
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
