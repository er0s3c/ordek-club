---
id: m09-03
tur: ders
baslik: Bir fotoğraf ne anlatır? Metadata ve doğrulama
sure: 8
hedefler:
  - Görsel metadata'sını (EXIF) incelemek
  - Bir bilgiyi birden fazla bağımsız kaynakla doğrulamak
  - Sahte profil göstergelerini tanımak
gorseller:
  - id: m09-03-b
    tur: ai
    alt: "Bir fotoğrafı üç aletle inceleyen dedektif: kaynağa uzanan iplik, ikinci bir fotoğrafla karşılaştırma ve saat ile pusula"
    prompt: "A detective at a desk examines a single photo with three tools: a red thread leading from the photo back to its original source on a pinboard, a second independent photo placed beside it for comparison, and a pocket watch with a compass to check time and place against shadows in the photo."
  - id: m09-03-c
    tur: ai
    alt: "Vitrindeki kusursuz bir mankene benzeyen profil; arkasında karton destekler ve kopyala-yapıştır yapılmış aynı yorumlar"
    prompt: "A perfect smiling mannequin displayed in a shop window as a social profile, but seen from behind it is held up by cardboard braces, and a crowd of identical cardboard cutouts in front of it all wear the same expression and raise the same hand."
---

# Bir fotoğraf ne anlatır?

> Telefonla çekilen bir fotoğraf, görünmeyen bir **künye** taşıyabilir: tarih, cihaz, hatta konum.

::cizgi[m09-03-sahne]

## EXIF: fotoğrafın künyesi

```bash
exiftool tatil.jpg | grep -Ei "date|model|gps"
```

| Alan | Örnek |
|---|---|
| Çekim tarihi | 2026:03:02 18:41 |
| Cihaz | Telefon modeli |
| GPS | Enlem / boylam |

Çoğu sosyal medya platformu yüklenen fotoğraflardan EXIF'i **siler**; ama e-postayla veya dosya olarak gönderilen
fotoğraflarda kalabilir. **Paylaşmadan önce sen sil** (Windows: Özellikler → Ayrıntılar → "Özellikleri kaldır").

## Doğrulamanın üç sorusu

![Bir fotoğrafı üç aletle inceleyen dedektif: kaynağa uzanan iplik, ikinci bir fotoğrafla karşılaştırma ve saat ile pusula](../../gorseller/m09-03-b.webp)

1. **İlk kaynak kim?** Bilgiyi ilk kim yayınladı?
2. **Bağımsız bir ikinci kaynak var mı?** Birbirini kopyalayan on site tek bir kaynaktır.
3. **Zaman ve yer tutarlı mı?** Gölgeler, hava durumu, tabelalar, iddia edilen tarih…

**Tersine görsel arama** ile bir fotoğrafın internette daha önce nerede kullanıldığını bulabilirsin.
"Yeni" denen bir ev fotoğrafı yıllar önce başka bir ülkenin ilanında çıkıyorsa…

## Sahte profil göstergeleri

![Vitrindeki kusursuz bir mankene benzeyen profil; arkasında karton destekler ve kopyala-yapıştır yapılmış aynı yorumlar](../../gorseller/m09-03-c.webp)

- Hesap çok yeni ama binlerce takipçisi var
- Profil fotoğrafı tersine aramada başka bir isimle çıkıyor
- Paylaşımlar sadece kampanya/teklif içerikli; kişisel etkileşim yok
- Yazım dili ile iddia edilen konum/kimlik uyuşmuyor
- Yorumlar birbirinin aynısı

Tek bir işaret kanıt değildir; **birden fazla işaret** bir arada güven düzeyini düşürür.

## 🧪 Dene (5 dk)

Kendi telefonunla bir fotoğraf çek, bilgisayarına aktar ve EXIF'ine bak (exiftool veya dosya Özellikleri).
Konum bilgisi var mı? Varsa telefonunda kamera konum etiketini kapatmak ister misin?

## ✅ Akılda kalsın

- Fotoğraflar tarih, cihaz ve konum taşıyabilir; paylaşmadan önce temizle.
- Doğrulama: ilk kaynak, bağımsız ikinci kaynak, zaman/yer tutarlılığı.
- Tek işaret kanıt değil; işaretler birlikte değerlendirilir.
