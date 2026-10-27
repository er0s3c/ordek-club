---
id: c-06
tur: ders
baslik: "Windows adli bilişim: olay kayıtları, Sysmon, registry, prefetch"
sure: 9
hedefler:
  - Kritik Windows olay kimliklerini tanımak
  - Log temizleme ve saat değiştirme izlerini tespit etmek
gorseller:
  - id: c-06-b
    tur: ai
    alt: "Silinmiş bir defter sayfasının arkasındaki sayfada kalem baskısının izleri el feneriyle görünür oluyor"
    prompt: "A detective shines a flashlight at a low angle across a blank notebook page where the previous page was torn out, revealing the pressed grooves of what was once written, and a torn stub of paper still visible in the binding."
---

# Windows adli bilişim: olay kayıtları, Sysmon, registry, prefetch

> Windows olan her şeyi bir yere yazar. Adli bilişimci (forensic analyst) **nereye** yazdığını bilen kişidir.
> 🧹 **İz 6:** KLP-WS07'de güvenlik günlüğü temizlendi. Temizlemenin kendisi de bir olay kimliği taşır.

::cizgi[c-06-sahne]

## Ezberlenecek olay kimlikleri

| Kimlik | Kanal | Anlamı |
|---|---|---|
| 4624 / 4625 | Security | Başarılı / başarısız oturum (tür 10 = RDP, 2 = konsol, 3 = ağ) |
| 4720 / 4732 | Security | Hesap oluşturuldu / yerel gruba üye eklendi |
| 7045 | System | Yeni hizmet kuruldu (kalıcılık!) |
| 4719 | Security | Denetim politikası değişti |
| **1102** | Security | **Güvenlik günlüğü temizlendi** |
| **4616** | Security | **Sistem saati değiştirildi** |

Sysmon ek ayrıntı verir: 1 = işlem başlatma, 3 = ağ bağlantısı, 11 = dosya oluşturma,
13 = kayıt defteri, **2 = dosya oluşturma zamanı değişti**, 23 = dosya silindi.

## Silinenin izi

![Silinmiş bir defter sayfasının arkasındaki sayfada kalem baskısının izleri el feneriyle görünür oluyor](../../gorseller/c-06-b.webp)

Saldırgan → savunucu eşleşmesi:

- **Log temizleme** → 1102 olayı ve `wevtutil cl` komutunu gösteren Sysmon 1 kaydı. Merkezî SIEM'deki kopya yaşar.
- **Saat kaydırma** → 4616'da önceki ve yeni saat; olay zamanı ile SIEM alınma zamanı arasında açılan fark.
- **Dosya zamanını değiştirme (timestomping)** → Sysmon 2; dosyanın "eski" görünmesi ama başka kayıtlarda yeni olması.

## Registry ve prefetch

- **Registry Run anahtarı** (`HKLM\...\CurrentVersion\Run`): her açılışta çalışacak programlar. Kalıcılığın klasik yeri.
- **Prefetch** (`C:\Windows\Prefetch\*.pf`): bir programın **çalıştığını**, kaç kez ve en son ne zaman çalıştığını gösterir.
  Dosya silinse bile prefetch izi kalabilir.

## 🧪 Dene (5 dk)

```bash
jq -c 'select(.olay_id==1102 or .olay_id==4616 or .olay_id==4719)' /opt/akademi/c-windows-olaylar.jsonl
grep -E ",2,|,23," /opt/akademi/c-sysmon.csv
```

Günlüğü kim, saat kaçta temizledi? Saat kaç saat kaydırıldı ve sonra kim düzeltti? `bakim.exe`'nin "yeni" oluşturma tarihi neden şüpheli?

## ✅ Akılda kalsın

- 4624/4625, 4720/4732, 7045, 1102 ve 4616 Windows incelemesinin omurgasıdır.
- Gizlenme çabası da iz bırakır: 1102, 4616, Sysmon 2 ve 23.
- Run anahtarı kalıcılığı, prefetch çalıştırmayı gösterir.
