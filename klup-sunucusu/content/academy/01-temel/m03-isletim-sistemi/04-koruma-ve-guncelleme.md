---
id: m03-04
tur: ders
baslik: Defender, güvenlik duvarı ve güncellemeler
sure: 6
hedefler:
  - Windows'un yerleşik korumalarını kontrol etmek
  - Güncellemelerin neden ertelenmemesi gerektiğini açıklamak
animasyonlar: [firewall-decision]
gorseller:
  - id: m03-04-a
    tur: ekran
    alt: Windows Güvenliği uygulamasının ana ekranı; tüm koruma alanlarında yeşil onay işaretleri
    nasil: "Başlat → 'Windows Güvenliği' uygulamasını açın → 'Bir bakışta güvenlik' ana ekranı. Virüs ve tehdit koruması, Hesap koruması, Güvenlik duvarı ve ağ koruması kutucukları görünsün. Tüm pencereyi çekin; cihaz adı görünüyorsa bulanıklaştırın."
  - id: m03-04-c
    tur: ai
    alt: "Bir kaleyi koruyan üç savunma: kapıdaki muhafız, sur kapısında kural defteriyle bekçi ve duvardaki çatlakları yamayan usta"
    prompt: "A small castle representing a laptop guarded by three defenders: a guard at the inner gate inspecting each arriving package with a lantern, a gatekeeper at the outer wall checking a rulebook before letting carts pass in or out, and a mason on a ladder patching cracks in the wall with glowing green mortar."
---

# Defender, güvenlik duvarı ve güncellemeler

> Windows'un içinde ücretsiz bir koruma ekibi zaten var. Çoğu zaman tek yapman gereken
> **kapatmamak** ve **güncel tutmak**.

::cizgi[m03-04-sahne]

![Windows Güvenliği ana ekranı](../../gorseller/m03-04-a.webp)

## Üç koruma

![Bir kaleyi koruyan üç savunma: kapıdaki muhafız, sur kapısında kural defteriyle bekçi ve duvardaki çatlakları yamayan usta](../../gorseller/m03-04-c.webp)

| Koruma | Ne yapar? |
|---|---|
| **Microsoft Defender** | Dosyaları ve davranışları tarar, bilinen zararlıları durdurur |
| **Güvenlik duvarı** (firewall) | Ağdan gelen ve giden bağlantılara kurala göre izin verir veya engeller |
| **Güncellemeler** | Bilinen açıkları kapatan yamaları yükler |

Güvenlik duvarı nasıl karar verir? Kurallar sırayla kontrol edilir, eşleşen ilk kural uygulanır:

::animasyon[firewall-decision]

## Güncelleme neden bu kadar önemli?

Bir açık duyurulduğunda saldırganlar da öğrenir. Yamayı geciktiren her gün,
**herkesin bildiği bir açıkla** dolaşmak demektir. Büyük saldırıların çoğu,
yaması aylar önce çıkmış açıklardan yararlanır.

- Otomatik güncellemeyi açık tut.
- "Yeniden başlat" uyarısını günlerce erteleme.
- Sadece Windows değil: tarayıcı, PDF okuyucu, uygulamalar da güncellenir.

## Kötü fikirler

- Bir oyun veya "crack" kurmak için Defender'ı kapatmak
- Güvenlik duvarını "internet yavaş" diye kapatmak
- Desteği bitmiş işletim sistemi kullanmak (artık yama gelmez)

## 🧪 Dene (3 dk)

Windows Güvenliği'ni aç. Sarı veya kırmızı uyarı var mı? Varsa ne olduğunu oku ve düzelt.
Sonra Ayarlar → Windows Update'te bekleyen güncelleme var mı bak.

## ✅ Akılda kalsın

- Yerleşik korumalar yeterince iyidir; kapatma.
- Güvenlik duvarı kurallarla, ilk eşleşen kurala göre karar verir.
- Yama geciktiren, bilinen bir açıkla dolaşır.
