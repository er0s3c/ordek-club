"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Monitor } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type S = { id: string; userAgent: string; current: boolean; createdAt: string; lastSeenAt: string };

// Kaba cihaz adı (yalnız görüntüleme): tarayıcı + işletim sistemi
function device(ua: string) {
  if (!ua) return "Bilinmeyen cihaz";
  const b = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : ua.slice(0, 24);
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${b} · ${os}` : b;
}

export function SessionsCard({ items }: { items: S[] }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast("ok", ok);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const others = items.filter((x) => !x.current).length;
  return (
    <section className="card" aria-labelledby="sess-h">
      <div className="card-h">
        <h2 id="sess-h"><Monitor size={15} aria-hidden />{" "}{t("Açık oturumlar")}</h2>
        {others > 0 && <button className="btn btn-sm" disabled={busy} onClick={() => run(() => api("/api/account/sessions", { method: "DELETE" }), t("Diğer cihazlardan çıkış yapıldı."))}>{t("Diğerlerini kapat")}</button>}
      </div>
      <div className="card-b"><ul className="list-tight">
        {items.map((x) => (
          <li key={x.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{device(x.userAgent)}</strong>{x.current && <span className="badge badge-lime" style={{ marginLeft: 6 }}>{t("bu cihaz")}</span>}
              <div className="tiny faint">{t("açıldı {createdAt} · son {lastSeenAt}", { createdAt: x.createdAt, lastSeenAt: x.lastSeenAt })}</div>
            </div>
            {!x.current && (
              <button className="btn btn-sm btn-ghost" disabled={busy} aria-label={t("Bu oturumu kapat")} onClick={() => run(() => api(`/api/account/sessions/${x.id}`, { method: "DELETE" }), t("Oturum kapatıldı."))}>
                <LogOut size={14} aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul></div>
    </section>
  );
}

export function EmailPref({ initial, mode }: { initial: boolean; mode: "smtp" | "file" | "off" }) {
  const t = useT();
  const toast = useToast();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <section className="card" aria-labelledby="mail-h">
      <div className="card-h"><h2 id="mail-h">{t("E-posta bildirimleri")}</h2></div>
      <div className="card-b stack-sm">
        <label className="check">
          <input type="checkbox" checked={on} disabled={busy} onChange={async (e) => {
            const v = e.target.checked;
            setBusy(true);
            try {
              await api("/api/account/preferences", { method: "PATCH", body: { emailNotifications: v } });
              setOn(v);
              toast("ok", v ? t("E-posta bildirimleri açık.") : t("E-posta bildirimleri kapalı."));
            } catch (err) {
              toast("error", (err as Error).message);
            } finally {
              setBusy(false);
            }
          }} />
          {t("Yeni görev, değerlendirme sonucu ve duyurular e-postama da gelsin")}
        </label>
        <p className="tiny faint" style={{ margin: 0 }}>
          {mode === "off" ? t("Bu kulüpte e-posta gönderimi yapılandırılmamış; bildirimler yalnız uygulama içinde görünür.") : t("Parola sıfırlama e-postaları bu tercihten bağımsız gönderilir.")}
        </p>
      </div>
    </section>
  );
}
