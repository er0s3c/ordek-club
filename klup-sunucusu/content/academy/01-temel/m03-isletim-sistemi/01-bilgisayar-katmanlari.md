---
id: m03-01
tur: ders
baslik: Bilgisayarının katmanları ve dosyaların gerçek adı
sure: 7
hedefler:
  - Donanım, işletim sistemi ve uygulama katmanlarını ayırt etmek
  - Dosya uzantısı hilesini tanımak
gorseller:
  - id: m03-01-b
    tur: ekran
    alt: Windows Dosya Gezgini'nde Görünüm menüsünde "Dosya adı uzantıları" seçeneğinin açık olması
    nasil: "Windows 11'de Dosya Gezgini'ni açın → üst çubuktaki 'Görünüm' → 'Göster' → 'Dosya adı uzantıları' işaretli olsun. Menünün açık hâlini ve arkada örnek dosyaları gösterin: 'odev.pdf' ile 'odev.pdf.exe' adlı iki boş test dosyası oluşturun. Menü seçeneğini kehribar (#C9953B) çerçeveyle işaretleyin. Masaüstünüzde kişisel klasör adı görünmesin."
  - id: m03-01-c
    tur: ai
    alt: "PDF belgesi kostümü giymiş küçük bir robot; kostümün arkasından fermuar ve dişliler görünüyor"
    prompt: "A tiny mischievous robot wearing a costume shaped like a harmless paper document with a folded corner, the costume zipper half open at the back revealing whirring gears and a glowing red core, standing innocently in a file folder among real paper documents."
---

# Bilgisayarının katmanları ve dosyaların gerçek adı

> Bir saldırgan seni "uygulama" katmanında kandırır, ama asıl hedefi alttaki katmandır.
> Katmanları bilen, hilenin nerede olduğunu görür.

::cizgi[m03-01-sahne]

> 🕴️ **DOSYA: Anahtarcı Rıza** · *Çilingir*
>
> ![Anahtarcı Rıza — Çilingir](../../gorseller/karakter-riza.webp)
>
> **Tehdit:** Yönetici yetkisi ele geçirme, başlangıca saklanma (kalıcılık), sahte dosya uzantıları. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[riza-acilis]

## Dört katman

1. **Donanım** — işlemci, bellek, disk, ağ kartı.
2. **İşletim sistemi** (OS) — donanımı yönetir; dosyalar, kullanıcılar ve yetkiler onun işidir.
3. **Uygulamalar** — tarayıcı, Word, oyunlar. OS'tan izin isteyerek çalışır.
4. **Sen** — neye tıklayacağına sen karar verirsin. Saldırganın en çok uğraştığı katman.

## Windows mu, Linux mu?

| | Windows | Linux |
|---|---|---|
| Nerede? | Ev ve ofis bilgisayarları | Sunucular, bulut, güvenlik araçları |
| Yönetici | Administrator | root |
| Güncelleme | Windows Update | Paket yöneticisi (`apt`, `dnf`) |

Güvenlikçi **ikisini de** tanır; saldırılar ve savunmalar ikisinde de farklı görünür.

## Uzantı hilesi

![PDF belgesi kostümü giymiş küçük bir robot; kostümün arkasından fermuar ve dişliler görünüyor](../../gorseller/m03-01-c.webp)

Windows varsayılan olarak bilinen uzantıları **gizler**. Bu yüzden `odev.pdf.exe` sana `odev.pdf` gibi görünür —
ama açtığında bir program çalışır.

![Dosya adı uzantılarının açılması](../../gorseller/m03-01-b.webp)

Riskli uzantılar: `.exe` `.scr` `.bat` `.cmd` `.js` `.vbs` `.lnk` `.iso` ve makrolu `.docm` / `.xlsm`.

## 🧪 Dene (2 dk)

Kendi bilgisayarında **Dosya adı uzantıları**nı aç (macOS: Finder → Ayarlar → Gelişmiş).
İndirilenler klasöründe şaşırdığın bir dosya var mı?

## ✅ Akılda kalsın

- Donanım → işletim sistemi → uygulama → kullanıcı.
- Uzantıları her zaman görünür yap.
- Çift uzantılı dosya (`.pdf.exe`) = kırmızı alarm.
