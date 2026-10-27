---
id: m08-04
tur: ders
baslik: Parola yöneticisi, MFA ve passkey
sure: 8
hedefler:
  - Parola yöneticisi kullanmanın faydasını açıklamak
  - MFA yöntemlerini güvenlik açısından sıralamak
  - Passkey kavramını ve güvenli oturum yönetimini anlamak
gorseller:
  - id: m08-04-b
    tur: ekran
    alt: Bir parola yöneticisinin parola/parola cümlesi üretici ekranı
    nasil: "Bitwarden (ücretsiz, açık kaynak) veya kullandığınız parola yöneticisinde 'Oluşturucu / Generator' ekranını açın. 'Parola cümlesi' (passphrase) seçeneği seçili olsun, kelime sayısı 5. Üretilen örnek değeri ekranda bırakabilirsiniz (gerçek bir hesapta kullanmayın). Kasa içeriğinizi, e-postanızı ve kayıtlı hesap adlarınızı GÖSTERMEYİN; yalnızca üretici penceresini kırpın."
  - id: m08-04-c
    tur: ai
    alt: "Bir kapıda iki kilit: biri parola anahtarı, diğeri sahibinin cebindeki küçük cihazla açılıyor; hırsız yalnız ilk anahtarla takılıyor"
    prompt: "A sturdy door with two different locks: the owner opens the first with a key and the second with a small glowing device from their pocket; around the corner a thief holding a stolen copy of only the first key stands stuck in front of the second lock."
---

# Parola yöneticisi, MFA ve passkey

> İnsan beyni 80 farklı güçlü parolayı hatırlamak için yapılmadı.
> Çözüm daha iyi hafıza değil, **daha iyi araçlar**.

::cizgi[m08-04-sahne]

## Parola yöneticisi

- Her site için **farklı, uzun, rastgele** parola üretir ve saklar.
- Sen yalnızca **bir** ana parola hatırlarsın — bunu uzun bir cümle yap.
- Sahte sitede otomatik doldurmaz → phishing'e karşı bonus koruma.

![Parola cümlesi üretici](../../gorseller/m08-04-b.webp)

Uzunluk karmaşıklıktan değerlidir: `kumda-yuruyen-mavi-ordek-sabah` hatırlanır ve `P@ssw0rd1!`'den çok daha güçlüdür.

## MFA: ikinci kilit

![Bir kapıda iki kilit: biri parola anahtarı, diğeri sahibinin cebindeki küçük cihazla açılıyor; hırsız yalnız ilk anahtarla takılıyor](../../gorseller/m08-04-c.webp)

Parolan çalınsa bile ikinci faktör olmadan giriş olmaz. Güçlüden zayıfa:

| Yöntem | Güç | Not |
|---|---|---|
| **Passkey / donanım anahtarı** | ⭐⭐⭐⭐ | Phishing'e karşı dirençli |
| **Uygulama bildirimi + sayı eşleştirme** | ⭐⭐⭐ | "Onayla" spam'ine dikkat |
| **Doğrulayıcı uygulama kodu** (TOTP) | ⭐⭐⭐ | Kod sahte siteye girilebilir |
| **SMS kodu** | ⭐⭐ | SIM değiştirme saldırısına açık; yine de hiç yoktan iyi |

⚠️ Doğrulama kodunu **kimseyle paylaşma** — "okuldan arıyoruz" diyen biri dahil.

## Passkey: parolasız gelecek

Passkey, asimetrik anahtar çiftidir: özel anahtar cihazında kalır, siteye sadece açık anahtar gider.
Parmak izi veya PIN ile açılır. **Sahte siteye çalışmaz**, çünkü anahtar alan adına bağlıdır.

## Güvenli oturum

- Ortak bilgisayarda "beni hatırla" deme, işin bitince **çıkış yap**.
- Hesabındaki "aktif oturumlar" listesini ara sıra kontrol et.
- Parolanı değiştirdiğinde diğer cihazlardaki oturumları kapat.

## 🧪 Dene (5 dk)

En önemli hesabını (e-posta) seç: MFA açık mı? Değilse **şimdi** aç. Hangi yöntemi seçtin?

## ✅ Akılda kalsın

- Her siteye ayrı parola; bunu parola yöneticisi yapar.
- MFA'yı aç; mümkünse passkey veya uygulama, en kötü ihtimalle SMS.
- Doğrulama kodu kimseyle paylaşılmaz.
