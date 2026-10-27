"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, LogOut, Menu, X, ArrowLeft, Radio, Presentation, GraduationCap, Trophy, Medal, Gauge,
  ClipboardList, FolderOpen, Megaphone, Bell, HardDrive, School, BarChart3, PenTool, KeyRound, ChevronDown, Search, Keyboard,
  Timer, Users2, MessageCircleQuestion, FlaskConical, CalendarClock, LifeBuoy, Bug, Inbox, Map, CheckSquare, Boxes, Vote, HandHeart, Target, Library, Layers, BookOpen,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { initials } from "@/components/ui/format";
import { Drawer } from "@/components/ui/Drawer";
import { CommandPalette } from "./CommandPalette";
import { ShortcutHelp, useShortcuts } from "./Shortcuts";
import { visibleHeaderEntries } from "@/lib/header-layout";
import { AnimatePresence } from "motion/react";
import { HeaderPopup } from "@/components/motion/HeaderPopup";
import { NotificationPreview } from "./NotificationPreview";
import { useT } from "@/i18n/client";

const ICONS = { Home, UserRound, Shield, LayoutDashboard, Users, Ticket, Settings, ScrollText, Activity, ArrowLeft, Radio, Presentation, GraduationCap, Trophy, Medal, Gauge, ClipboardList, FolderOpen, Megaphone, Bell, HardDrive, School, BarChart3, PenTool, KeyRound, Timer, Users2, MessageCircleQuestion, FlaskConical, CalendarClock, LifeBuoy, Bug, Inbox, Map, CheckSquare, Boxes, Vote, HandHeart, Target, Library, Layers, BookOpen };
export type NavIcon = keyof typeof ICONS;
export type NavItem = { href: string; label: string; icon: NavIcon; count?: number; exact?: boolean };
// Etiketsiz grup → başlıkta tek tek bağlantı; etiketli grup → açılır menü.
export type NavGroup = { label?: string; items: NavItem[] };
type HeaderEntry = NavGroup & { id: string };

type Props = {
  brand: ReactNode;
  groups: NavGroup[];
  user: { displayName: string; username: string; role: Role };
  userMenu?: NavItem[];
  bell?: { href: string; count: number };
  home?: string;
  // Dar ekranda alttaki dört ana bağlantı (öğretmen araçları menüde kalır)
  bottomNav?: NavItem[];
  staff?: boolean;
  children: ReactNode;
};

const total = (items: NavItem[]) => items.reduce((a, i) => a + (i.count ?? 0), 0);

// Üst başlıklı kabuk (kenar çubuğu yok): logo · ana menü (açılır gruplar) · bildirim · kullanıcı menüsü.
export function AppShell({ brand, groups, user, userMenu = [], bell, home = "/dashboard", bottomNav, staff = false, children }: Props) {
  const t = useT();
  const m = useMessages();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const entries = useMemo(() => groups.flatMap<HeaderEntry>((group, index) => group.label
    ? [{ id: `group-${index}`, label: group.label, items: group.items }]
    : group.items.map((item, itemIndex) => ({ id: `group-${index}-${itemIndex}`, label: undefined, items: [item] }))), [groups]);
  const [visible, setVisible] = useState(0);
  const [searching, setSearching] = useState(false);
  const [help, setHelp] = useState(false);
  const openSearch = useCallback(() => { setMenu(null); setMobile(false); setSearching(true); }, []);
  const openHelp = useCallback(() => setHelp(true), []);
  useShortcuts({ onSearch: openSearch, onHelp: openHelp, staff });
  const pages = useMemo(() => [...groups.flatMap((g) => g.items), ...userMenu].map((i) => ({ href: i.href, label: i.label })), [groups, userMenu]);
  const shown = entries.slice(0, visible), overflow = entries.slice(visible);

  useLayoutEffect(() => {
    let disposed = false;
    const resize = () => {
      if (disposed || !nav.current || !measure.current || nav.current.clientWidth === 0) return;
      const widths = [...measure.current.querySelectorAll<HTMLElement>("[data-measure-entry]")].map(el => el.getBoundingClientRect().width);
      const more = measure.current.querySelector<HTMLElement>("[data-measure-more]")?.getBoundingClientRect().width ?? 110;
      setVisible(visibleHeaderEntries(widths, Math.floor(nav.current.clientWidth), Math.ceil(more)));
    };
    const observer = new ResizeObserver(resize);
    if (nav.current) observer.observe(nav.current);
    if (measure.current) observer.observe(measure.current);
    resize();
    void document.fonts.ready.then(resize);
    return () => { disposed = true; observer.disconnect(); };
  }, [entries]);

  useEffect(() => { setMenu(null); }, [visible]);

  useLayoutEffect(() => {
    const popup = bar.current?.querySelector<HTMLElement>("[data-header-popup]:not([inert])");
    if (!popup) return;
    const position = () => {
      popup.style.setProperty("--menu-offset", "0px");
      const rect = popup.getBoundingClientRect();
      const shift = Math.max(12 - rect.left, Math.min(0, document.documentElement.clientWidth - 12 - rect.left - popup.offsetWidth));
      popup.style.setProperty("--menu-offset", `${shift}px`);
    };
    position(); window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [menu]);

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
      if (e.key === "Escape") { bar.current?.querySelector<HTMLButtonElement>(`[data-menu-trigger="${menu}"]`)?.focus(); setMenu(null); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (!mobile) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMobile(false); burger.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobile]);

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
  const toggle = (key: string) => { setMobile(false); setMenu((cur) => (cur === key ? null : key)); };

  // Bildirim önizlemesi: fareyle üzerine gelince kısa gecikmeyle açılır, çekilince kapanır.
  // Dokunmatik/klavye cihazlarda yalnız tıklama ve klavye ile açılır.
  const bellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearBellTimer = useCallback(() => {
    if (bellTimer.current) { clearTimeout(bellTimer.current); bellTimer.current = null; }
  }, []);
  const hoverCapable = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const bellEnter = useCallback(() => {
    if (!hoverCapable()) return;
    clearBellTimer();
    bellTimer.current = setTimeout(() => setMenu("__bell"), 120);
  }, [clearBellTimer]);
  const bellLeave = useCallback(() => {
    if (!hoverCapable()) return;
    clearBellTimer();
    bellTimer.current = setTimeout(() => {
      const wrap = document.getElementById("dd-bell")?.parentElement ?? null;
      if (wrap && wrap.contains(document.activeElement)) return; // klavye odağı içerideyse açık kalsın
      setMenu((cur) => (cur === "__bell" ? null : cur));
    }, 260);
  }, [clearBellTimer]);
  useEffect(() => clearBellTimer, [clearBellTimer]);

  function onHeaderKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLButtonElement>("[data-menu-trigger]");
    if (trigger && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault(); setMenu(trigger.dataset.menuTrigger!);
      requestAnimationFrame(() => {
        const links = bar.current?.querySelectorAll<HTMLElement>("[data-header-popup]:not([inert]) a, [data-header-popup]:not([inert]) button:not(:disabled)");
        if (links?.length) links[event.key === "ArrowUp" ? links.length - 1 : 0]?.focus();
      });
    } else if (target.closest("[data-header-popup]") && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const links = [...(bar.current?.querySelectorAll<HTMLElement>("[data-header-popup]:not([inert]) a, [data-header-popup]:not([inert]) button:not(:disabled)") ?? [])];
      const index = links.indexOf(target);
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    }
  }

  const link = (it: NavItem, cls: string) => {
    const Icon = ICONS[it.icon];
    return (
      <Link key={it.href} href={it.href} className={cls} aria-current={isActive(it) ? "page" : undefined} onClick={() => { setMenu(null); setMobile(false); }}>
        <Icon size={15} aria-hidden />
        <span>{it.label}</span>
        {it.count ? <span className="hdr-count">{it.count}</span> : null}
      </Link>
    );
  };

  return (
    <div className={bottomNav ? "shell has-bnav" : "shell"}>
      <a className="skip-link" href="#main">{m.nav.skip}</a>
      <header className="hdr">
        <div className="hdr-in" ref={bar} onKeyDown={onHeaderKey}>
          <Link href={home} className="hdr-brand" aria-label={t("Ana sayfa")}>{brand}</Link>

          <nav className="hdr-nav" aria-label={t("Ana menü")} ref={nav}>
            {shown.map((g) =>
              g.label ? (
                <div key={g.id} className="hdr-dd" data-open={menu === g.id}>
                  <button
                    type="button"
                    className="hdr-link"
                    aria-expanded={menu === g.id}
                    aria-controls={`dd-${g.id}`}
                    data-menu-trigger={g.id}
                    data-active={g.items.some(isActive)}
                    onClick={() => toggle(g.id)}
                  >
                    <span>{g.label}</span>
                    {total(g.items) > 0 && <span className="hdr-count">{total(g.items)}</span>}
                    <ChevronDown size={13} aria-hidden className="hdr-caret" />
                  </button>
                  <AnimatePresence initial={false}>{menu === g.id && (
                    <HeaderPopup key={g.id} id={`dd-${g.id}`} className="hdr-menu">
                      {g.items.map((it) => link(it, "hdr-menu-item"))}
                    </HeaderPopup>
                  )}</AnimatePresence>
                </div>
              ) : (
                g.items.map((it) => link(it, "hdr-link"))
              ),
            )}
            {overflow.length > 0 && <div className="hdr-dd" data-open={menu === "__more"}>
              <button type="button" className="hdr-link" data-menu-trigger="__more" aria-expanded={menu === "__more"} aria-controls="dd-more" data-active={overflow.some(group => group.items.some(isActive))} onClick={() => toggle("__more")}>
                <span>{t("Diğer")}</span><ChevronDown size={13} aria-hidden className="hdr-caret" />
              </button>
              <AnimatePresence initial={false}>{menu === "__more" && <HeaderPopup key="more" id="dd-more" className="hdr-menu hdr-menu-end">
                {overflow.map(group => <div className="hdr-overflow-group" key={group.id}>{group.label && <div className="hdr-menu-label">{group.label}</div>}{group.items.map(it => link(it, "hdr-menu-item"))}</div>)}
              </HeaderPopup>}</AnimatePresence>
            </div>}
          </nav>
          <div className="hdr-measure" ref={measure} aria-hidden>
            {entries.map(entry => {
              const first = entry.items[0]!, Icon = ICONS[first.icon];
              return <span className="hdr-link" key={entry.id} data-measure-entry data-active={entry.items.some(isActive)}>
                {!entry.label && <Icon size={15} />}<span>{entry.label ?? first.label}</span>
                {total(entry.items)>0&&<span className="hdr-count">{total(entry.items)}</span>}{entry.label&&<ChevronDown size={13}/>}</span>;
            })}
            <span className="hdr-link" data-measure-more><span>{t("Diğer")}</span><ChevronDown size={13}/></span>
          </div>

          <div className="hdr-end">
            <button type="button" className="hdr-search" onClick={openSearch} aria-label={t("Ara (Ctrl+K)")}>
              <Search size={16} aria-hidden /><span>{t("Ara")}</span>
            </button>
            {bell && (
              <div
                className="hdr-dd hdr-bell"
                data-open={menu === "__bell"}
                onMouseEnter={bellEnter}
                onMouseLeave={bellLeave}
                onBlur={(e) => {
                  // Klavye odağı panelden tamamen çıkınca kapat (fare ile açılmış panel açık kalır).
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu((cur) => (cur === "__bell" ? null : cur));
                }}
              >
                <button
                  type="button"
                  className="hdr-icon"
                  data-menu-trigger="__bell"
                  data-active={pathname === bell.href || undefined}
                  aria-haspopup="true"
                  aria-expanded={menu === "__bell"}
                  aria-controls="dd-bell"
                  aria-label={t("Bildirimler{v0}", { v0: bell.count ? ` (${bell.count} okunmamış)` : "" })}
                  onClick={() => {
                    clearBellTimer();
                    // Fare ile açılmış panelde tıklama kapatmasın; dokunmatikte ikinci dokunuş kapatsın.
                    setMenu((cur) => (cur === "__bell" && !hoverCapable() ? null : "__bell"));
                  }}
                >
                  <Bell size={17} aria-hidden />
                  {bell.count > 0 && <span className="hdr-dot" aria-hidden />}
                </button>
                <AnimatePresence initial={false}>{menu === "__bell" && (
                  <HeaderPopup key="bell" id="dd-bell" className="hdr-menu hdr-menu-end hdr-bell-menu">
                    <NotificationPreview href={bell.href} count={bell.count} onNavigate={() => setMenu(null)} />
                  </HeaderPopup>
                )}</AnimatePresence>
              </div>
            )}
            <div className="hdr-dd hdr-user" data-open={menu === "__user"}>
              <button type="button" className="hdr-avatar" data-menu-trigger="__user" aria-expanded={menu === "__user"} aria-controls="dd-user" onClick={() => toggle("__user")} aria-label={t("Hesap menüsü: {displayName}", { displayName: user.displayName })}>
                <span className="avatar" aria-hidden>{initials(user.displayName)}</span>
                <ChevronDown size={13} aria-hidden className="hdr-caret" />
              </button>
              <AnimatePresence initial={false}>{menu === "__user" && (
                <HeaderPopup key="user" id="dd-user" className="hdr-menu hdr-menu-end">
                  <div className="hdr-me">
                    <strong>{user.displayName}</strong>
                    <span className="tiny faint">@{user.username} · {m.roles[user.role]}</span>
                  </div>
                  {userMenu.map((it) => link(it, "hdr-menu-item"))}
                  <button type="button" className="hdr-menu-item" onClick={() => { setMenu(null); setHelp(true); }}>
                    <Keyboard size={15} aria-hidden /> <span>{t("Klavye kısayolları")}</span>
                  </button>
                  <button type="button" className="hdr-menu-item" onClick={logout} disabled={leaving}>
                    <LogOut size={15} aria-hidden /> <span>{m.nav.logout}</span>
                  </button>
                </HeaderPopup>
              )}</AnimatePresence>
            </div>
            <button ref={burger} type="button" className="hdr-burger" aria-expanded={mobile} aria-controls="mnav" onClick={() => { setMenu(null); setMobile((o) => !o); }}>
              {mobile ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              <span className="sr-only">{m.nav.menu}</span>
            </button>
          </div>
        </div>

        {/* Dar ekran: tüm menü tek panelde */}
        <AnimatePresence initial={false}>{mobile && (
          <HeaderPopup key="mobile" id="mnav" className="mnav" mobile>
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
          </HeaderPopup>
        )}</AnimatePresence>
      </header>
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
      {bottomNav && (
        <nav className="bnav" aria-label={t("Alt menü")}>
          {bottomNav.map((it) => {
            const Icon = ICONS[it.icon];
            return (
              <Link key={it.href} href={it.href} aria-current={isActive(it) ? "page" : undefined}>
                <Icon size={20} aria-hidden />
                <span>{it.label}</span>
                {it.count ? <span className="hdr-count">{it.count}</span> : null}
              </Link>
            );
          })}
        </nav>
      )}
      <CommandPalette open={searching} onClose={() => setSearching(false)} pages={pages} />
      <Drawer open={help} onClose={() => setHelp(false)} title={t("Klavye kısayolları")}>
        <ShortcutHelp staff={staff} />
      </Drawer>
    </div>
  );
}
