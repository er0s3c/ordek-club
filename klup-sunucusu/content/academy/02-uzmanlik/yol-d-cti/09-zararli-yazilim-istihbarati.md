---
id: d-09
tur: ders
baslik: "Zararlı yazılım istihbaratı: aynı aile mi, aynı el mi?"
sure: 8
hedefler:
  - Kesin ve bulanık hash'lerle örnekleri kümelemek
  - Kod yeniden kullanımı ve sızdırılmış araçların atıfı nasıl yanılttığını açıklamak
gorseller:
  - id: d-09-b
    tur: ai
    alt: "Saldırganın kolayca değiştirdiği şapka ve kaşe ile değiştiremediği yürüyüş biçimi; dedektif ayak izi desenine bakıyor"
    prompt: "A shadowy figure tries on hats and fake mustaches in front of a mirror, changing disguises easily, while a detective ignores the disguises and studies the unique repeated pattern of their footprints across the floor."
---

# Zararlı yazılım istihbaratı: aynı aile mi, aynı el mi?

> Bir zararlı yazılımın üstündeki isim etikettir; içindeki yapı ise parmak izi.
> 🚩 **Bayrak 9:** DLL'in içinde kocaman bir imza var: `MERCAN-7 was here`. Gerçek bir grup imzasını neden bu kadar kolay bulunur bıraksın?

::cizgi[d-09-sahne]

## Hash türleri

| Hash | Ne söyler? | Sınır |
|---|---|---|
| **MD5 / SHA-256** | Bu dosya birebir aynı mı? | Tek bayt değişse tamamen değişir |
| **ssdeep / TLSH** (bulanık, fuzzy) | Dosyalar ne kadar **benzer**? | Paketlenmiş (packed) dosyada yanıltabilir |
| **imphash** | Hangi işlevleri aynı sırayla içe aktarıyor? | Aynı derleyiciyle üretilen her şey benzer çıkar |

```bash
sha256sum svc_update.dll
strings -n 8 svc_update.dll | grep -i mercan
```

## Aile ve örnek

**Örnek (sample)** tek bir dosya, **aile (family)** ortak kodu paylaşan örnekler kümesidir.
Bulanık hash ve imphash ile örnekleri kümeler, kum havuzu (sandbox) raporlarıyla davranışlarını karşılaştırırsın.

## Ucuz izler, pahalı izler

![Saldırganın kolayca değiştirdiği şapka ve kaşe ile değiştiremediği yürüyüş biçimi; dedektif ayak izi desenine bakıyor](../../gorseller/d-09-b.webp)

| Taklidi kolay | Taklidi zor |
|---|---|
| Dizeler, klasör ve görev adları | Altyapıya sahip olmak ve onu işletmek |
| Dil ayarı, derleme saati | Uzun süreli prosedür alışkanlıkları |
| Başka grubun sızan aracı | Hedef seçimi ve operasyon ritmi |

**Sızdırılmış derleyici (leaked builder):** bir grubun aracı herkese açık hâle gelince, onun "imzası" artık herkesindir.
Bu durumda aynı aile, aynı el demek değildir.

## IOC kümeleri

Örneklerden çıkan alan adlarını, IP'leri ve mutex/görev adlarını **bir küme** olarak kaydet; tek tek değil.
Küme yeni bir örnekte kısmen görünürse, ilişki ihtimalini değerlendirebilirsin.

## 🧪 Dene (5 dk)

`lab/d-tehdit-raporlari.md` → K5 ekindeki tabloya bak. H1 hangi örneklere benziyor, hangisine benzemiyor?
imphash eşleşmesi neyi kanıtlar, neyi kanıtlamaz? `MERCAN-7 was here` dizesi atıf için güçlü mü, zayıf mı? Neden?

## ✅ Akılda kalsın

- SHA-256 "aynı dosya", ssdeep/TLSH "benzer dosya", imphash "benzer yapım" der.
- Dizeler ve adlar ucuz izlerdir; Bedri'nin ilk dikeceği bayrak onlardır.
- Sızan bir araç, aynı aileyi farklı ellere dağıtır.
