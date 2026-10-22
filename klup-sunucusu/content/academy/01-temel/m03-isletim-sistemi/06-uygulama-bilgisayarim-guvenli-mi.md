---
id: m03-06
tur: uygulama
baslik: "Uygulama: Bilgisayarım ne kadar güvenli?"
sure: 25
hedefler:
  - Bir Windows sisteminin güvenlik yapılandırmasını incelemek
  - Riskleri önceliklendirip düzeltme önerisi yazmak
gorseller:
  - id: m03-06-a
    tur: ai
    karakter: riza
    alt: "Muayene masasındaki laptopa Anahtarcı Rıza'nın eldivenli eli masanın altından uzanıyor"
    prompt: "A laptop lies on a small clinic examination table under a white sheet. From under the table, the villain's gloved hand creeps up toward the laptop holding a key, while a clipboard with abstract checkmarks lies nearby."
---

# Uygulama: Bilgisayarım ne kadar güvenli?

> Laboratuvardaki **"Yurt-PC"** adlı Windows sanal makinesi kasıtlı olarak bazı hatalarla kuruldu.
> Muayene et, teşhis koy, tedavi öner.

![Muayene masasındaki laptopa Anahtarcı Rıza'nın eldivenli eli masanın altından uzanıyor](../../gorseller/m03-06-a.webp)

## Kontrol listesi

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
