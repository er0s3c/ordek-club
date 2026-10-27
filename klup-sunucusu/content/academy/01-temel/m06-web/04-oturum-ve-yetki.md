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
  - id: m06-04-c
    tur: ai
    alt: "Kulüp kapısında iki kontrol: ilk görevli kimlik kartına bakıyor, içerideki ikinci görevli VIP odasının listesine bakıyor"
    prompt: "A jazz club entrance with two checkpoints: at the front door a bouncer compares a guest's face with their photo ID card, and inside, at a velvet rope before a private back room, a second host checks a short guest list and politely stops the same guest from entering."
---

# Sunucu seni nasıl hatırlıyor? Cookie, oturum, token

> HTTP unutkandır: her istekte seni ilk kez görür. Seni hatırlatan şey tarayıcının
> her istekte gösterdiği küçük bir **bilet**tir.

::cizgi[m06-04-sahne]

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

![Kulüp kapısında iki kontrol: ilk görevli kimlik kartına bakıyor, içerideki ikinci görevli VIP odasının listesine bakıyor](../../gorseller/m06-04-c.webp)

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
