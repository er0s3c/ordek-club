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
  - id: m08-02-b
    tur: ai
    alt: "Solda anahtarla açılıp kapanan bir kutu (şifreleme), sağda bir meyveyi meyve suyuna çeviren ve geri döndüremeyen sıkacak (hash)"
    prompt: "Split scene on a kitchen counter: on the left a small box being locked and later unlocked with a key, the same gift coming back out intact; on the right a fruit squeezed in a heavy press into a glass of juice, and a puzzled cook trying in vain to push the juice back into a whole fruit."
  - id: m08-02-c
    tur: ai
    alt: "Aynı iki tabak yemeğe farklı tuz serpilince tamamen farklı desenler ortaya çıkıyor"
    prompt: "Two identical plain dumplings on two plates; a chef sprinkles a different pinch of glowing salt crystals on each, and as the salt touches them each dumpling transforms into a completely different intricate glowing pattern."
---

# Hash şifreleme değildir

> Şifrelenen veri anahtarla **geri açılır**. Hash'lenen veri **geri dönmez**.
> Parolaları saklamanın doğru yolu ikincisidir.

::cizgi[m08-02-sahne]

## Farkı netleştir

![Solda anahtarla açılıp kapanan bir kutu (şifreleme), sağda bir meyveyi meyve suyuna çeviren ve geri döndüremeyen sıkacak (hash)](../../gorseller/m08-02-b.webp)

| | Şifreleme | Hash |
|---|---|---|
| Geri dönüş | Anahtarla çözülür | **Geri dönmez** |
| Çıktı uzunluğu | Girdiyle orantılı | Her zaman sabit |
| Amaç | Gizlilik | Bütünlük, parola saklama |
| Örnek | AES, RSA | SHA-256, scrypt, Argon2 |

## Parola nasıl doğrulanır?

Site parolanı **saklamaz**. Hash'ini saklar. Giriş yaptığında girdiğin parolayı aynı yöntemle hash'ler ve karşılaştırır.

## İki sorun, iki çözüm

![Aynı iki tabak yemeğe farklı tuz serpilince tamamen farklı desenler ortaya çıkıyor](../../gorseller/m08-02-c.webp)

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
