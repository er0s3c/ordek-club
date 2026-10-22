---
id: m06-04
tur: ders
baslik: Sunucu seni nasıl hatırlıyor? Cookie, oturum, token
sure: 7
hedefler:
  - Cookie, session ve token kavramlarını ayırt etmek
  - Kimlik doğrulama ile yetkilendirmeyi ayırt etmek
animasyonlar: [authentication]
gorseller:
  - id: m06-04-a
    tur: ekran
    alt: Tarayıcı geliştirici araçlarında Application sekmesinde bir sitenin çerezleri; HttpOnly, Secure ve SameSite sütunları
    nasil: "Chrome/Edge'de giriş yaptığınız herhangi bir test sitesinde (veya yerel Ördek Club'da) F12 → 'Application' → sol menüde 'Storage' → 'Cookies' → site adresi. Tablo görünsün; 'HttpOnly', 'Secure' ve 'SameSite' sütunlarını kehribar (#C9953B) çerçeveyle işaretleyin. ÇEREZ DEĞERLERİNİ (Value sütunu) MUTLAKA bulanıklaştırın — bunlar oturum anahtarınızdır."
  - id: m06-04-b
    tur: ai
    karakter: celal
    alt: "Çerezci Celal çaldığı parlayan bileklikle kulüp kapısından geçmeye çalışıyor; kapıdaki robot görevli listeyi kontrol ediyor"
    prompt: "A velvet-rope doorway of a noir club where a sturdy bouncer robot checks glowing cookie-shaped wristbands against a clipboard. The villain holds up a borrowed wristband with an innocent smile, but the robot raises one hand to stop him while comparing his face to the list."
---

# Sunucu seni nasıl hatırlıyor? Cookie, oturum, token

> HTTP unutkandır: her istekte seni ilk kez görür. Seni hatırlatan şey tarayıcının
> her istekte gösterdiği küçük bir **bilet**tir.

![Çerezci Celal çaldığı parlayan bileklikle kulüp kapısından geçmeye çalışıyor; kapıdaki robot görevli listeyi kontrol ediyor](../../gorseller/m06-04-b.webp)

## Üç kavram

- **Cookie (çerez)** — Sunucunun tarayıcına bıraktığı, her istekte geri gelen küçük not.
- **Session (oturum)** — Sunucunun "bu bilet şu kişiye ait" diye tuttuğu kayıt. Çerezde sadece rastgele bir kimlik durur.
- **Token** — Kendi içinde bilgi taşıyan imzalı bilet (ör. JWT). Genelde API'lerde kullanılır.

Bilet kimin elindeyse sunucu onu **sen** sanır. Bu yüzden oturum çerezi bir paroladan farksızdır.

## Giriş akışı

::animasyon[authentication]

## Çerezin güvenlik ayarları

![Tarayıcıdaki çerez tablosu](../../gorseller/m06-04-a.webp)

| Ayar | Koruduğu şey |
|---|---|
| `HttpOnly` | JavaScript çerezi okuyamaz → XSS ile çalınması zorlaşır |
| `Secure` | Sadece HTTPS ile gönderilir |
| `SameSite` | Başka sitelerden gelen isteklere eklenmez → CSRF'e karşı |

## İki farklı soru

| | Kimlik doğrulama (authentication) | Yetkilendirme (authorization) |
|---|---|---|
| Soru | **Sen kimsin?** | **Bunu yapmaya iznin var mı?** |
| Örnek | Parola + MFA ile giriş | Öğrenci başkasının notunu göremez |
| Hata olursa | Başkası senin yerine girer | Giriş yapan herkes her şeyi görür |

Web açıklarının en yaygınlarından biri ikincisidir: giriş doğru, **yetki kontrolü eksik**.
URL'deki `/notlar/1001`'i `/notlar/1002` yaparak başkasının notunu görmek gibi (Yol A: IDOR).

## 🧪 Dene (3 dk)

Kendi tarayıcında bir sitenin çerezlerine bak. Oturum çerezinde `HttpOnly` ve `Secure` işaretli mi?
⚠️ Çerez **değerlerini** kimseyle paylaşma, ekran görüntüsüne alma.

## ✅ Akılda kalsın

- Oturum çerezi = parola değerinde bilet.
- HttpOnly, Secure, SameSite çerezi korur.
- Kimlik doğrulama "kimsin?", yetkilendirme "iznin var mı?" sorusudur.
