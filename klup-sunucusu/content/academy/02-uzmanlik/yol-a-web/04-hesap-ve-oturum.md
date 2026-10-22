---
id: a-04
tur: ders
baslik: "Hesap ve oturum: parola sıfırlama, JWT ve MFA"
sure: 8
hedefler:
  - Parola sıfırlama ve MFA akışlarındaki tipik hataları tanımak
  - Bir JWT'nin yapısını çözüp neyin gizli olmadığını açıklamak
animasyonlar: [authentication]
gorseller:
  - id: a-04-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine bir mühür kalıbını kalemiyle kopyalayıp parlayan sahte bir giriş bileti hazırlıyor; kapının altından sıfırlama mektubu kayıyor"
    prompt: "A cramped craftsman's workbench lit by a green banker's lamp: the villain carefully copies a wax seal onto a glowing ticket-shaped token with the tip of her fountain pen, comparing it to an original under a loupe. Behind her, a sealed envelope slowly slides in under the door of the room."
---

# Hesap ve oturum: parola sıfırlama, JWT ve MFA

> Kapıyı kırmak zordur. **Yedek anahtarı istemek** çoğu zaman daha kolaydır.
> 🗂️ **Çekmece 4:** Jasmine portalın "Şifremi unuttum" sayfasıyla ilgileniyor. Neden?

![Tek Tırnak Jasmine bir mühür kalıbını kalemiyle kopyalayıp parlayan sahte bir giriş bileti hazırlıyor; kapının altından sıfırlama mektubu kayıyor](../../gorseller/a-04-a.webp)

::animasyon[authentication]

## Sık görülen hatalar

| Akış | Hata | Sonuç |
|---|---|---|
| Giriş | "Böyle bir kullanıcı yok" ile "Parola yanlış" farklı | Kullanıcı adları toplanır |
| Giriş | Deneme sınırı yok | Kaba kuvvet |
| Sıfırlama | Kısa, tahmin edilebilir ya da süresiz bağlantı | Hesap ele geçirilir |
| Sıfırlama | Bağlantı adresi `Host` başlığından üretiliyor | Bağlantı saldırgana gider |
| MFA | Kod adımı atlanınca da oturum açılıyor | MFA süs olur |
| Çıkış | Sunucu oturumu silmiyor | Eski çerez hâlâ geçerli |

## JWT: herkesin okuyabildiği imzalı bilet

`xxxxx.yyyyy.zzzzz` → **başlık . içerik . imza**. İlk iki parça yalnızca Base64; şifreli değildir.

```json
{ "sub": "ogrenci.ali", "rol": "ogrenci", "exp": 1767225600 }
```

- İçeriği **herkes okuyabilir** → içine sır konmaz.
- Güvenliği **imza** sağlar; sunucu imzayı doğrulamıyorsa `rol` değiştirilebilir.
- `alg: none` kabul eden, zayıf anahtar kullanan, süresi (`exp`) olmayan token'lar klasik bulgulardır.

## Savunma

Aynı hata mesajı, deneme sınırı, tek kullanımlık ve kısa ömürlü sıfırlama bağlantısı,
sunucu tarafında doğrulanan MFA, imzası her istekte kontrol edilen token.

## 🧪 Dene (5 dk)

Yerel Juice Shop'a giriş yap. Burp'te bir isteğin `Authorization: Bearer ...` başlığındaki token'ın
ortadaki parçasını **Decoder**'da Base64 olarak çöz. İçinde neler var? Orada olmaması gereken bir şey görüyor musun?
⚠️ Token'ları çevrimiçi sitelere yapıştırma.

## ✅ Akılda kalsın

- Hata mesajları ve deneme sınırı, kullanıcı adı toplamayı ve kaba kuvveti belirler.
- JWT içeriği gizli değildir; güven imzadan gelir.
- Sıfırlama bağlantısı tek kullanımlık ve kısa ömürlü olmalı.
