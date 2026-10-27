---
id: c-11
tur: ders
baslik: "Olay müdahalesi: NIST döngüsü, playbook ve delil zinciri"
sure: 9
hedefler:
  - NIST olay müdahalesi aşamalarını sırayla uygulamak
  - Delil zinciri kaydını doğru tutmak
gorseller:
  - id: c-11-b
    tur: ai
    alt: "Dört istasyonlu bir döngü: hazırlık çantası, büyüteç, söndürme cihazı ve ders defteri; oklar başa dönüyor"
    prompt: "A circular track on a table with four stations connected by glowing arrows: a packed emergency kit, a magnifying glass over a scorch mark, a fire extinguisher and a sealed door, and a notebook with lessons; the last arrow loops back to the emergency kit."
  - id: c-11-c
    tur: ai
    alt: "Mühürlü delil poşetinin elden ele geçişi; her el bir imza kartına tarih düşüyor"
    prompt: "A sealed evidence bag passed hand to hand along a line of people, each pausing to sign a small attached card with a pen before handing it on, the seal unbroken and glowing amber."
---

# Olay müdahalesi: NIST döngüsü, playbook ve delil zinciri

> Panik, saldırganın en iyi dostudur. **Plan** ise savunucunun.
> 🧹 **İz 11:** Tamer'in son hamlesi kanıtı "kaybettirmek". Delil zinciri tutulmuşsa kaybolan kanıt da belgelenmiştir.

::cizgi[c-11-sahne]

## NIST döngüsü

![Dört istasyonlu bir döngü: hazırlık çantası, büyüteç, söndürme cihazı ve ders defteri; oklar başa dönüyor](../../gorseller/c-11-b.webp)

NIST SP 800-61, olay müdahalesini (incident response) dört aşamada anlatır:

| Aşama | KLP-WS07 için örnek |
|---|---|
| **1. Hazırlık** (preparation) | Merkezî log, Sysmon, playbook, iletişim listesi hazır |
| **2. Tespit ve analiz** | Alarmlar doğrulandı, kapsam belirlendi |
| **3. Sınırlama, temizleme, kurtarma** | Cihaz yalıtıldı; hesap, servis, Run anahtarı kaldırıldı; temiz imajdan geri kuruldu |
| **4. Olay sonrası** (lessons learned) | "RDP neden dışarıya açıktı?" — kalıcı düzeltme |

Döngüdür: dördüncü aşama birinciyi besler.

## Playbook

**Playbook**, belirli bir olay türü için adım adım reçetedir. Örnek: *"Dışarıdan başarılı RDP girişi"*

1. Kaynak IP ve hesabı doğrula (4624 tür 10).
2. Cihazı EDR ile ağdan yalıt, **kapatma**.
3. Bellek ve disk imajı al, hash'le.
4. Hesabın parolasını sıfırla, oturumlarını kapat.
5. Aynı IP'yi diğer cihazlarda ara.
6. Vaka kaydını güncelle, sorumluya bildir.

## Delil zinciri

![Mühürlü delil poşetinin elden ele geçişi; her el bir imza kartına tarih düşüyor](../../gorseller/c-11-c.webp)

**Delil zinciri (chain of custody)**, kanıtın kimde, ne zaman, neden bulunduğunu kesintisiz gösterir. Zincir koparsa kanıt tartışmalı olur.

| Kanıt | Hash (SHA256) | Teslim eden → alan | Zaman | Amaç |
|---|---|---|---|---|
| `ws07-bellek.raw` | `…` | Tilki → Selim Hoca | 2026-03-14 09:40 | Analiz |

Kural: her el değiştirmede satır eklenir, hash yeniden doğrulanır, kanıt kilitli yerde saklanır.

## 🧪 Dene (5 dk)

Kendi laboratuvar VM'inde bir dosyanın (örneğin `/opt/akademi/c-sysmon.csv`) hash'ini al ve iki satırlık bir delil zinciri tablosu doldur:
Tilki → Selim Hoca, ardından Selim Hoca → kanıt dolabı. Sonra yukarıdaki playbook'u NIST aşamalarına eşleştir.

## ✅ Akılda kalsın

- NIST döngüsü: hazırlık → tespit/analiz → sınırlama/temizleme/kurtarma → olay sonrası.
- Playbook paniği adımlara çevirir; ilk adım yalıtmaktır, kapatmak değil.
- Delil zincirinde her el değiştirme yazılır ve hash ile doğrulanır.
