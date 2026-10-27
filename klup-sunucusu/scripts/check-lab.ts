import "../src/server/load-env";
import { labHealth, labConfigurationStatus } from "../src/server/learning/lab-client";

async function main() {
  const status = labConfigurationStatus();
  if (!status.configured) {
    console.error(`[lab] ${status.message}`);
    if (status.missing.length) console.error(`[lab] Eksik ayarlar: ${status.missing.join(", ")}`);
    console.error("[lab] Kurulum: lab-runner/README.md. Ayrı Linux sunucusu ve mTLS sertifikaları gereklidir.");
    process.exitCode = 1;
    return;
  }
  await labHealth();
  console.log("[lab] Karşılıklı TLS bağlantısı ve çalıştırıcı sağlık yanıtı doğrulandı (runsc, yapılandırılmış sınır: 20).");
  console.log("[lab] Oturum başlatılmadı. İzolasyon ve 20 eşzamanlı oturum yük testi ayrıca yapılmalıdır.");
}

main().catch(() => {
  console.error("[lab] Bağlantı doğrulanamadı. Özel ağ erişimini, sunucu durumunu ve sertifika SAN/CA ayarlarını kontrol edin.");
  process.exitCode = 1;
});
