---
id: m06-07
tur: quiz
baslik: "M06 Quiz: Web teknolojileri"
sure: 6
gecme: 70
sorular:
  - soru: "https://kuzeykiyi.edu.example.guvenli-giris.com/login adresinin gerçek alan adı nedir?"
    tur: coktan
    secenekler: [kuzeykiyi.edu.example, edu.example, guvenli-giris.com, login]
    dogru: 2
    aciklama: Alan adı sağdan sola okunur; gerçek kayıtlı alan adı guvenli-giris.com'dur.
  - soru: Bir kayıt oluşturmak (ör. ödev yüklemek) için genellikle hangi HTTP yöntemi kullanılır?
    tur: coktan
    secenekler: [GET, POST, DELETE, HEAD]
    dogru: 1
    aciklama: POST, sunucuya yeni veri göndermek için kullanılır.
  - soru: Giriş yapmış bir kullanıcının yetkisi olmayan bir sayfaya erişmeye çalışması genelde hangi kodu döndürür?
    tur: coktan
    secenekler: ["200", "301", "403", "500"]
    dogru: 2
    aciklama: 403 Forbidden, kimlik bilinse de yetki olmadığını belirtir.
  - soru: Çerezin JavaScript tarafından okunmasını engelleyen ayar hangisidir?
    tur: coktan
    secenekler: [Secure, HttpOnly, SameSite, Expires]
    dogru: 1
    aciklama: HttpOnly, XSS ile çerez çalınmasını zorlaştırır.
  - soru: "\"Öğrenci A, öğrenci B'nin notunu görebiliyor\" hatası hangi kontrolün eksikliğidir?"
    tur: coktan
    secenekler: [Kimlik doğrulama, Yetkilendirme, Şifreleme, Önbellekleme]
    dogru: 1
    aciklama: Kim olduğu bilinen kullanıcının yalnızca kendi verisine erişmesini sağlamak yetkilendirmedir.
  - soru: Sadece JavaScript ile yapılan bir giriş kontrolü (ör. puan 0–100) güvenlik için yeterlidir.
    tur: dogru-yanlis
    dogru: false
    aciklama: Frontend kullanıcının elindedir; kontrol mutlaka backend'de tekrar yapılmalıdır.
  - soru: Bulutta yanlış ayarlanmış herkese açık depolama alanı, bulut sağlayıcının sorumluluğundadır.
    tur: dogru-yanlis
    dogru: false
    aciklama: Paylaşılan sorumluluk modelinde ayarlar ve veri müşterinin sorumluluğundadır.
gorseller:
  - id: m06-07-a
    tur: ai
    karakter: celal
    alt: "Kepengi yarıya inmiş fırında Çerezci Celal, toz olup dağılan çerezlerine önlüğüyle ağlıyor"
    prompt: "A bakery at night with its metal shutter half down: behind the counter the villain weeps into his apron over a tray of glowing cookies that crumble into dust one by one, his rolling pin lying forgotten on the floor."
---

# M06 Quiz: Web teknolojileri

7 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Çerezci Celal** · *quiz'i %70 ile geçince*
>
> ![Kepengi yarıya inmiş fırında Çerezci Celal, toz olup dağılan çerezlerine önlüğüyle ağlıyor](../../gorseller/m06-07-a.webp)
>
> Çerez tezgâhı kapandı; oturumlar güvende. Fırının arka odasında bir kablo yığını duruyor — iplerin hepsi tek bir kuklacıya uzanıyor.
>
> ➡️ *Sıradaki dosya: **Kuklacı Orhan** (M07)*
