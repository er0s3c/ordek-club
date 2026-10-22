"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, LogOut, Menu, X, ArrowLeft, Radio, Presentation,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { initials } from "@/components/ui/format";

const ICONS = { Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, ArrowLeft, Radio, Presentation };
export type NavIcon = keyof typeof ICONS;
export type NavItem = { href: string; label: string; icon: NavIcon; count?: number; exact?: boolean };
export type NavGroup = { label?: string; items: NavItem[] };

type Props = {
  brand: ReactNode;
  groups: NavGroup[];
  user: { displayName: string; username: string; role: Role };
  children: ReactNode;
};

export function AppShell({ brand, groups, user, children }: Props) {
  const m = useMessages();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

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

  return (
    <div className="shell">
      <a className="skip-link" href="#main">{m.nav.skip}</a>
      <header className="topbar">
        <div className="row">{brand}</div>
        <button className="btn btn-ghost btn-sm" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          <span className="sr-only">{m.nav.menu}</span>
        </button>
      </header>
      {open && <div className="scrim" onClick={() => setOpen(false)} aria-hidden />}
      <aside id="sidebar" className="sidebar" data-open={open}>
        <div className="brand">{brand}</div>
        <nav className="nav" aria-label="Ana menü">
          {groups.map((g, gi) => (
            <div key={gi} className="nav">
              {g.label && <div className="nav-label">{g.label}</div>}
              {g.items.map((it) => {
                const Icon = ICONS[it.icon];
                return (
                  <Link key={it.href} href={it.href} aria-current={isActive(it) ? "page" : undefined}>
                    <Icon size={17} aria-hidden />
                    {it.label}
                    {it.count ? <span className="badge badge-amber count">{it.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="avatar" aria-hidden>{initials(user.displayName)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="small" style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</div>
              <div className="tiny faint">@{user.username} · {m.roles[user.role]}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout} disabled={leaving} style={{ justifyContent: "flex-start" }}>
            <LogOut size={16} aria-hidden /> {m.nav.logout}
          </button>
        </div>
      </aside>
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
