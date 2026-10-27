// Uçtan uca 13 adımlı akış (C6-03): boş kurulumdan, gerçek tarayıcıda, iki kullanıcıyla
// (kurucu/eğitmen + öğrenci) platformun ana yolunu doğrular.
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
// @ts-expect-error — .mjs ortam dosyası
import { E2E_STORAGE } from "./env.mjs";

const OWNER = { name: "Deniz Kurucu", username: "e2e.kurucu", email: "kurucu@e2e.test", password: "Gece-Yarisi-Paket-42" };
const STUDENT = { name: "Ali Öğrenci", username: "e2e.ali", email: "ali@e2e.test", password: "Sabah-Kahvesi-Log-77" };

async function setupToken(): Promise<string> {
  const file = path.join(E2E_STORAGE, "setup-token.txt");
  for (let i = 0; i < 50 && !fs.existsSync(file); i++) await new Promise((r) => setTimeout(r, 200));
  return fs.readFileSync(file, "utf8").trim();
}

const toast = (p: Page, text: string | RegExp) => expect(p.getByText(text).first()).toBeVisible();

test("kurulumdan onaylı göreve 13 adım", async ({ browser }) => {
  const oc = await browser.newContext();
  const sc = await browser.newContext();
  const o = await oc.newPage();
  const s = await sc.newPage();

  await test.step("1. Kurulum sihirbazı: anahtar → kulüp → kurucu hesabı", async () => {
    await o.goto("/setup");
    await o.getByLabel("Kurulum anahtarı").fill(await setupToken());
    await o.getByRole("button", { name: "Devam" }).click();
    await o.getByLabel("Kulüp adı").fill("E2E Siber Kulübü");
    await o.locator("#pol").selectOption("APPROVAL");
    await o.getByRole("button", { name: "Devam" }).click();
    await o.getByLabel("Ad Soyad").fill(OWNER.name);
    await o.getByLabel("Kullanıcı adı").fill(OWNER.username);
    await o.getByLabel("E-posta").fill(OWNER.email);
    await o.getByLabel("Parola", { exact: true }).fill(OWNER.password);
    await o.getByLabel("Parola (tekrar)").fill(OWNER.password);
    await o.getByRole("button", { name: "Kurulumu tamamla" }).click();
    await expect(o.getByText("Kurulum tamamlandı").first()).toBeVisible();
  });

  await test.step("2. Öğrenci başvurusu", async () => {
    await s.goto("/register");
    await s.getByLabel("Ad Soyad").fill(STUDENT.name);
    await s.getByLabel("Kullanıcı adı").fill(STUDENT.username);
    await s.getByLabel("E-posta").fill(STUDENT.email);
    await s.getByLabel("Parola", { exact: true }).fill(STUDENT.password);
    await s.getByRole("button", { name: "Başvur" }).click();
    await expect(s.getByText("Başvurun alındı").first()).toBeVisible();
  });

  await test.step("3. Başvuru onaylanmadan giriş yapılamaz; kurucu onaylar", async () => {
    await s.goto("/login");
    await s.getByLabel("Kullanıcı adı veya e-posta").fill(STUDENT.username);
    await s.getByLabel("Parola", { exact: true }).fill(STUDENT.password);
    await s.getByRole("button", { name: "Giriş yap" }).click();
    await expect(s.getByRole("alert")).toBeVisible();
    await o.goto("/admin/members?status=PENDING");
    await o.getByRole("button", { name: `${STUDENT.name} başvurusunu onayla` }).click();
    await expect(o.getByRole("button", { name: `${STUDENT.name} başvurusunu onayla` })).toHaveCount(0);
  });

  await test.step("4. Öğrenci girişi", async () => {
    await s.getByRole("button", { name: "Giriş yap" }).click();
    await s.waitForURL("**/dashboard");
    await expect(s.getByRole("heading", { name: /Merhaba, Ali/ })).toBeVisible();
  });

  await test.step("4b. İlk görev (design-council E1): tek kart → yanlış → ipucu → doğru → +XP, kapanış", async () => {
    await o.goto("/admin/academy");
    await o.getByRole("button", { name: /İçeriği şimdi içe aktar/ }).click();
    await toast(o, /ders: \d+ yeni/);
    await s.goto("/dashboard");
    // İlk kullanım: tek yeşil düğme, lig/sıra/XP kartı yok
    await expect(s.locator(".first-card")).toBeVisible();
    await expect(s.getByText("Kalkan dosyan")).toHaveCount(0);
    await s.getByRole("link", { name: /Mesajı aç/ }).click();
    await s.waitForURL("**/academy/lesson/m01-05");
    const m = s.locator(".mission");
    await expect(m.locator("a[href]")).toHaveCount(0); // maket: bağlantı yok
    await expect(m.locator("input")).toHaveCount(0); // maket: parola dahil hiçbir alan yok
    await m.getByRole("button", { name: "Bağlantıya dokun" }).click();
    await expect(m.getByRole("group", { name: "Simülasyon giriş ekranı" })).toBeVisible();
    const hints = m.locator(".mission-hints li");
    const initialHints = await hints.count();
    await m.getByRole("button", { name: /Küçük bir yönlendirme|Ayrıntılı ipucu|Biraz daha/ }).click();
    await expect(hints).toHaveCount(initialHints + 1);
    await m.getByRole("button", { name: "Göndereni incele" }).click();
    await m.getByRole("button", { name: /Devam/ }).click();
    await m.getByRole("button", { name: /Gönderene dokun/ }).click();
    await expect(m.locator(".mail-addr mark").first()).toBeVisible();
    await m.getByRole("button", { name: "Hayır", exact: true }).click();
    await m.getByRole("button", { name: /Devam/ }).click();
    await m.getByRole("button", { name: "Gönderen adresi okulunkiyle aynı değil" }).click();
    await m.getByRole("button", { name: "Dosyayı kapat" }).click();
    await expect(s.getByText("DOSYA KAPANDI")).toBeVisible();
    await expect(s.getByText(/\+60 XP/)).toBeVisible();
  });

  let presentationUrl = "";
  await test.step("5. Eğitmen şablondan sunum oluşturur", async () => {
    await o.goto("/teach");
    const card = o.locator(".card-b.stack-sm", { hasText: "Ağ Temelleri" }).first();
    await card.getByRole("button", { name: /Bu şablondan oluştur/ }).click();
    await o.waitForURL(/\/teach\/presentations\/c[a-z0-9]{20,}$/);
    presentationUrl = o.url();
  });

  await test.step("6. Club Studio: blok ekle, otomatik kayıt, yeni sürüm yayınla", async () => {
    await o.getByRole("link", { name: /Club Studio/ }).click();
    await o.waitForURL(/\/studio$/);
    await o.getByRole("button", { name: "+ Metin" }).click();
    await o.getByRole("textbox", { name: "Metin", exact: true }).last().fill("E2E notu: bugün paketleri izliyoruz");
    await expect(o.getByRole("status").filter({ hasText: "Taslak kaydedildi" })).toBeVisible();
    await o.getByRole("button", { name: /Yayınla \(v2\)/ }).click();
    await toast(o, /v2 yayınlandı/);
  });

  let code = "";
  await test.step("7. Canlı ders başlar", async () => {
    await o.goto(presentationUrl);
    await o.getByRole("button", { name: "Canlı dersi başlat" }).click();
    await o.waitForURL(/\/teach\/live\//);
    code = (await o.locator(".code-big").innerText()).trim();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  await test.step("8. Öğrenci kodla katılır ve yayınlanan sürümü görür", async () => {
    await s.goto("/live");
    await s.getByLabel("Oturum kodu").fill(code);
    await s.getByRole("button", { name: "Katıl" }).click();
    await s.waitForURL(`**/live/${code}`);
    await expect(s.getByText("E2E notu: bugün paketleri izliyoruz").first()).toBeVisible();
    await expect(o.locator(".badge", { hasText: "1 çevrimiçi" }).or(o.locator(".badge", { hasText: "2 çevrimiçi" }))).toBeVisible();
  });

  await test.step("9. Eğitmen ilerler, öğrencinin ekranı eşzamanlı değişir", async () => {
    await o.getByRole("button", { name: "Sonraki adım" }).click();
    await expect(s.getByRole("heading", { name: "Paketin yolculuğu" })).toBeVisible();
    await expect(o.getByRole("heading", { name: "Paketin yolculuğu" })).toBeVisible();
    await expect(o.getByRole("region", { name: "Quiz / anket" })).toBeVisible();
  });

  await test.step("10. Canlı quiz: öğrenci cevaplar, eğitmen açıklar", async () => {
    await o.getByLabel("Soru", { exact: true }).fill("TCP el sıkışmasında ikinci paket SYN-ACK'tir.");
    await o.getByRole("button", { name: "Doğru/Yanlış" }).click();
    await o.getByRole("button", { name: "Başlat", exact: true }).click();
    await s.locator(".poll-opt", { hasText: "Doğru" }).click();
    await expect(s.getByText(/Cevabın alındı/).first()).toBeVisible();
    await expect(o.locator(".poll-live")).toContainText("1 · %100");
    await o.getByRole("button", { name: "Sonucu açıkla" }).click();
    await expect(s.getByText("Doğru! XP hesabına eklendi.").first()).toBeVisible();
  });

  let taskUrl = "";
  await test.step("11. Eğitmen görev oluşturup yayınlar", async () => {
    await o.goto("/teach/tasks/new");
    await o.getByLabel("Başlık").fill("E2E: auth.log incelemesi");
    await o.getByLabel("Açıklama").fill("Başarısız giriş denemelerinin kaynak IP adresini yaz.");
    await o.getByRole("button", { name: "Kaydet ve yayınla" }).click();
    await o.waitForURL(/\/teach\/tasks\/c[a-z0-9]{20,}$/); // "/new" ile karışmasın
    taskUrl = o.url();
    await expect(o.getByText("Yayında").first()).toBeVisible();
  });

  await test.step("12. Öğrenci bildirimi görür ve teslim eder", async () => {
    await s.goto("/notifications");
    await s.getByRole("link", { name: /Yeni görev: E2E: auth.log incelemesi/ }).click();
    await s.waitForURL(/\/tasks\/c[a-z0-9]{20,}$/);
    await s.getByLabel("Cevap / açıklama").fill("Kaynak IP: 10.0.5.23");
    await s.getByRole("button", { name: "Teslim et" }).click();
    await expect(s.getByText("Değerlendirme bekliyor").first()).toBeVisible();
  });

  await test.step("13. Eğitmen onaylar; öğrenci XP'yi bildirimde ve liderlikte görür", async () => {
    await o.goto(taskUrl);
    await o.getByRole("button", { name: "Değerlendir", exact: true }).click();
    await o.getByRole("button", { name: /Onayla \(XP ver\)/ }).click();
    await toast(o, /onaylandı/);
    await s.goto("/notifications");
    await expect(s.getByText(/E2E: auth.log incelemesi: onaylandı \(\+120 XP\)/)).toBeVisible();
    await s.goto("/leaderboard");
    await expect(s.getByRole("cell", { name: new RegExp(STUDENT.name) }).first()).toBeVisible();
    await expect(s.getByText("190", { exact: true }).first()).toBeVisible(); // 60 ilk görev + 120 görev + 10 canlı quiz
  });

  await oc.close();
  await sc.close();
});
