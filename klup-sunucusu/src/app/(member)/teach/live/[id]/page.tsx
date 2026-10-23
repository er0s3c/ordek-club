import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getHostedSession, getJoinInfo } from "@/server/live/service";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { HostConsole } from "./HostConsole";

export const metadata: Metadata = { title: "Canlı ders konsolu" };

export default async function HostConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const actor = { id: user.id, role: user.role, status: user.status };
  const { id } = await params;
  const s = await getHostedSession(actor, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!s) notFound();
  if (s.status === "ENDED") redirect(`/teach/sessions/${s.id}`);

  const info = await getJoinInfo(actor, s.code);
  const settings = await getSettings();
  const h = await headers();
  const base = settings.appUrl || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const joinUrl = `${base}/live/${s.code}`;
  // QR sunucuda üretilir (data: URL); istemciye harici kaynak yüklenmez.
  const qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 264, color: { dark: "#2e2e2e", light: "#ffffff" } });

  return <HostConsole sessionId={s.id} code={s.code} joinUrl={joinUrl} qr={qr} deck={info.deck} />;
}
