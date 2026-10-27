"use client";

// Başlıktaki zil ikonunun önizlemesi: son bildirimler, okunmamış sayısı ve "tümünü okundu say".
// Veri yalnız panel ilk açıldığında bir kez çekilir (/api/notifications); panel kapanınca önbellek korunur,
// böylece fareyle üzerine gelmek ağ isteği üretmez. Okundu işaretlemek üst başlıktaki sayacı da tazeler.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ClipboardList, Inbox, Loader2, Megaphone, Star, Upload } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { translateClient, useT } from "@/i18n/client";

type Item = { id: string; type: string; title: string; body: string; link: string | null; readAt: string | null; createdAt: string };

const ICON: Record<string, typeof Bell> = { ANNOUNCEMENT: Megaphone, ASSIGNMENT: ClipboardList, REVIEW: Star, SUBMISSION: Upload, SYSTEM: Bell };
const PREVIEW_LIMIT = 5;

// "3 dk önce" / "3 minutes ago": Intl.RelativeTimeFormat dili ve çoğullamayı kendisi halleder.
function relative(iso: string, locale: string, now: number) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["day", 86_400_000], ["hour", 3_600_000], ["minute", 60_000]];
  for (const [unit, ms] of units) if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  return rtf.format(Math.round(diff / 1000), "second");
}

export function NotificationPreview({ href, count, onNavigate }: { href: string; count: number; onNavigate: () => void }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [unread, setUnread] = useState(count);
  const [busy, setBusy] = useState(false);
  // Sunucudan gelen zaman damgaları sabit; "3 dk önce" metni panel açıldığı andaki ana göre hesaplanır.
  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    let alive = true;
    api<{ items: Item[]; unread: number }>("/api/notifications")
      .then((r) => {
        if (!alive) return;
        setItems(r.items);
        setUnread(r.unread);
      })
      .catch((e) => {
        if (!alive) return;
        setItems([]);
        toast("error", (e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [toast]);

  async function markAll() {
    setBusy(true);
    try {
      const r = await api<{ unread: number }>("/api/notifications", { body: { ids: "all" } });
      setUnread(r.unread);
      setItems((list) => (list ?? []).map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      router.refresh(); // üst başlıktaki nokta/sayaç
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function markOne(id: string) {
    setItems((list) => (list ?? []).map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await api("/api/notifications", { body: { ids: [id] } });
      router.refresh();
    } catch {
      /* sayaç bir sonraki açılışta düzelir; gezinmeyi engellemiyoruz */
    }
  }

  const shown = (items ?? []).slice(0, PREVIEW_LIMIT);

  return (
    <div className="npre">
      <div className="npre-head">
        <strong>{t("Bildirimler")}</strong>
        {unread > 0 && <span className="hdr-count">{unread}</span>}
        {unread > 0 && (
          <button type="button" className="btn btn-sm btn-ghost npre-all" onClick={markAll} disabled={busy}>
            {busy ? <Loader2 size={13} className="spin" aria-hidden /> : <CheckCheck size={13} aria-hidden />}
            <span>{t("Tümünü okundu say")}</span>
          </button>
        )}
      </div>

      {items === null ? (
        <p className="npre-empty" aria-live="polite">
          <Loader2 size={15} className="spin" aria-hidden /> {t("Bildirimler yükleniyor…")}
        </p>
      ) : shown.length === 0 ? (
        <p className="npre-empty">
          <Inbox size={20} aria-hidden /> {t("Yeni bildirim yok.")}
        </p>
      ) : (
        <ul className="npre-list">
          {shown.map((n) => {
            const Icon = ICON[n.type] ?? Bell;
            const isUnread = !n.readAt;
            const target = n.link ?? href;
            return (
              <li key={n.id}>
                <Link
                  href={target}
                  className={isUnread ? "npre-item is-unread" : "npre-item"}
                  onClick={() => {
                    if (isUnread) void markOne(n.id);
                    onNavigate();
                  }}
                >
                  <span className="npre-icon" aria-hidden>
                    <Icon size={14} />
                  </span>
                  <span className="npre-body">
                    <span className="npre-title">{translateClient(n.title)}</span>
                    {n.body && <span className="npre-text">{translateClient(n.body)}</span>}
                    <span className="npre-time" title={new Date(n.createdAt).toLocaleString(t.intl)}>
                      {relative(n.createdAt, t.locale, now)}
                    </span>
                  </span>
                  {isUnread && <span className="npre-dot" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link href={href} className="npre-foot" onClick={onNavigate}>
        {t("Tüm bildirimler")}
      </Link>
    </div>
  );
}
