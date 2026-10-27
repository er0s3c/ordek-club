---
id: b-10
tur: ders
baslik: "Windows sistem güvenliği: servisler, registry, UAC"
sure: 7
hedefler:
  - Windows'ta yetki yükseltmeye yol açan yaygın hataları tanımak
  - Temel sertleştirme adımlarını uygulamak
gorseller:
  - id: b-10-b
    tur: ai
    alt: "Konaktaki üç saklanma yeri: kendiliğinden çalışan müzik kutusu, kayıt defterleri dolabı ve her sabah çalan çalar saat"
    prompt: "A mansion study where an inspector with a flashlight checks three hiding spots: an old music box that starts by itself, a tall cabinet of ledger books with one drawer slightly open, and an alarm clock on the mantel set to ring every morning with a tiny extra gear glowing inside."
---

# Windows sistem güvenliği: servisler, registry, UAC

> Windows'ta pek çok şey **otomatik** çalışır: servisler, zamanlanmış görevler, başlangıç kayıtları. Saldırgan oraya saklanır.
> 🕳️ **Tünel 10:** Laboratuvardaki bir Windows makinede, her açılışta SYSTEM yetkisiyle çalışan bir servisin klasörü herkese yazılabilir.

::cizgi[b-10-sahne]

## Tipik hatalar

| Hata | Neden tehlikeli? |
|---|---|
| **Yazılabilir servis dosyası/klasörü** | Servis SYSTEM olarak çalışır; dosyayı değiştiren SYSTEM olur |
| **Tırnaksız servis yolu** | `C:\Program Files\Okul Yazilim\app.exe` boşluklarda farklı dosyayı çalıştırabilir |
| **Kalıcılık noktaları** | `Run` registry anahtarları, zamanlanmış görevler, başlangıç klasörü |
| **Herkes yönetici** | Günlük kullanıcı yerel yönetici → her zararlı da yönetici |
| **UAC kapalı** | Yönetici işlemleri sessizce onaylanır |

## Nereye bakılır?

![Konaktaki üç saklanma yeri: kendiliğinden çalışan müzik kutusu, kayıt defterleri dolabı ve her sabah çalan çalar saat](../../gorseller/b-10-b.webp)

```powershell
Get-Service | Where-Object Status -eq Running
Get-ScheduledTask | Where-Object State -eq Ready
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
icacls "C:\Program Files\Okul Yazilim"
```

Sysinternals **Autoruns**, otomatik çalışan her şeyi tek listede gösterir.

## Sertleştirme

- Kullanıcılar **standart hesap**; yönetici hesabı ayrı ve yalnızca gerektiğinde.
- UAC açık, en az "varsayılan" seviyede.
- Microsoft Defender + saldırı yüzeyi azaltma (ASR) kuralları, BitLocker.
- Güncellemeler otomatik; kullanılmayan servisler ve eski protokoller (SMBv1) kapalı.
- PowerShell ve olay logları (özellikle 4688 süreç oluşturma) toplanıyor.

## 🧪 Dene (5 dk)

Kendi Windows bilgisayarında (ya da laboratuvar VM'inde) **Autoruns**'u çalıştır.
Tanımadığın kaç başlangıç kaydı var? Birini araştır: yayıncısı kim, imzalı mı, gerekli mi?
⚠️ Emin olmadığın hiçbir kaydı silme; sadece incele.

## ✅ Akılda kalsın

- Otomatik çalışan her şey saklanmak için bir yerdir.
- SYSTEM olarak çalışan dosyaya yazabilen, SYSTEM olur.
- Günlük işte standart hesap; yönetici yetkisi yalnızca gerektiğinde.
