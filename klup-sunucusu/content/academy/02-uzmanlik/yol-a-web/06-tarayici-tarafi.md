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
  - id: a-06-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine kalabalık bir salondaki ilan panosuna masum görünen bir not iğneliyor; notu okuyanların bileğine yeşil kukla ipi bağlanıyor"
    prompt: "A busy university hall with a large public corkboard. The villain pins an innocent-looking glowing note onto the board with a smile. Passing students who glance at the note get a thin glowing green puppet string attached to their wrists, the strings trailing back to the villain's pen."
---

# Tarayıcı tarafı: XSS, CSRF, CORS ve CSP

> Bazen saldırı sunucuda değil, **kurbanın tarayıcısında** çalışır — onun oturumuyla, onun adına.
> 🗂️ **Çekmece 6:** Portalın duyuru panosuna biri tuhaf bir not bırakmış.

![Tek Tırnak Jasmine kalabalık bir salondaki ilan panosuna masum görünen bir not iğneliyor; notu okuyanların bileğine yeşil kukla ipi bağlanıyor](../../gorseller/a-06-a.webp)

## XSS: sayfaya sızan script

Kullanıcı girdisi sayfaya **kaçışlanmadan** basılırsa tarayıcı onu kod olarak çalıştırır.

| Tür | Girdi nerede duruyor? |
|---|---|
| **Yansıyan** | Bağlantının içinde; kurban tıklayınca çalışır |
| **Kalıcı** | Veritabanında (yorum, duyuru); sayfayı açan herkeste çalışır |
| **DOM tabanlı** | Tarayıcıdaki JavaScript girdiyi sayfaya kendisi yazar |

::animasyon[xss]

## CSRF: senin adına istek

Başka bir site, tarayıcının **otomatik eklediği çerezlerle** senin adına istek tetikler
("şifreni değiştir", "parayı gönder"). Savunma: `SameSite` çerezler ve istek başına **CSRF token**.

## CORS ve CSP: iki ayrı soru

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
