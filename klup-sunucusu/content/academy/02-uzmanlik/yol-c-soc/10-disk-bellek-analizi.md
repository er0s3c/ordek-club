---
id: c-10
tur: ders
baslik: "Disk ve bellek analizi: Autopsy, MFT ve Volatility 3"
sure: 9
hedefler:
  - Kanıt imajının bütünlüğünü hash ile doğrulamak
  - Disk ve bellek analizinde ilk bakılacak yerleri bilmek
gorseller:
  - id: c-10-b
    tur: ekran
    alt: "Autopsy'de laboratuvar disk imajının Timeline görünümü; bir dosyanın oluşturma ve değiştirme zamanları yan yana"
    nasil: "Kulüp laboratuvarındaki sentetik disk imajını (eğitmenin verdiği ders imajı) Autopsy'de yeni bir vakaya ekleyin. Timeline aracını açın, 2026-03-14 gününe yakınlaştırın ve C:\\Users\\Public klasöründeki bir dosyanın satırını seçin. Dosyanın oluşturma ve değiştirme zaman sütunlarını kehribar (#C9953B) çerçeveyle işaretleyin. Vaka adı ve inceleyen adı alanlarında gerçek isim kullanmayın; ekranda kişisel yol veya kullanıcı adı varsa bulanıklaştırın."
  - id: c-10-c
    tur: ai
    alt: "Masada buz gibi eriyen bir ipucu ile taşa kazınmış bir ipucu; dedektif önce eriyen buzu fotoğraflıyor"
    prompt: "A detective's desk with two clues: a small ice sculpture already melting into a puddle and a stone tablet with carved marks; the detective urgently photographs the melting ice first while the stone waits calmly."
---

# Disk ve bellek analizi: Autopsy, MFT ve Volatility 3

> Log silinebilir, dosya silinebilir. Ama disk ve bellek, silinenin **gölgesini** taşır.
> 🧹 **İz 10:** `bakim.exe` kendini bir yıl önce oluşturulmuş gibi gösteriyor. MFT'nin ikinci saati başka bir tarih söylüyor.

::cizgi[c-10-sahne]

## Önce bütünlük

Asla orijinal diskte çalışılmaz. **Kopya imaj** alınır, hash'i hesaplanır, analiz kopyanın kopyasında yapılır.

```bash
sha256sum ws07-disk.E01 > ws07-disk.E01.sha256
sha256sum -c ws07-disk.E01.sha256
```

İki hash aynıysa imaj değişmemiştir. Bu değer delil zinciri formuna yazılır (C11).

## Uçucu olandan başla

![Masada buz gibi eriyen bir ipucu ile taşa kazınmış bir ipucu; dedektif önce eriyen buzu fotoğraflıyor](../../gorseller/c-10-c.webp)

Kanıt toplama sırası (order of volatility): **bellek → ağ bağlantıları → disk → yedekler.** Cihazı kapatırsan bellek gider.
Disk imajı alınırken **yazma engelleyici (write blocker)** kullanılır; böylece inceleme orijinal diske tek bir bayt bile yazmaz.

## Disk: Autopsy ve MFT

**Autopsy**, disk imajını açan açık kaynaklı adli bilişim arayüzüdür: dosya sistemi, silinmiş dosyalar, zaman çizelgesi, anahtar kelime arama.

NTFS'te her dosyanın kaydı **MFT (Master File Table)** içindedir ve iki zaman takımı taşır:

| Öznitelik | Kim değiştirebilir? |
|---|---|
| `$STANDARD_INFORMATION` | Kullanıcı düzeyindeki araçlar kolayca değiştirir |
| `$FILE_NAME` | Çekirdek yönetir; değiştirmek çok daha zordur |

İkisi arasında büyük fark varsa: **zaman damgası oynanmış (timestomping)** olabilir.

![Autopsy'de laboratuvar disk imajının Timeline görünümü](../../gorseller/c-10-b.webp)

## Bellek: Volatility 3

Bellek imajında çalışan işlemler, ağ bağlantıları ve diske hiç yazılmamış kod görünür.

```bash
vol -f ws07-bellek.raw windows.pslist
vol -f ws07-bellek.raw windows.pstree
vol -f ws07-bellek.raw windows.netscan
vol -f ws07-bellek.raw windows.cmdline
```

`pstree`'de tuhaf ebeveyn-çocuk ilişkisi, `netscan`'de dış IP'ye açık bağlantı ararsın.

## 🧪 Dene (5 dk)

Eğitmenin verdiği sentetik ders imajlarıyla: önce `sha256sum -c` ile bütünlüğü doğrula. Sonra `windows.netscan` çıktısında
`198.51.100.200` adresine bağlı işlemin adını ve PID'sini bul. Bu işlemin ebeveyni `pstree`'de kim?

## ✅ Akılda kalsın

- Orijinale dokunma: imaj al, hash'le, kopyada çalış.
- MFT'de iki saat vardır; aralarındaki fark zaman oynamasını ele verir.
- Bellek, diske yazılmayanı gösterir: pslist, pstree, netscan, cmdline.
