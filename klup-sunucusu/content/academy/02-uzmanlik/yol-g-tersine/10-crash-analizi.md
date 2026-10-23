---
id: g-10
tur: ders
baslik: "Exploit geliştirme temelleri: crash analizi, ASLR ve DEP"
sure: 8
hedefler:
  - Bir çökmenin ne kadar ciddi olduğunu debugger çıktısından değerlendirmek
  - Bellek korumalarının (canary, DEP, ASLR, CFG) açık olduğunu doğrulamak
gorseller:
  - id: g-10-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri, kapıları dişliler üzerinde dönüp her göz kırpışta yer değiştiren bir saat kulesi koridorunda artık tutmayan haritasına bakıyor; böceği kaygan, kehribar ışıklı bir rafa tırmanamayıp kayıyor"
    prompt: "Inside a grand clocktower corridor, a row of wooden doors rides on huge rotating gears and keeps swapping places, so the paper map in the villain's hands no longer matches anything. Nearby, his clockwork beetle tries to climb onto a shelf glowing with a soft amber stop symbol and slides right off its slick, polished surface. The villain scratches his bald head under his loupe, comically puzzled."
---

# Exploit geliştirme temelleri: crash analizi, ASLR ve DEP

> Her çökme (crash) bir hatadır, ama bazı çökmeler **kapı aralığıdır**. Hangisinin hangisi olduğunu ayırmak, yama önceliğini belirler.
> ⚙️ **Çark 10:** Sabri'nin bir böceği laboratuvardaki eski bir programı çökertiyor. Selim Hoca: "Kaza mı, kapı mı? Çökmeyi oku."

![Saatçi Sabri, kapıları dişliler üzerinde dönüp her göz kırpışta yer değiştiren bir saat kulesi koridorunda artık tutmayan haritasına bakıyor; böceği kaygan, kehribar ışıklı bir rafa tırmanamayıp kayıyor](../../gorseller/g-10-a.webp)

## Önce kurallar

Bu konu **yalnızca** eğitim için yazılmış, kasıtlı zafiyetli programlarda, izole VM'de ve eğitmen gözetiminde çalışılır.
Gerçek bir yazılımda açık bulursan: kullanma, **sorumlu bildirim** (responsible disclosure) yap.

## Çökmeyi okumak

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
