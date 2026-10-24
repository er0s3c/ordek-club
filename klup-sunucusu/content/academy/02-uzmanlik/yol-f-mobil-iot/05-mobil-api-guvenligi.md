---
id: f-05
tur: ders
baslik: "Mobil API güvenliği: token saklama ve sertifika doğrulama"
sure: 8
hedefler:
  - Mobil uygulamada oturum token'ının nasıl güvenle saklanacağını açıklamak
  - Sertifika doğrulama ve sertifika sabitleme (pinning) kavramlarını ayırt etmek
animasyonlar:
  - mitm
gorseller:
  - id: f-05-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman telefonla sunucu arasındaki havalı posta borusuna cam bir ek kutusu takmış; elindeki mühürlü zarf bir türlü açılmıyor"
    prompt: "A pneumatic tube system carries glowing envelopes from a smartphone on one side of the room to a tall server tower on the other. Halfway along, the villain has fitted a small glass junction box into the tube and is pulling envelopes out to peek at them. Most open easily, but the one in her hands carries a bright amber wax seal shaped like an abstract symbol and refuses to open no matter how she tugs, her goggles fogging up comically while her tiny drone shrugs."
---

# Mobil API güvenliği: token saklama ve sertifika doğrulama

> Mobil uygulama bir vitrin; asıl kapı arkasındaki **API**. Vitrindeki düğmeyi gizlemek kapıyı kilitlemez.
> 🔧 **Devre 5:** Kilit uygulaması sunucuyla konuşurken araya biri giriyor. Uygulama bunu fark ediyor mu?

![Lehimci Leman telefonla sunucu arasındaki havalı posta borusuna cam bir ek kutusu takmış; elindeki mühürlü zarf bir türlü açılmıyor](../../gorseller/f-05-a.webp)

## Token nerede durur?

| Yöntem | Durum |
|---|---|
| `SharedPreferences` / `UserDefaults` içinde düz metin | ❌ Root'lu cihazda ve yedekte okunur |
| Koda gömülü API anahtarı | ❌ JADX ile herkes görür |
| Android Keystore / iOS Keychain ile korunan kayıt | ✅ Anahtar donanımda kalır |

Ek olarak: kısa ömürlü erişim token'ı (access token) + yenileme token'ı (refresh token), çıkışta sunucu tarafında iptal.

## Yetki sunucuda denetlenir

Uygulama "yönetici" düğmesini gizleyebilir, ama saldırgan API'yi doğrudan çağırır.
Her istek sunucuda kontrol edilir: bu token, **bu kapıyı** açmaya yetkili mi? (Bkz. IDOR, Yol A.)

## Sertifika doğrulama

::animasyon[mitm]

- Uygulama, sunucunun TLS sertifikasını **doğrulamalı**. "Tüm sertifikalara güven" diyen özel bir `TrustManager` en sık hatadır.
- Android 7+ hedefleyen uygulamalar, kullanıcının eklediği sertifikalara varsayılan olarak güvenmez.
- `network_security_config.xml` ile şifresiz trafik kapatılır.

## Sertifika sabitleme (pinning)

Uygulama, sunucunun **beklenen açık anahtarını** yanında taşır; geçerli ama farklı bir sertifikayı reddeder.

- Artısı: araya giren proxy'yi ve sahte sertifikayı durdurur.
- Eksisi: sertifika yenilenince uygulama kilitlenebilir → **yedek pin** ve yenileme planı şart.
- Pinning tek başına yetmez; sunucudaki yetki denetiminin yerine geçmez.

## 🧪 Dene (5 dk)

Emülatöre OWASP ZAP sertifikasını **kullanıcı sertifikası** olarak kur, proxy'yi ayarla.
Emülatördeki tarayıcının HTTPS trafiği görünür mü? Laboratuvardaki test uygulamasının trafiği? Farkı açıkla.

## ✅ Akılda kalsın

- Token Keystore/Keychain'de, kısa ömürlü ve iptal edilebilir olmalı.
- Gizlenen düğme güvenlik değildir; yetki sunucuda denetlenir.
- Sertifika doğrulaması zorunludur, pinning ise yedek planla birlikte ek bir kilittir.
