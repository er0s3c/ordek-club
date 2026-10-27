---
id: m05-01
tur: ders
baslik: İnternet aslında nedir?
sure: 6
hedefler:
  - Yerel ağ (LAN) ile geniş alan ağını (WAN) ayırt etmek
  - Modem, router, switch ve access point'in görevini açıklamak
gorseller:
  - id: m05-01-b
    tur: ai
    alt: "Ağ cihazları şehir gibi: şehir kapısındaki modem, kavşakta trafik polisi router, apartman posta kutuları switch ve çatıdaki telsiz verici access point"
    prompt: "A small noir city block at night explaining a home network: a big city gate at the edge where a cable from the outside world enters, a traffic officer standing at a central crossroads directing glowing envelope-shaped packets to the right streets, an apartment lobby with a wall of mailboxes where a postman sorts envelopes into the right boxes, and a rooftop radio mast broadcasting soft green waves to phones and laptops in the windows."
---

# İnternet aslında nedir?

> İnternet tek bir şey değil; **birbirine bağlanmış milyonlarca ağın** ortak adı.
> Senin yurt odan da bunlardan biri.

::cizgi[m05-01-sahne]

> 🕴️ **DOSYA: Dinleyici Nuri** · *Dinleyici*
>
> ![Dinleyici Nuri — Dinleyici](../../gorseller/karakter-nuri.webp)
>
> **Tehdit:** Ortak Wi-Fi'de trafik dinleme, ARP/DNS sahteciliği, ortadaki adam. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[nuri-acilis]

## Küçük ağ, büyük ağ

- **LAN** (yerel ağ) — Evin, yurdun, laboratuvarın. Cihazlar birbirini doğrudan görür.
- **WAN** (geniş alan ağı) — Şehirler ve ülkeler arası bağlantılar. İnternet en büyük WAN'dır.

## Cihazlar ve görevleri

![Ağ cihazları şehir gibi: şehir kapısındaki modem, kavşakta trafik polisi router, apartman posta kutuları switch ve çatıdaki telsiz verici access point](../../gorseller/m05-01-b.webp)

| Cihaz | Benzetme | Görevi |
|---|---|---|
| **Modem** | Şehre açılan kapı | İnternet sağlayıcının hattını cihazların anlayacağı sinyale çevirir |
| **Router** (yönlendirici) | Kavşaktaki polis | Paketleri doğru ağa yönlendirir; ev ile internet arasında durur |
| **Switch** | Apartman posta kutuları | Aynı ağdaki cihazlar arasında doğru kişiye teslim eder |
| **Access point** | Telsiz verici | Kablosuz cihazları ağa bağlar |

Evdeki "modem" denen kutu çoğu zaman bunların **hepsini birden** yapar.

## Ethernet mi, Wi-Fi mı?

| | Ethernet (kablo) | Wi-Fi (kablosuz) |
|---|---|---|
| Hız ve kararlılık | Daha yüksek | Mesafe ve duvarlarla düşer |
| Güvenlik | Kabloya fiziksel erişim gerekir | Sinyal duvarın ötesine taşar |

Bu yüzden ortak Wi-Fi'de (kafe, yurt) dikkatli olmak gerekir — M08 ve Yol B'de ayrıntısı var.

## 🧪 Dene (3 dk)

Evindeki veya yurdundaki ağ cihazına bak: üzerinde hangi ışıklar var, kaç Ethernet girişi var?
Hangi görevleri (modem, router, switch, AP) yapıyor olabilir?

## ✅ Akılda kalsın

- İnternet = birbirine bağlı ağların ağı.
- Router ağlar arası yönlendirir, switch ağ içinde teslim eder.
- Wi-Fi sinyali duvarın ötesine taşar; ortak ağlarda dikkat.
