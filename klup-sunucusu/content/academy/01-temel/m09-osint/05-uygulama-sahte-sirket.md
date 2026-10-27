---
id: m09-05
tur: uygulama
baslik: "Uygulama: Sahte Şirketi Bul"
sure: 30
hedefler:
  - Farklı kaynaklardaki kayıtları karşılaştırıp tutarsızlık bulmak
  - Güven düzeyiyle kısa bir doğrulama raporu yazmak
gorseller:
  - id: m09-05-b
    tur: ai
    alt: "Masada yan yana dizilen zararsız görünen kartlar birleşince sahte bir şirket binasının çizimini oluşturuyor"
    prompt: "An investigator lines up several small innocent-looking cards on a desk, a phone, a stamp, a calendar page, a mailbox and a handshake, and as they are placed side by side their edges connect into a drawing of a hollow cardboard office building."
---

# Uygulama: Sahte Şirketi Bul

> **Vaka:** Kampüs panosunda bir staj ilanı: *"NovaKıbrıs Yazılım Ltd. — 10 stajyer arıyor, aylık 900€.
> Başvuru ücreti 50€."* Kulüp üyeleri senden ilanın güvenilir olup olmadığını soruyor.
> Aşağıdaki kayıtların **hepsi kurgusaldır**.

::cizgi[m09-05-sahne]

## Kanıt dosyası

**K1 — İlan metni:** "15 yıllık deneyim · Lefkoşa merkez ofis · başvurular ik.novakibris@mail.example adresine"

**K2 — WHOIS (`novakibris.example`):** Kayıt tarihi: 18 gün önce · Kayıt eden: gizlilik hizmeti

**K3 — Web sitesi:** "Ekibimiz" sayfasında 6 fotoğraf. Tersine görsel aramada 4'ü bir stok fotoğraf sitesinde çıkıyor.

**K4 — Web arşivi:** Alan adı için hiç kayıt yok.

**K5 — Şirket kaydı (kurgusal sicil):** "NovaKıbrıs Yazılım" adına kayıt bulunamadı; "Nova Kıbrıs Danışmanlık" adında 2019 tarihli bir kayıt var, faaliyet alanı muhasebe.

**K6 — Sosyal medya:** Hesap 3 hafta önce açılmış, 2.400 takipçi, 9 gönderi, yorumların tamamı "Harika fırsat!"

**K7 — Harita:** Verilen adres bir kafe.

## Görev

![Masada yan yana dizilen zararsız görünen kartlar birleşince sahte bir şirket binasının çizimini oluşturuyor](../../gorseller/m09-05-b.webp)

1. Her kanıtı **destekliyor / çelişiyor / belirsiz** olarak sınıflandır.
2. İlanın iddiaları ile kanıtlar arasındaki **en az 5 tutarsızlığı** listele.
3. Genel sonucunu **güven düzeyiyle** yaz.
4. Kulüp üyelerine 3 maddelik öneri hazırla.

## Teslim

M09-04'teki rapor iskeleti, en fazla 1 sayfa.

<details><summary>Kontrol</summary>Tutarsızlıklar: "15 yıl" ↔ 18 günlük alan adı ve arşivde iz yok · kurumsal iddia ↔ ücretsiz e-posta servisi · ekip fotoğrafları stok · sicilde böyle bir şirket yok (benzer isim farklı alan) · adres bir kafe · yeni hesapta yüksek ve sahte görünen etkileşim. En önemlisi: <b>başvuru ücreti</b> — meşru işverenler stajyerden para almaz. Sonuç: büyük olasılıkla dolandırıcılık, güven düzeyi yüksek. Öneri: ödeme yapma, kişisel belge gönderme, ilanı kariyer merkezine bildir.</details>

## ✅ Akılda kalsın

- Tek tek zararsız görünen kayıtlar yan yana gelince hikâye anlatır.
- İddialar ile bağımsız kayıtları karşılaştır.
- "Başvuru için ücret" her zaman kırmızı bayraktır.
