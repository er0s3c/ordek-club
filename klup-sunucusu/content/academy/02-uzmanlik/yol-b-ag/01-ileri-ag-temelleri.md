---
id: b-01
tur: ders
baslik: "İleri ağ temelleri: VLAN, yönlendirme, segmentasyon"
sure: 8
hedefler:
  - VLAN ve yönlendirmenin ağı nasıl böldüğünü açıklamak
  - Düz bir ağın neden tehlikeli olduğunu göstermek
animasyonlar: [network-topology]
gorseller:
  - id: b-01-b
    tur: ai
    alt: "Tek bir boru içinde farklı renklerde akan ayrı sıvılar; her renk kendi binasına ayrılıyor"
    prompt: "A single wide glass pipe carrying several separate glowing streams of different colors side by side without mixing, and at its end a valve junction splitting each colored stream into its own building."
  - id: b-01-c
    tur: ai
    alt: "Gemi gövdesi su geçirmez bölmelere ayrılmış; bir bölme su alsa da diğerleri kuru kalıyor"
    prompt: "A cutaway of a ship's hull divided into watertight compartments with sturdy doors; one compartment is flooded with glowing green water while all the others stay dry, sailors calmly closing the hatches."
---

# İleri ağ temelleri: VLAN, yönlendirme, segmentasyon

> Düz bir ağ, kapısız bir evdir: ön kapıdan giren her odaya girer.
> 🕳️ **Tünel 1:** Laboratuvardaki kampüs ağı kopyasında öğrenci Wi-Fi'si, kameralar ve not sunucusu aynı ağda. Tarık'ın en sevdiği manzara.

::cizgi[b-01-sahne]

## VLAN: tek kabloda ayrı ağlar

![Tek bir boru içinde farklı renklerde akan ayrı sıvılar; her renk kendi binasına ayrılıyor](../../gorseller/b-01-b.webp)

Bir switch'i mantıksal olarak bölersin: VLAN 10 öğrenciler, VLAN 20 personel, VLAN 30 sunucular.
Aynı fiziksel cihazdalar ama birbirlerini **doğrudan** göremezler.

- **Access port:** tek VLAN'a ait (bir bilgisayar).
- **Trunk port:** birden çok VLAN'ı etiketli (802.1Q) taşır (switch–switch, switch–router).

## Yönlendirme: bölgeler arası kapı

VLAN'lar arası trafik bir **router ya da L3 switch** üzerinden geçer. İşte burada kural koyabilirsin:
"Öğrenciler not sunucusunun yalnızca web portuna erişebilir, veritabanına asla."

::animasyon[network-topology]

## Segmentasyon tasarımı

![Gemi gövdesi su geçirmez bölmelere ayrılmış; bir bölme su alsa da diğerleri kuru kalıyor](../../gorseller/b-01-c.webp)

| Bölge | İçinde | Kime açık? |
|---|---|---|
| **Misafir / öğrenci** | Telefonlar, laptoplar | Yalnızca internet ve portal |
| **Personel** | Ofis bilgisayarları | İç uygulamalar |
| **Sunucu** | Portal, veritabanı | Yalnızca gereken portlar |
| **Yönetim** | Switch/firewall arayüzleri | Yalnızca yöneticiler |
| **IoT** | Kamera, yazıcı, akıllı kilit | Hiçbir yere (yalnızca kendi sunucusu) |

## Tipik hatalar

Her şeyin tek VLAN'da olması, yönetim arayüzlerinin öğrenci ağından erişilebilmesi,
"geçici" açılıp unutulan **any-any** kuralı, kullanılmayan switch portlarının açık bırakılması.

## 🧪 Dene (5 dk)

Kendi bilgisayarında ağ bilgini incele:

```bash
ip route        # Linux / macOS: netstat -rn
ipconfig        # Windows
```

Varsayılan ağ geçidin hangisi? Ağ maskene göre aynı ağda kaç cihaz olabilir? Bu bir okul ağı olsaydı nasıl bölerdin?

## ✅ Akılda kalsın

- VLAN ağı mantıksal olarak böler; bölgeler arası trafik bir kapıdan geçer.
- Segmentasyonun amacı: bir cihaz düşerse yangın tek odada kalsın.
- Yönetim ve IoT cihazları kendi bölgelerinde, dışarıya kapalı durur.
