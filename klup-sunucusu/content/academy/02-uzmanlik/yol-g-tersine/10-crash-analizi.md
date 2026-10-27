---
id: g-10
tur: ders
baslik: "Exploit geliştirme temelleri: crash analizi, ASLR ve DEP"
sure: 8
hedefler:
  - Bir çökmenin ne kadar ciddi olduğunu debugger çıktısından değerlendirmek
  - Bellek korumalarının (canary, DEP, ASLR, CFG) açık olduğunu doğrulamak
gorseller:
  - id: g-10-b
    tur: ai
    alt: "Devrilmiş bir domino dizisinin son taşından geriye doğru iz süren dedektif"
    prompt: "A detective kneels at the end of a fallen line of dominoes and traces backward with a flashlight to find the first domino that tipped, marking it with chalk."
---

# Exploit geliştirme temelleri: crash analizi, ASLR ve DEP

> Her çökme (crash) bir hatadır, ama bazı çökmeler **kapı aralığıdır**. Hangisinin hangisi olduğunu ayırmak, yama önceliğini belirler.
> ⚙️ **Çark 10:** Sabri'nin bir böceği laboratuvardaki eski bir programı çökertiyor. Selim Hoca: "Kaza mı, kapı mı? Çökmeyi oku."

::cizgi[g-10-sahne]

## Önce kurallar

Bu konu **yalnızca** eğitim için yazılmış, kasıtlı zafiyetli programlarda, izole VM'de ve eğitmen gözetiminde çalışılır.
Gerçek bir yazılımda açık bulursan: kullanma, **sorumlu bildirim** (responsible disclosure) yap.

## Çökmeyi okumak

![Devrilmiş bir domino dizisinin son taşından geriye doğru iz süren dedektif](../../gorseller/g-10-b.webp)

| Gösterge | Soru |
|---|---|
| İstisna kodu | `0xC0000005` (access violation): okurken mi, yazarken mi? |
| `RIP` değeri | Anlamlı bir adres mi, yoksa girdiden gelmiş gibi `0x4141414141414141` mı? |
| Stack | Dönüş adresleri bozulmuş mu? |

`RIP` girdi verisiyle dolmuşsa çökme **denetlenebilir** demektir: kritik bulgu, yama önceliği en üstte.

## Korumalar

| Koruma | Ne yapar? |
|---|---|
| **Stack canary** | Dönüş adresinin önüne gizli bir değer koyar; bozulursa program durur |
| **DEP / NX** | Veri bölgelerindeki baytlar kod olarak çalıştırılamaz |
| **ASLR** | Modüller her açılışta başka adrese yüklenir; adres tahmini zorlaşır |
| **CFG / CET** | Dolaylı çağrıların ve dönüşlerin hedefini doğrular |

Korumalar katman katmandır. Savunmacının işi, hepsinin **açık** olduğundan ve eski, korumasız modül kalmadığından emin olmaktır.
Kurgusal örneğin PE özetindeki `DYNAMIC_BASE yok` satırı tam da böyle bir bulgudur.

## 🧪 Dene (5 dk)

Analiz VM'inde sistem ve tek program düzeyinde korumaları kontrol et:

```powershell
Get-ProcessMitigation -System
Get-ProcessMitigation -Name notepad.exe
```

Linux yardımcı VM'inde üç programı karşılaştır:

```bash
checksec --file=/usr/bin/ls
```

DEP, ASLR ve CFG açık mı? Hangi programda PIE ya da canary eksik?

## ✅ Akılda kalsın

- Bu çalışma yalnızca eğitim programlarında yapılır; gerçek açık sorumlu bildirilir.
- `RIP` girdi verisiyle dolmuşsa çökme kritik bir bulgudur.
- Canary, DEP, ASLR ve CFG birlikte çalışır; hepsinin açık olduğunu doğrula.
