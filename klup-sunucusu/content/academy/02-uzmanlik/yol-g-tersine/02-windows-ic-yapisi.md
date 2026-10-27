---
id: g-02
tur: ders
baslik: "Windows iç yapısı: process, DLL ve PE biçimi"
sure: 7
hedefler:
  - Process, thread, DLL ve API kavramlarını ayırt etmek
  - Bir PE dosyasının başlık, bölüm ve import tablosunu okumak
gorseller:
  - id: g-02-b
    tur: ai
    alt: "Bir kitap gibi açılmış program dosyası: kapak sayfası, içindekiler, bölümler ve ekler"
    prompt: "A large program file drawn as an old book opened on a desk, with a decorated cover plate, silk ribbon bookmarks pointing to chapters, separate thick sections tied with different colored strings, and an appendix of borrowed pages clipped at the back."
---

# Windows iç yapısı: process, DLL ve PE biçimi

> Bir `.exe` dosyası rastgele baytlar değildir; düzenli bir **dolaptır**. Hangi çekmecede ne olduğunu bilen, nereye bakacağını bilir.
> ⚙️ **Çark 2:** USB'deki böcek bir kampüs güncellemesi kılığında. Selim Hoca: "Kabuğunu tanımadan içini açamazsın."

::cizgi[g-02-sahne]

## Dört kavram

- **Process** (süreç): çalışan programın kendine ait bellek alanı.
- **Thread** (iş parçacığı): process içinde kodu yürüten birim.
- **DLL** (dynamic link library): programların paylaştığı kod kütüphanesi — `kernel32.dll`, `advapi32.dll`.
- **API**: programın Windows'tan iş istemesi — dosya aç, registry'ye yaz, internete bağlan.

## PE biçimi

![Bir kitap gibi açılmış program dosyası: kapak sayfası, içindekiler, bölümler ve ekler](../../gorseller/g-02-b.webp)

PE (Portable Executable), `.exe`, `.dll` ve `.sys` dosyalarının yapısıdır.

| Parça | Ne söyler? |
|---|---|
| **DOS başlığı** | İlk iki bayt `4D 5A` ("MZ"): "Ben Windows çalıştırılabilir dosyasıyım" |
| **PE başlığı** | Mimari (x86/x64), derleme zamanı (timestamp), giriş noktası (entry point) |
| **Bölümler** (sections) | `.text` kod, `.rdata` sabitler, `.data` veri, `.rsrc` simge ve sürüm bilgisi |
| **Import tablosu** | Hangi DLL'den hangi API'leri kullandığı |

## Analist neden umursar?

- Import'lar niyeti fısıldar: `RegSetValueExW` → registry'ye yazacak, `HttpSendRequestA` → veri gönderecek.
- Tanıdık olmayan bölüm adı, yazılabilir **ve** çalıştırılabilir (RWX) bölüm, giriş noktasının `.text` dışında olması → şüphe.
- Derleme zamanı ve sürüm bilgisi kolayca sahtelenir; tek başına delil değildir.

## 🧪 Dene (5 dk)

Linux yardımcı VM'inde kurgusal örneğin PE özetini aç:

```bash
less /opt/akademi/g-saat-bocegi-pe.txt
```

1. Mimari ne, imza var mı?
2. Hangi bölümün adı tuhaf, izinleri ne? Giriş noktası (`0xC1A0`) hangi bölümün içinde?
3. Derleme zamanına bak: sence gerçek mi?

## ✅ Akılda kalsın

- PE dosyası başlık, bölümler ve import tablosundan oluşur.
- Import tablosu programın ne yapmak istediğini ele verir.
- Tuhaf bölüm ve dışarıda bir giriş noktası, paketleme şüphesidir.
