---
id: d-04
tur: ders
baslik: "Görsel ve coğrafi OSINT: bu fotoğraf ne zaman, nerede çekildi?"
sure: 7
hedefler:
  - EXIF verisini okuyup bir görselin iddiasıyla karşılaştırmak
  - Tersine görsel arama ve gölge/yer işaretleriyle görsel doğrulamak
gorseller:
  - id: d-04-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri gemi güvertesinde boyalı bir şehir manzarası dekorunun önüne fotoğraf makinesi kuruyor; gerçek sisli liman çerçevenin hemen dışında görünüyor"
    prompt: "A ship deck at dusk turned into a tiny photo studio: a painted backdrop of a sunny modern office skyline on a wooden frame and a vintage camera on a tripod. The villain carefully adjusts the backdrop and places a potted palm tree in front of it, while the real foggy harbor, the ship's mast and a lighthouse are clearly visible just outside the backdrop, and the shadows on the backdrop fall in the opposite direction from the real ones."
---

# Görsel ve coğrafi OSINT: bu fotoğraf ne zaman, nerede çekildi?

> Bir fotoğraf bin kelimeye bedel; sahte bir fotoğraf bin yanlış rapora.
> 🚩 **Bayrak 4:** "Mercan Kolektifi" sorumluluğu üstlenip bir de fotoğraf paylaşmış: "İşte ofisimiz." Fazla cömert değil mi?

![Bayrakçı Bedri gemi güvertesinde boyalı bir şehir manzarası dekorunun önüne fotoğraf makinesi kuruyor; gerçek sisli liman çerçevenin hemen dışında görünüyor](../../gorseller/d-04-a.webp)

## EXIF: dosyanın kendi ifadesi

Fotoğraflar çekim tarihi, cihaz, yazılım ve bazen **GPS** konumu taşır (EXIF, Exchangeable Image File Format).

```bash
exiftool foto.jpg
exiftool -DateTimeOriginal -Model -Software -GPSPosition foto.jpg
exiftool -all= foto.jpg        # kendi fotoğrafından meta veriyi temizle
```

Dikkat: sosyal medya çoğu EXIF'i siler ve EXIF **kolayca düzenlenir**. Tutarsızlık güçlü bir ipucudur; tutarlılık ise kanıt değildir.

## Tersine görsel arama (reverse image search)

Görseli birden çok arama motorunda ara. Aynı fotoğraf yıllar önce başka bir bağlamda yayınlanmışsa, iddia çöker.
Kırpılmış veya aynalanmış kopyalar için görselin bir parçasıyla da ara.

## Doğrulama soruları

| Soru | Neye bakılır? |
|---|---|
| **Kim** çekti? | İlk paylaşan hesap, hesabın yaşı |
| **Ne zaman?** | EXIF, ilk yayın tarihi, mevsim, gölge uzunluğu (chronolocation) |
| **Nerede?** | Tabelalar, mimari, dağ ve kıyı hatları (geolocation) |
| **Neden şimdi?** | Fotoğraf hangi iddiayı desteklemek için paylaşıldı? |

## Etik çizgi

Coğrafi doğrulama yalnızca **kurgusal vakalarda ve kendi fotoğraflarında** yapılır.
Gerçek bir kişinin fotoğrafından evini veya rutinini bulmak bu yolun konusu değildir.

## 🧪 Dene (4 dk)

1. `lab/d-tehdit-raporlari.md` → K4'teki `exiftool` çıktısını oku. Fotoğrafın iddiasıyla çelişen üç alan hangisi?
2. Kendi telefonunla çektiğin bir fotoğrafı `exiftool` ile aç: konum bilgisi var mı? Varsa temizle.

## ✅ Akılda kalsın

- EXIF kolay düzenlenir: tutarsızlık ipucudur, tutarlılık kanıt değildir.
- İlk yayın tarihi, iddia edilen tarihten eskiyse hikâye çöker.
- Coğrafi doğrulama yalnızca kurgusal vakalarda ve kendi fotoğraflarında.
