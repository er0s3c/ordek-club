---
id: c-11
tur: ders
baslik: "Olay müdahalesi: NIST döngüsü, playbook ve delil zinciri"
sure: 9
hedefler:
  - NIST olay müdahalesi aşamalarını sırayla uygulamak
  - Delil zinciri kaydını doğru tutmak
gorseller:
  - id: c-11-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer paspasını kaldırıp mühürlü kehribar delil kutusuna yaklaşıyor; kutu duvardaki imza panosuna uzun kehribar bir kurdeleyle bağlı"
    prompt: "A tidy incident response room at night with a large round wall board showing six glowing stages connected in a circle by abstract icons. The villain tiptoes toward a sealed amber evidence box on a table, mop raised to sweep it away, but the box is tied with a long amber ribbon to a clipboard on the wall that holds a neat column of signature scribbles, and the ribbon has already wrapped twice around his ankle."
---

# Olay müdahalesi: NIST döngüsü, playbook ve delil zinciri

> Panik, saldırganın en iyi dostudur. **Plan** ise savunucunun.
> 🧹 **İz 11:** Tamer'in son hamlesi kanıtı "kaybettirmek". Delil zinciri tutulmuşsa kaybolan kanıt da belgelenmiştir.

![Temizlikçi Tamer paspasını kaldırıp mühürlü kehribar delil kutusuna yaklaşıyor; kutu duvardaki imza panosuna uzun kehribar bir kurdeleyle bağlı](../../gorseller/c-11-a.webp)

## NIST döngüsü

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
