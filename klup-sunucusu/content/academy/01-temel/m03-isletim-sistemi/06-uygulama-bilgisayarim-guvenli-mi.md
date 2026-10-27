---
id: m03-06
tur: uygulama
baslik: "Uygulama: Bilgisayarım ne kadar güvenli?"
sure: 25
hedefler:
  - Bir Windows sisteminin güvenlik yapılandırmasını incelemek
  - Riskleri önceliklendirip düzeltme önerisi yazmak
gorseller:
  - id: m03-06-b
    tur: ai
    alt: "Öğrenci doktor önlüğüyle laptopu stetoskopla muayene ediyor; yanında işaretlenmiş bir kontrol listesi panosu"
    prompt: "A student in a doctor's coat examines a laptop lying on a clinic table with a stethoscope, a clipboard checklist with green tick marks hanging beside the table, a small shield badge and an update arrow icon glowing on the laptop lid."
---

# Uygulama: Bilgisayarım ne kadar güvenli?

> Laboratuvardaki **"Yurt-PC"** adlı Windows sanal makinesi kasıtlı olarak bazı hatalarla kuruldu.
> Muayene et, teşhis koy, tedavi öner.

::cizgi[m03-06-sahne]

## Kontrol listesi

![Öğrenci doktor önlüğüyle laptopu stetoskopla muayene ediyor; yanında işaretlenmiş bir kontrol listesi panosu](../../gorseller/m03-06-b.webp)

| # | Kontrol | Nereden bakılır? |
|---|---|---|
| 1 | Kullanıcı standart mı, yönetici mi? | Ayarlar → Hesaplar |
| 2 | Defender gerçek zamanlı koruma açık mı? | Windows Güvenliği |
| 3 | Güvenlik duvarı tüm profillerde açık mı? | Windows Güvenliği → Güvenlik duvarı |
| 4 | Bekleyen güncelleme var mı? | Windows Update |
| 5 | Dosya uzantıları görünür mü? | Dosya Gezgini → Görünüm |
| 6 | Başlangıçta şüpheli öğe var mı? | Görev Yöneticisi → Başlangıç |
| 7 | Disk şifreleme açık mı? | Ayarlar → Gizlilik ve güvenlik |
| 8 | Ekran kilidi ve parola var mı? | Ayarlar → Hesaplar → Oturum açma |

## Teslim: Kısa bulgu raporu

Her sorun için bir satır:

```text
Bulgu | Risk (Yüksek/Orta/Düşük) | Neden riskli? | Önerilen düzeltme
```

Örnek:
```text
Güvenlik duvarı "Ortak ağ" profilinde kapalı | Yüksek | Kafe/yurt ağlarında cihaz dışarıya açık kalır | Tüm profillerde açın
```

Raporu **en riskli bulgudan** başlayarak sırala.

<details><summary>Eğitmen notu: Yurt-PC'de kasıtlı hatalar</summary>Yönetici hesabıyla otomatik oturum açma · Ortak profilde güvenlik duvarı kapalı · 3 ay geride güncellemeler · Uzantılar gizli · Başlangıçta "Yayımcı" alanı boş `updater_svc.exe` (zararsız test dosyası) · Disk şifreleme kapalı. Ekran kilidi var (kontrol: öğrenci "her şey yanlış" demiyor mu?).</details>

## ✅ Akılda kalsın

- Güvenlik muayenesi bir kontrol listesiyle başlar.
- Her bulgu: risk, neden ve öneri ile yazılır.
- Rapor en riskli bulgudan başlar.
