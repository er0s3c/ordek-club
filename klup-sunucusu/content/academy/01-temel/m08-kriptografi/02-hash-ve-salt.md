---
id: m08-02
tur: ders
baslik: Hash şifreleme değildir — ve parolalar neden tuzlanır?
sure: 7
hedefler:
  - Hash ile şifreleme farkını açıklamak
  - Parolaların neden tuzlu ve yavaş hash ile saklandığını anlamak
animasyonlar: [secure-vs-insecure]
gorseller:
  - id: m08-02-a
    tur: ai
    karakter: kadir
    alt: "Kasa Kıran Kadir kıyma makinesinden çıkan desenli karoyu geri sokmaya çalışıyor; yanında tuzluk"
    prompt: "A shiny copper grinder on a workbench: a whole fruit goes into the funnel and out comes a uniquely patterned glowing tile. The villain tries in vain to push the tile back into the grinder, frustrated, while a small salt shaker glows softly nearby."
---

# Hash şifreleme değildir

> Şifrelenen veri anahtarla **geri açılır**. Hash'lenen veri **geri dönmez**.
> Parolaları saklamanın doğru yolu ikincisidir.

![Kasa Kıran Kadir kıyma makinesinden çıkan desenli karoyu geri sokmaya çalışıyor; yanında tuzluk](../../gorseller/m08-02-a.webp)

## Farkı netleştir

| | Şifreleme | Hash |
|---|---|---|
| Geri dönüş | Anahtarla çözülür | **Geri dönmez** |
| Çıktı uzunluğu | Girdiyle orantılı | Her zaman sabit |
| Amaç | Gizlilik | Bütünlük, parola saklama |
| Örnek | AES, RSA | SHA-256, scrypt, Argon2 |

## Parola nasıl doğrulanır?

Site parolanı **saklamaz**. Hash'ini saklar. Giriş yaptığında girdiğin parolayı aynı yöntemle hash'ler ve karşılaştırır.

## İki sorun, iki çözüm

1. **Aynı parola → aynı hash.** Saldırgan hazır tablolarla ("rainbow table") milyonlarca yaygın parolayı anında eşler.
   → **Salt (tuz):** her kullanıcıya özel rastgele bir değer eklenir. Aynı parola bile farklı hash üretir.
2. **Hızlı hash = hızlı kırma.** SHA-256 saniyede milyarlarca tahmine izin verir.
   → **Yavaş, bellek yoğun KDF:** bcrypt, scrypt, Argon2. Bir tahmin milisaniyeler sürer; milyarlarcası yıllar.

Güvensiz ve güvenli parola saklamayı yan yana gör:

::animasyon[secure-vs-insecure]

## Bir sızıntı haberinde ne aramalı?

"Parolalar **düz metin** saklanıyordu" → çok kötü. "**MD5** ile" → kötü.
"**Tuzlu bcrypt/Argon2** ile" → saldırgan için çok pahalı; yine de parolanı değiştir.

## 🧪 Dene (3 dk)

Terminalde aynı metnin hash'ini iki kez al, sonra bir harfini değiştir:

```bash
echo -n "ordek" | sha256sum
echo -n "ordek" | sha256sum
echo -n "Ordek" | sha256sum
```

## ✅ Akılda kalsın

- Şifreleme geri açılır, hash açılmaz.
- Salt aynı parolaları farklılaştırır.
- Parolalar hızlı hash ile değil, yavaş KDF (bcrypt/scrypt/Argon2) ile saklanır.
