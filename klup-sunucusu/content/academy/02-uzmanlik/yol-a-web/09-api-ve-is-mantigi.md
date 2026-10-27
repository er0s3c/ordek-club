---
id: a-09
tur: ders
baslik: "API ve iş mantığı: OAuth, hız sınırı, yarış durumu"
sure: 8
hedefler:
  - API'lere özgü tipik açıkları tanımak
  - İş mantığı hatalarını ve yarış durumunu açıklamak
gorseller:
  - id: a-09-b
    tur: ai
    alt: "Aynı anda vezneye uzanan beş aynı kupon; kasiyer hepsine aynı anda indirim damgası basıyor"
    prompt: "Five identical twins reach a bank teller window at exactly the same instant, each holding the same single-use coupon, and the teller with five arms stamps all five coupons at once before anyone can check the logbook."
  - id: a-09-c
    tur: ai
    alt: "Sipariş penceresinden kimlik sorulmadan dosya dosya veri taşıyan robot; hız sınırı olmayan kapıdan sınırsız istek geçiyor"
    prompt: "A self-service window where a robot clerk hands out thick file folders to anyone who asks without checking any badge, and a long line of identical requesters streams through a turnstile that has no counter or barrier."
---

# API ve iş mantığı: OAuth, hız sınırı, yarış durumu

> Arayüz sadece bir vitrin. Asıl kapı arkadaki **API**'dir — ve bazen kuralları yanlış sayar.
> 🗂️ **Çekmece 9:** Portalın yemek kartı kuponu bir gecede yüz kez kullanılmış.

::cizgi[a-09-sahne]

## API'lerin klasik hataları

![Sipariş penceresinden kimlik sorulmadan dosya dosya veri taşıyan robot; hız sınırı olmayan kapıdan sınırsız istek geçiyor](../../gorseller/a-09-c.webp)

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

![Aynı anda vezneye uzanan beş aynı kupon; kasiyer hepsine aynı anda indirim damgası basıyor](../../gorseller/a-09-b.webp)

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
