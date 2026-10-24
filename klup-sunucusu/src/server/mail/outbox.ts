// Giden e-posta: istek yolu yalnız kuyruğa (EmailOutbox) yazar; arka plan işçisi gönderir ve yeniden dener.
// SMTP_HOST tanımlı değilse:
//   - geliştirme/test: e-postalar storage/mail/ altına .txt olarak yazılır (gerçek gönderim yok),
//   - üretim: e-posta özelliği kapalıdır (kuyruğa da yazılmaz).
import fs from "node:fs/promises";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { getSettings } from "@/server/settings";

type Tx = Prisma.TransactionClient | typeof db;
export type Mail = { to: string; subject: string; text: string };

const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3600_000];
const MAX_ATTEMPTS = BACKOFF_MS.length + 1;

export function mailMode(): "smtp" | "file" | "off" {
  const e = env();
  if (e.SMTP_HOST) return "smtp";
  return e.NODE_ENV === "production" ? "off" : "file";
}
export const mailEnabled = () => mailMode() !== "off";

// Başlık enjeksiyonuna karşı: konu ve alıcıda satır sonu olamaz.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function enqueueMail(tx: Tx, mails: Mail[]) {
  if (!mailEnabled() || !mails.length) return 0;
  const r = await tx.emailOutbox.createMany({
    data: mails.map((m) => ({ to: oneLine(m.to).slice(0, 254), subject: oneLine(m.subject).slice(0, 200), text: m.text.slice(0, 20_000) })),
  });
  return r.count;
}

let transport: Transporter | null = null;
function smtp(): Transporter {
  if (transport) return transport;
  const e = env();
  transport = nodemailer.createTransport({
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    secure: e.SMTP_SECURE === "1",
    requireTLS: e.SMTP_SECURE !== "1", // düz metin SMTP'ye düşülmez
    auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
  return transport;
}

async function deliver(m: { id: string; to: string; subject: string; text: string }) {
  const s = await getSettings();
  if (mailMode() === "file") {
    const dir = path.join(env().storageDir, "mail");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${m.id}.txt`), `To: ${m.to}\nSubject: ${m.subject}\n\n${m.text}\n`, { mode: 0o640 });
    return;
  }
  const from = env().SMTP_FROM || `${s.clubName} <no-reply@${new URL(env().APP_URL).hostname}>`;
  await smtp().sendMail({ from, to: m.to, subject: m.subject, text: m.text });
}

// Kuyruğu bir kez işler (işçi döngüsü ve testler çağırır). Tek süreçli kurulum: iddia (claim) için durum güncellemesi yeterli.
export async function processOutbox(limit = 20, now = new Date()) {
  if (!mailEnabled()) return { sent: 0, failed: 0 };
  const due = await db.emailOutbox.findMany({ where: { status: "PENDING", nextAttemptAt: { lte: now } }, orderBy: { createdAt: "asc" }, take: limit });
  let sent = 0;
  let failed = 0;
  for (const m of due) {
    try {
      await deliver(m);
      await db.emailOutbox.update({ where: { id: m.id }, data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 }, lastError: "" } });
      sent++;
    } catch (err) {
      const attempts = m.attempts + 1;
      const final = attempts >= MAX_ATTEMPTS;
      await db.emailOutbox.update({
        where: { id: m.id },
        data: { attempts, lastError: String((err as Error).message ?? err).slice(0, 500), status: final ? "FAILED" : "PENDING", nextAttemptAt: new Date(now.getTime() + (BACKOFF_MS[attempts - 1] ?? 0)) },
      });
      failed++;
    }
  }
  // Gönderilmiş kayıtlar 30 gün sonra silinir (kişisel veri minimizasyonu).
  await db.emailOutbox.deleteMany({ where: { status: "SENT", sentAt: { lt: new Date(now.getTime() - 30 * 86_400_000) } } });
  return { sent, failed };
}

let timer: NodeJS.Timeout | null = null;
export function startMailer(intervalMs = 10_000) {
  if (timer || !mailEnabled()) return;
  console.log(`[mail] e-posta işçisi başladı (${mailMode() === "smtp" ? "SMTP" : "dosyaya yazma — storage/mail/"})`);
  timer = setInterval(() => void processOutbox().catch((e) => console.error("[mail] kuyruk işlenemedi", e)), intervalMs);
  timer.unref();
}
export function stopMailer() {
  if (timer) clearInterval(timer);
  timer = null;
}
