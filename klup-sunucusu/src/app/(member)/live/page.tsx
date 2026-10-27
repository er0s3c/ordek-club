import type { Metadata } from "next";
import Link from "next/link";
import { Radio } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { listActiveSessions } from "@/server/live/service";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { JoinForm } from "./JoinForm";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Canlı ders") };
}

export default async function LiveIndex() {
  const t = await getT();
  await requirePageSession();
  const [sessions, s] = await Promise.all([listActiveSessions(), getSettings()]);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Canlı ders")}</div>
        <h1 className="page-title">{t("Derse katıl")}</h1>
        <p className="page-sub">{t("Eğitmenin ekranındaki 6 haneli kodu gir ya da QR kodu telefonunla okut.")}</p>
      </div>
      <div className="grid-2">
        <section className="card"><div className="card-b"><JoinForm /></div></section>
        <section className="card" aria-labelledby="active-h">
          <div className="card-h"><h2 id="active-h">{t("Şu an devam eden dersler")}</h2></div>
          <div className="card-b">
            {sessions.length === 0 ? (
              <div className="empty" style={{ padding: 16 }}><Radio size={26} aria-hidden /><div>{t("Şu anda canlı ders yok.")}</div></div>
            ) : (
              <ul className="list-tight">
                {sessions.map((x) => (
                  <li key={x.id}>
                    <span className="dot on" aria-hidden />
                    <span style={{ flex: 1 }}>
                      <strong>{x.title}</strong>
                      <div className="tiny faint">{t("{v0} · {v1} · {online} çevrimiçi", { v0: x.host?.displayName ?? "—", v1: formatDateTime(x.startedAt, s.timezone, t.intl), online: x.online })}</div>
                    </span>
                    <Link className="btn btn-sm btn-primary" href={`/live/${x.code}`}>{t("Katıl")}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
