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
  - id: m09-03-a
    tur: ai
    karakter: mine
    alt: "Arkası açılmış bir fotoğraftan Maskeli Mine cımbızla konum iğnesini çekip alıyor"
    prompt: "A printed photograph of a sunny harbor floats in the air, flipped open like a hinged lid, revealing a hidden compartment with small glowing icons: a location pin, a tiny camera, a clock, a calendar page. The villain plucks the location pin out with tweezers, smiling coldly."
---

# Bir fotoğraf ne anlatır?

> Telefonla çekilen bir fotoğraf, görünmeyen bir **künye** taşıyabilir: tarih, cihaz, hatta konum.

![Arkası açılmış bir fotoğraftan Maskeli Mine cımbızla konum iğnesini çekip alıyor](../../gorseller/m09-03-a.webp)

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

1. **İlk kaynak kim?** Bilgiyi ilk kim yayınladı?
2. **Bağımsız bir ikinci kaynak var mı?** Birbirini kopyalayan on site tek bir kaynaktır.
3. **Zaman ve yer tutarlı mı?** Gölgeler, hava durumu, tabelalar, iddia edilen tarih…

**Tersine görsel arama** ile bir fotoğrafın internette daha önce nerede kullanıldığını bulabilirsin.
"Yeni" denen bir ev fotoğrafı yıllar önce başka bir ülkenin ilanında çıkıyorsa…

## Sahte profil göstergeleri

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
