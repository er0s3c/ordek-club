// Yönetim komut satırı aracı (konteyner içinde: node dist/cli.js <komut>).
import "./src/server/load-env";
import { db } from "@/server/db";
import { rotateSetupToken } from "@/server/setup";
import { importAcademy } from "@/server/academy/importer";

const commands: Record<string, { help: string; run: (args: string[]) => Promise<void> }> = {
  "setup-token": {
    help: "Kurulum tamamlanmadıysa yeni bir tek seferlik kurulum anahtarı üretir ve gösterir.",
    async run() {
      const token = await rotateSetupToken();
      console.log(token ? `Kurulum anahtarı (24 saat geçerli):\n\n    ${token}\n` : "Kurulum zaten tamamlanmış; anahtar gerekmiyor.");
    },
  },
  "revoke-sessions": {
    help: "Tüm oturumları sonlandırır (herkes yeniden giriş yapar). Güvenlik olayı sonrası kullanılır.",
    async run() {
      const r = await db.session.deleteMany({});
      console.log(`${r.count} oturum sonlandırıldı.`);
    },
  },
  "academy-import": {
    help: "content/academy içeriğini (dersler, quizler, kötü adamlar) veritabanına aktarır. İlerleme korunur.",
    async run(args) {
      const s = await importAcademy(args[0] ? { dir: args[0] } : {});
      if (!s.applied) {
        console.error(`İçe aktarma YAPILMADI — ${s.problems.length} sorun:`);
        for (const p of s.problems) console.error(`  - ${p}`);
        process.exitCode = 1;
        return;
      }
      console.log(`${s.tracks} yol · ${s.lessons} ders → ${s.created} yeni, ${s.updated} güncellenen, ${s.unchanged} aynı, ${s.archived} arşivlenen.`);
    },
  },
  status: {
    help: "Kurulum ve üye sayılarını gösterir.",
    async run() {
      const s = await db.clubSettings.findUnique({ where: { id: 1 } });
      const users = await db.user.groupBy({ by: ["status"], _count: { _all: true } });
      console.log(`Kulüp: ${s?.clubName ?? "-"} · kurulum: ${s?.setupCompletedAt ? "tamamlandı" : "BEKLİYOR"}`);
      for (const u of users) console.log(`  ${u.status.padEnd(9)} ${u._count._all}`);
    },
  },
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const c = cmd ? commands[cmd] : undefined;
  if (!c) {
    console.log("Kullanım: cli <komut>\n");
    for (const [name, def] of Object.entries(commands)) console.log(`  ${name.padEnd(16)} ${def.help}`);
    process.exit(cmd ? 1 : 0);
  }
  await c.run(args);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await db.$disconnect().catch(() => {});
  process.exit(1);
});
