---
id: a-06
tur: ders
baslik: "Tarayıcı tarafı: XSS, CSRF, CORS ve CSP"
sure: 8
hedefler:
  - XSS ve CSRF'in nasıl çalıştığını açıklamak
  - CORS ve CSP'nin hangi soruya cevap verdiğini ayırt etmek
animasyonlar: [xss]
gorseller:
  - id: a-06-b
    tur: ai
    alt: "Uyuyan bir kullanıcının elini kukla ipleriyle tutup banka formunu imzalatan gölge"
    prompt: "A person dozing at a desk with a browser window open, while a shadowy hand from a different window holds puppet strings tied to the sleeping person's wrist, guiding their pen to sign a bank transfer form in front of a trusting bank clerk."
  - id: a-06-c
    tur: ai
    alt: "İki ayrı kapı görevlisi: biri hangi komşunun mektup alabileceğine, diğeri sayfaya hangi sanatçının çizim yapabileceğine bakıyor"
    prompt: "Two separate guards at a theater: one stands at the side door checking which neighboring buildings are allowed to receive copies of the program, the other stands at the stage checking a short approved list before letting any performer onto the stage."
---

# Tarayıcı tarafı: XSS, CSRF, CORS ve CSP

> Bazen saldırı sunucuda değil, **kurbanın tarayıcısında** çalışır — onun oturumuyla, onun adına.
> 🗂️ **Çekmece 6:** Portalın duyuru panosuna biri tuhaf bir not bırakmış.

::cizgi[a-06-sahne]

## XSS: sayfaya sızan script

Kullanıcı girdisi sayfaya **kaçışlanmadan** basılırsa tarayıcı onu kod olarak çalıştırır.

| Tür | Girdi nerede duruyor? |
|---|---|
| **Yansıyan** | Bağlantının içinde; kurban tıklayınca çalışır |
| **Kalıcı** | Veritabanında (yorum, duyuru); sayfayı açan herkeste çalışır |
| **DOM tabanlı** | Tarayıcıdaki JavaScript girdiyi sayfaya kendisi yazar |

::animasyon[xss]

## CSRF: senin adına istek

![Uyuyan bir kullanıcının elini kukla ipleriyle tutup banka formunu imzalatan gölge](../../gorseller/a-06-b.webp)

Başka bir site, tarayıcının **otomatik eklediği çerezlerle** senin adına istek tetikler
("şifreni değiştir", "parayı gönder"). Savunma: `SameSite` çerezler ve istek başına **CSRF token**.

## CORS ve CSP: iki ayrı soru

![İki ayrı kapı görevlisi: biri hangi komşunun mektup alabileceğine, diğeri sayfaya hangi sanatçının çizim yapabileceğine bakıyor](../../gorseller/a-06-c.webp)

| | Sorduğu soru | Tipik hata |
|---|---|---|
| **CORS** | Başka bir site bu yanıtı **okuyabilir mi?** | Her kaynağa izin + çerezlere izin |
| **CSP** | Bu sayfada **hangi script'ler** çalışabilir? | `unsafe-inline` ile XSS koruması boşa gider |

CORS bir saldırıyı engellemez; yanlış ayarlanırsa **kapıyı açar**. CSP ise XSS'e karşı ikinci kilit.

## Savunma özeti

Çıktıda bağlama göre kaçışlama (framework'ün varsayılanı), `HttpOnly` çerez, katı CSP,
SameSite + CSRF token, CORS'ta yalnızca bilinen kaynaklar.

## 🧪 Dene (5 dk)

Yerel Juice Shop'ta arama kutusuna `<b>deneme</b>` yaz. Sonuç başlığı kalın mı göründü,
yoksa etiketler olduğu gibi mi yazıldı? Kalın göründüyse bu ne anlama gelir?

## ✅ Akılda kalsın

- XSS: girdi kaçışlanmadan sayfaya basılıyor.
- CSRF: tarayıcı çerezleri otomatik ekler; token ve SameSite bunu keser.
- CORS "kim okuyabilir?", CSP "ne çalışabilir?" sorusudur.
