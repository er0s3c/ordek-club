---
id: m08-06
tur: quiz
baslik: "M08 Quiz: Kriptografi ve dijital kimlik"
sure: 6
gecme: 70
sorular:
  - soru: Asimetrik şifrelemede mesajı kilitlemek (şifrelemek) için hangi anahtar kullanılır?
    tur: coktan
    secenekler: [Alıcının özel anahtarı, Alıcının açık anahtarı, Göndericinin parolası, Paylaşılan tek anahtar]
    dogru: 1
    aciklama: Açık anahtar herkese verilir ve kilitler; yalnızca özel anahtar sahibi açabilir.
  - soru: Hash ile şifreleme arasındaki temel fark nedir?
    tur: coktan
    secenekler:
      - Hash daha hızlıdır
      - Hash geri döndürülemez, şifreleme anahtarla çözülür
      - Şifreleme sadece metinde çalışır
      - Hash anahtar gerektirir
    dogru: 1
    aciklama: Hash tek yönlüdür; şifreleme anahtarla geri açılır.
  - soru: Parola hash'lerine "salt" eklemenin amacı nedir?
    tur: coktan
    secenekler:
      - Hash'i kısaltmak
      - Aynı parolaların farklı hash üretmesini sağlamak ve hazır tabloları işe yaramaz kılmak
      - Parolayı geri çözülebilir yapmak
      - Parolayı şifrelemek
    dogru: 1
    aciklama: Her kullanıcıya özel rastgele tuz, rainbow table saldırılarını engeller.
  - soru: Bir dijital imzayı doğrulamak için hangisi gerekir?
    tur: coktan
    secenekler: [İmzalayanın özel anahtarı, İmzalayanın açık anahtarı, Alıcının özel anahtarı, Sertifikanın parolası]
    dogru: 1
    aciklama: İmza özel anahtarla atılır, açık anahtarla doğrulanır.
  - soru: Aşağıdaki MFA yöntemlerinden hangisi phishing'e karşı en dayanıklıdır?
    tur: coktan
    secenekler: [SMS kodu, E-posta kodu, Passkey / donanım güvenlik anahtarı, Güvenlik sorusu]
    dogru: 2
    aciklama: Passkey alan adına bağlıdır; sahte sitede çalışmaz.
  - soru: "\"kumda yuruyen mavi ordek\" parola cümlesi, \"P@ss1!\" parolasından daha güçlüdür."
    tur: dogru-yanlis
    dogru: true
    aciklama: Uzunluk, kombinasyon sayısını karmaşıklıktan çok daha fazla artırır.
  - soru: Okuldan aradığını söyleyen birine telefonuna gelen doğrulama kodunu söylemek güvenlidir.
    tur: dogru-yanlis
    dogru: false
    aciklama: Doğrulama kodu hiçbir koşulda paylaşılmaz; meşru kurumlar bunu istemez.
gorseller:
  - id: m08-06-a
    tur: ai
    karakter: kadir
    alt: "Tuz kristalleriyle kaplı dev kasa kapısının önünde Kasa Kıran Kadir; stetoskobu dolanmış, gökkuşağı defteri sayfa sayfa sönüyor"
    prompt: "The villain kneels before an enormous round vault door crusted with sparkling salt crystals, his stethoscope tangled around his arm, sweat pouring down. His rainbow notebook lies open beside him, its pages fading to gray one by one as the vault refuses to budge."
---

# M08 Quiz: Kriptografi ve dijital kimlik

7 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Kasa Kıran Kadir** · *quiz'i %70 ile geçince*
>
> ![Tuz kristalleriyle kaplı dev kasa kapısının önünde Kasa Kıran Kadir; stetoskobu dolanmış, gökkuşağı defteri sayfa sayfa sönüyor](../../gorseller/m08-06-a.webp)
>
> Kadir'in açamadığı tek kasa güçlü, tuzlu parolalardı. Teslim olmadan önce tek bir isim veriyor: "Ben sadece açarım. Kime açtığımı Mine Hanım bilir."
>
> ➡️ *Sıradaki dosya: **Maskeli Mine** (M09)*
