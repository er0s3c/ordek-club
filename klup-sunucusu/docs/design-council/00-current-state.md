# 00 — Mevcut durum (repo ve ekran envanteri)

> Hazırlayan: ana ajan (orkestratör), 2026-10-23. Tasarım konseyi ajanlarına ortak girdi olarak verildi.
> Bu belge kod okunarak yazıldı; kullanıcı araştırması içermez.

## Ürün ve kurum
- **Kulüp:** UKÜ Siber Güvenlik Kulübü / CIU Cyber Security Club — Uluslararası Kıbrıs Üniversitesi (KKTC).
  Logo: lacivert "C" içinde asma kilit + devre izleri (`public/brand/club-logo.png`).
- **Uygulama:** `klup-sunucusu/` (repo kökündeki Ördek Lab'den bağımsız). Next.js 15 App Router + TypeScript, özel Node
  sunucusu (`server.ts`, WebSocket `/ws/live`), Prisma + PostgreSQL 16, vitest (196 test), Playwright E2E (13 adım),
  Docker Compose (`compose.yaml`, `install.sh`, `scripts/club.sh` yedek/geri yükleme/güncelleme), isteğe bağlı Caddy HTTPS ve ClamAV.

## Ekran haritası (rota → amaç)
| Rota | Kim | Amaç |
|---|---|---|
| `/setup` | ilk kurulum | Kurulum anahtarı → kulüp bilgisi → kurucu hesabı (4 adım) |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | herkes | Giriş, başvuru (onay/davet/açık politika), parola sıfırlama |
| `/dashboard` | üye | Galaxy karşılama bandı, "Şu an canlı", Görevler + Duyurular kartları, Akademi "kaldığın yer", XP kartı (seviye, aylık sıra, seri), üyelik kartı |
| `/academy` | üye | Kaldığın yer + sezonlar (Program, Kısım I Temel M01–M11, Kısım II Uzmanlık Yol A–G), yol kartları (kötü adam portresi) |
| `/academy/[track]` | üye | Yolun ders listesi (durum, süre) |
| `/academy/lesson/[slug]` | üye | Markdown ders (hedefler, hikâye "DOSYA" kutuları, animasyon, kod), sonda quiz (çoktan seçmeli / D-Y) ya da "tamamla" |
| `/live`, `/live/[code]` | üye | Kodla katılım; senkron slayt (koyu sahne), el kaldır, soru sor, canlı quiz/anket, VMware uygulama molası teslimi |
| `/tasks`, `/tasks/[id]` | öğrenci | Görev listesi/teslim (metin+dosya), otomatik puanlı test, takım görevi |
| `/groups`, `/groups/[id]` | üye | Sınıflar ve etkinlikler (öğrenci kaydı, kapasite) |
| `/files`, `/announcements`, `/notifications` | üye | Dosya kütüphanesi, duyurular, bildirimler |
| `/leaderboard`, `/u/[kullanıcı]` | üye | Aylık/genel liderlik (yalnız öğrenciler), profil, rozetler |
| `/account` | üye | Parola, oturumlar, e-posta bildirimi tercihi |
| `/teach` … | eğitmen | Sunumlar (şablon, JSON içe aktar, Club Studio blok editörü), canlı konsol (QR, kontrol, quiz paneli, katılımcılar, sorular), görev yönetimi/değerlendirme (rubrik, toplu onay), analitik |
| `/admin` … | yönetici | Üyeler/onay, davetler, akademi içe aktarma, XP kuralları/düzeltme, rozetler, ayarlar (kota, SMTP durumu, sahiplik devri), denetim kaydı, sistem durumu |

Navigasyon: TryHackMe benzeri mor degrade üst başlık — Ana sayfa · Akademi · Canlı ders · *Sınıf ▾* (Görevler, Sınıflar,
Dosyalar, Duyurular) · Liderlik · *Eğitmen ▾* · Yönetim · bildirim zili · kullanıcı menüsü. 1180px altında hamburger.

## İçerik
- `content/academy/`: 19 yol, ~183 Markdown sayfa (ders / bilgi / quiz türleri), `akademi.yaml` yapı, `karakterler.yaml`
  "Gölge Ağ" kötü adamları (her modülün bir dosyası; "DOSYA KAPANDI" ile bölüm biter), `lab/` sentetik laboratuvar verileri.
- Quiz türleri: yalnız çoktan seçmeli ve doğru/yanlış (ders sonunda). Görevlerde ek olarak çoklu seçim, kısa cevap, eşleştirme.
- 15 hazır adım adım animasyon (HTTP, DNS, TCP, TLS, SQLi, XSS, phishing…), slayt blokları (başlık, metin, madde, kod, terminal,
  bilgi kutusu, animasyon, görsel, VMware uygulama molası).
- Görseller: çoğu ders görseli henüz yok (yer tutucu kutusu gösteriliyor); Midjourney promptları `GORSELLER.md`'de.

## Oyunlaştırma (mevcut)
XP defteri (idempotent), kurallar yönetimden düzenlenir (ders 40, bilgi 10, quiz 30, yol 200, canlı ders 25, görev 120,
canlı quiz 10), 10 seviye, 11 rozet, günlük seri, aylık (arşivli) + genel liderlik, şüpheli etkinlik listesi.
Henüz yok: başlangıç kategorisi/ayrı lig, takma ad/opt-out, takım/kulüp ortak görevleri, seri telafisi.

## Tasarım durumu
CIU tasarım sistemi (`docs/TASARIM-SISTEMI.md`) uygulanmış durumda: Lexend Tera / Readex Pro, mor + neon yeşil + krem,
hap butonlar, 20px kartlar, galaxy degradesi. Slayt sahnesi ve canlı ekran koyu. Henüz uygulanmamış: §5.14 terminal
bileşeni (slayt ve derslerdeki terminal/kod blokları eski basit stilde), §5A lab/ders odası arayüzü (ders sayfası tek uzun
Markdown + sonda quiz).

## Gözlenen sorunlar (kod ve ekran incelemesinden; doğrulanmış kullanıcı verisi DEĞİL)
1. **İlk kullanım yok:** Yeni öğrenci doğrudan yoğun bir ana sayfaya düşüyor; "ilk 5 dakikada ne yapacağım" adımı yok.
2. **Ders sayfası duvar metni:** Bir ders = uzun Markdown + sonda quiz; arada etkileşim yok, her sayfada tek fikir ilkesi uygulanmıyor.
3. **Jargon:** Modül adları ("OSINT", "CTF", "SOC", "CTI") 0 bilgili öğrenciye açıklamasız görünüyor; sözlük bileşeni yok.
4. **Tarayıcı içi mini görev yok:** Sahte gelen kutusu, log kartı, metadata gibi güvenli etkileşimli görevler bulunmuyor;
   pratik ya quiz ya da VMware uygulama molası (eğitmen ortamı gerektirir).
5. **Görsel eksikliği:** Derslerin çoğunda görsel yer tutucusu.
6. **Ana sayfa önceliği:** Tek birincil eylem ("Devam et") var ama altında 5 kart yarışıyor.
7. **Liderlik adaleti:** Yeni üyeler eskilerle aynı listede; takma ad/opt-out yok.
8. **Canlı moddan bireysel moda dönüş:** Ders bitince öğrenci "Ders sona erdi" kartına düşüyor; kaldığı akademi dersine/ilgili göreve köprü yok.
9. **Mobil:** Taşma yok, ama yoğun tablolar (görevler, liderlik) telefonda yatay kaydırma gerektiriyor.

## Teknik kısıtlar
- CSP sıkı: dış font/görsel/script yok (fontlar self-host); harici kaynak çağrısı yok.
- Tek sunucu hedefi (8 GB VPS); canlı oda durumu süreç içinde; Redis yok.
- Güvenlik ilkesi: gerçek hedefe tarama/sömürü yok; lab verisi sentetik ve zararsız.
- Mevcut özellikler ve testler bozulmamalı; büyük refactor yerine artımlı değişiklik.
