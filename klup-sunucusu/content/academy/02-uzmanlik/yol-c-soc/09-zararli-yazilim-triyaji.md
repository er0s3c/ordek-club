---
id: c-09
tur: ders
baslik: "Zararlı yazılım triyajı: hash, strings, YARA ve sandbox"
sure: 8
hedefler:
  - Şüpheli bir dosyayı çalıştırmadan ilk incelemeyi yapmak
  - Basit bir YARA kuralı yazmak
gorseller:
  - id: c-09-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer camdan bir deney tankının dışından endişeyle bakıyor; içerideki mekanik cımbızlar kurmalı oyuncak kutudan parlayan dişlileri çıkarıp sıraya diziyor"
    prompt: "A laboratory bench at night under a bright amber lamp, where a strange wind-up toy box sits opened inside a sealed glass sandbox tank filled with fine sand. Mechanical brass tweezers pull out tiny glowing gears one by one and lay them in a neat labeled row next to a big magnifying glass, each gear stamped with an abstract symbol. The villain presses his nose against the outside of the glass with mild panic, clutching his mop."
---

# Zararlı yazılım triyajı: hash, strings, YARA ve sandbox

> Şüpheli dosyayı **çalıştırmadan** önce çok şey öğrenebilirsin. Triyaj, "bu ne ve ne kadar tehlikeli?" sorusunun hızlı cevabıdır.
> 🧹 **İz 9:** `bakim.exe` kendine "Windows Bakım Hizmeti" diyor. İçindeki dizeler başka bir şey söylüyor.

![Temizlikçi Tamer camdan bir deney tankının dışından endişeyle bakıyor; içerideki mekanik cımbızlar kurmalı oyuncak kutudan parlayan dişlileri çıkarıp sıraya diziyor](../../gorseller/c-09-a.webp)

## Kural bir: yalnızca izole ortam

Örnekler **yalnızca** kulübün internetsiz analiz VM'inde açılır. Kendi bilgisayarında, paylaşılan klasörde
ya da e-postada zararlı örnek açılmaz. Dosyalar parolalı arşivde taşınır.

## Statik triyaj adımları

| Adım | Araç | Ne öğrenirsin? |
|---|---|---|
| **Hash** | `sha256sum` | Dosyanın parmak izi; tehdit istihbaratında aranır |
| **Tür** | `file` | Uzantı yalan söyler, dosya başlığı söylemez |
| **Dizeler** (strings) | `strings -n 6` | Alan adları, yollar, kayıt defteri anahtarları, API adları |
| **Kural** | `yara` | Bilinen kalıplarla eşleşiyor mu? |

```bash
sha256sum ornek.bin
file ornek.bin
strings -n 6 ornek.bin | less
```

Hash'i tehdit istihbaratı platformlarında **aramak** güvenlidir; dosyanın kendisini yüklemek değildir.
Kurum içi belge ya da kişisel veri içerebilecek bir dosya, izin almadan dışarıdaki bir hizmete gönderilmez.

## YARA: kalıpla tanıma

```text
rule Kulup_BakimAjan
{
    meta:
        aciklama = "Kalkan: bakim.exe ailesi"
    strings:
        $a = "guncelleme.kotu.test" ascii
        $b = "WinBakimSvc" ascii
        $c = "BakimAjan" ascii
    condition:
        2 of them
}
```

`2 of them` tek bir dizenin tesadüfen geçtiği dosyalarda yanlış pozitifi azaltır.

## Sandbox raporu nasıl okunur?

Kum havuzu (sandbox), dosyayı kapalı bir VM'de çalıştırıp davranışını raporlar. Rapora üç soruyla bak:
**Hangi işlemleri başlattı? Nereye bağlandı? Ne bıraktı (dosya, servis, kayıt defteri)?**
Bu cevaplar, C05'teki IOA'lardır.

## 🧪 Dene (5 dk)

Sentetik `strings` çıktısıyla (gerçek dosya değil, düz metin):

```bash
grep -E "\.test|Run|Svc|/k/" /opt/akademi/c-bakim-strings.txt
yara kulup.yar /opt/akademi/c-bakim-strings.txt
```

Kuralı `kulup.yar` adıyla kaydet. Eşleşiyor mu? Dizelerden hangi kalıcılık yöntemini ve hangi nabız aralığını (saniye) çıkarabilirsin?

## ✅ Akılda kalsın

- Önce hash, tür ve dizeler; çalıştırmak en son ve yalnızca izole ortamda.
- YARA, birden fazla dizeyi koşulla birleştirerek aileyi tanır.
- Sandbox raporu üç soruya cevap verir: ne çalıştı, nereye bağlandı, ne bıraktı.
