import type { Metadata } from "next";
import Link from "next/link";
import { Radio } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { listActiveSessions } from "@/server/live/service";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Canlı ders" };

export default async function LiveIndex() {
  await requirePageSession();
  const [sessions, s] = await Promise.all([listActiveSessions(), getSettings()]);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Canlı ders</div>
        <h1 className="page-title">Derse katıl</h1>
        <p className="page-sub">Eğitmenin ekranındaki 6 haneli kodu gir ya da QR kodu telefonunla okut.</p>
      </div>
      <div className="grid-2">
        <section className="card"><div className="card-b"><JoinForm /></div></section>
        <section className="card" aria-labelledby="active-h">
          <div className="card-h"><h2 id="active-h">Şu an devam eden dersler</h2></div>
          <div className="card-b">
            {sessions.length === 0 ? (
              <div className="empty" style={{ padding: 16 }}><Radio size={26} aria-hidden /><div>Şu anda canlı ders yok.</div></div>
            ) : (
              <ul className="list-tight">
                {sessions.map((x) => (
                  <li key={x.id}>
                    <span className="dot on" aria-hidden />
                    <span style={{ flex: 1 }}>
                      <strong>{x.title}</strong>
                      <div className="tiny faint">{x.host?.displayName ?? "—"} · {formatDateTime(x.startedAt, s.timezone)} · {x.online} çevrimiçi</div>
                    </span>
                    <Link className="btn btn-sm btn-primary" href={`/live/${x.code}`}>Katıl</Link>
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
