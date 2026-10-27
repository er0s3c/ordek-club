import { createLabUpgradeHandler } from "@/server/learning/lab-ws";
import { processLearningReminders } from "@/server/learning/reminders";
import { publishScheduledAnnouncements } from "@/server/classroom/announcements";
// ============================================================================
//  Ördek Club — özel Node sunucusu
//  Next.js'i ve (Faz 2'de) aynı porttan WebSocket'i servis eder. Tek süreç, tek port.
//  Üretimde esbuild ile dist/server.js'e paketlenir (npm run build:server).
// ============================================================================
import "./src/server/load-env";
import http from "node:http";
import next from "next";
import { REMOTE_ADDR_HEADER } from "@/server/http";
import { rotateSetupToken, setupTokenFile } from "@/server/setup";
import { purgeExpiredSessions } from "@/server/auth/session";
import { sweep } from "@/server/rate-limit";
import { env } from "@/server/env";
import { createLiveUpgradeHandler } from "@/server/live/ws-server";
import { createStudioCollabHandler } from "@/server/studio/collab-ws";
import { hub } from "@/server/live/hub";
import { startMailer, stopMailer } from "@/server/mail/outbox";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3100);
const hostname = process.env.HOST ?? "0.0.0.0";

async function main() {
  env(); // yapılandırmayı erken doğrula: eksik .env'de anlaşılır hata ile dur
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    // Güvenilir istemci adresi: istemcinin gönderdiği aynı adlı başlık ezilir.
    req.headers[REMOTE_ADDR_HEADER] = req.socket.remoteAddress ?? "unknown";
    handle(req, res).catch((err) => {
      console.error("[club] istek işlenemedi", err);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
  server.headersTimeout = 30_000;
  server.requestTimeout = 60_000;

  // WebSocket: /ws/live canlı sınıfa, /ws/studio Studio ortak düzenlemeye, /ws/lab laba; diğer yükseltmeler (geliştirmede HMR) Next.js'e.
  const live = createLiveUpgradeHandler();
  const lab = createLabUpgradeHandler();
  const studio = createStudioCollabHandler();
  const nextUpgrade = app.getUpgradeHandler();
  server.on("upgrade", (req, socket, head) => {
    if (lab.handleUpgrade(req, socket, head)) return;
    if (live.handleUpgrade(req, socket, head)) return;
    if (studio.handleUpgrade(req, socket, head)) return;
    if (dev) return void nextUpgrade(req, socket, head);
    socket.destroy();
  });

  // Bakım: süresi dolmuş oturumlar ve hız sınırı kovaları
  const timer = setInterval(() => {
    sweep();
    purgeExpiredSessions().catch((err) => console.error("[club] oturum temizliği başarısız", err));
  }, 10 * 60_000);
  timer.unref();

  let learningBusy = false;
  const learningTimer = setInterval(() => {
    if (learningBusy) return; learningBusy = true;
    Promise.all([
      processLearningReminders().catch(() => console.error("[club] öğrenme hatırlatmaları işlenemedi")),
      publishScheduledAnnouncements().catch(() => console.error("[club] planlı duyurular yayınlanamadı")),
    ]).finally(() => { learningBusy = false; });
  }, 60_000);
  learningTimer.unref();
  server.listen(port, hostname, async () => {
    console.log(`[club] Ördek Club ${dev ? "(geliştirme)" : ""} http://${hostname}:${port} adresinde çalışıyor`);
    try {
      const token = await rotateSetupToken();
      if (token) {
        const line = "═".repeat(64);
        console.log(`\n${line}\n  İLK KURULUM GEREKLİ\n  Tarayıcıda /setup adresini aç ve şu kurulum anahtarını gir:\n\n      ${token}\n\n  (Ayrıca ${setupTokenFile()} dosyasına yazıldı; 24 saat geçerli.)\n${line}\n`);
      }
      startMailer();
    } catch (err) {
      console.error("[club] Veritabanına bağlanılamadı. DATABASE_URL ve migration'ları kontrol et.", err);
    }
  });

  const shutdown = async (sig: string) => {
    console.log(`[club] ${sig} alındı, kapanıyor…`);
    for (const client of lab.wss.clients) client.close(1012, "server restart");
    stopMailer();
    clearInterval(learningTimer);
    // Canlı derslerin durumunu ve katılım sürelerini kaybetmeden kapat
    await hub.checkpoint().catch((err) => console.error("[club] canlı ders verisi yazılamadı", err));
    for (const c of live.wss.clients) c.close(1012, "server restart"); // 1012: istemci yeniden bağlanır
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
