---
id: a-09
tur: ders
baslik: "API ve iş mantığı: OAuth, hız sınırı, yarış durumu"
sure: 8
hedefler:
  - API'lere özgü tipik açıkları tanımak
  - İş mantığı hatalarını ve yarış durumunu açıklamak
gorseller:
  - id: a-09-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine'in gönderdiği birbirinin aynısı kopyalar aynı parlayan kuponu aynı anda vezneye uzatıyor; kasiyer robot hepsini damgalıyor"
    prompt: "A vintage ticket counter with a cashier robot behind the glass. A row of identical translucent green clones of the villain, all summoned from the tip of her fountain pen, reach the window at the exact same moment, each holding the same single glowing coupon. The confused robot stamps every one of them while the original watches calmly from the side."
---

# API ve iş mantığı: OAuth, hız sınırı, yarış durumu

> Arayüz sadece bir vitrin. Asıl kapı arkadaki **API**'dir — ve bazen kuralları yanlış sayar.
> 🗂️ **Çekmece 9:** Portalın yemek kartı kuponu bir gecede yüz kez kullanılmış.

![Tek Tırnak Jasmine'in gönderdiği birbirinin aynısı kopyalar aynı parlayan kuponu aynı anda vezneye uzatıyor; kasiyer robot hepsini damgalıyor](../../gorseller/a-09-a.webp)

## API'lerin klasik hataları

| Hata | Örnek |
|---|---|
| **Fazla veri döndürmek** | Profil yanıtında parola özeti, telefon, doğum tarihi |
| **Toplu atama** | Kayıt isteğine `"rol": "admin"` eklemek kabul ediliyor |
| **Hız sınırı yok** | Kod doğrulamaya dakikada binlerce deneme |
| **Sürüm unutmak** | `/api/v2` korumalı, `/api/v1` hâlâ açık |

## İş mantığı: teknik değil, akıl hatası

Tarayıcı izin vermese de istek **değiştirilebilir**:

- Sepette miktar `-1` → toplam tutar düşüyor.
- Ödeme adımı atlanıp doğrudan "sipariş tamam" isteği gönderiliyor.
- İndirim kodu iki kez, iade iki kez uygulanıyor.

## Yarış durumu (race condition)

Sunucu "kupon kullanıldı mı?" diye **kontrol eder**, sonra **işaretler**.
Aynı anda gelen 20 istek kontrolü birlikte geçerse kupon 20 kez kullanılır.
Çözüm: kontrol ve işaretlemeyi **tek atomik işlem** yapmak (veritabanı kilidi, benzersiz kısıt).

## OAuth'ta iki kritik ayar

- `redirect_uri` **birebir** doğrulanmalı; yoksa yetki kodu saldırgana gider.
- `state` parametresi kullanılmalı; yoksa saldırgan kurbanı kendi hesabına bağlayabilir.

## 🧪 Dene (5 dk)

Yerel Juice Shop'ta sepete ürün ekle. Burp'te `/api/BasketItems/` isteğini Repeater'a gönder ve
`quantity` değerini `-1` yap. Sunucu kabul etti mi? Toplam fiyat ne oldu? Kontrol nerede olmalıydı?

## ✅ Akılda kalsın

- Arayüzün engellediği her şeyi API'de ayrıca kontrol et.
- İş mantığı hatası tarayıcıda değil, sunucunun kurallarında kapanır.
- Kontrol et + işaretle tek atomik işlem olmalı; yoksa yarış durumu doğar.
