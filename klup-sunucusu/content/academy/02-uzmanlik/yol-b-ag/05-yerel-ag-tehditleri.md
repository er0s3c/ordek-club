---
id: b-05
tur: ders
baslik: "Yerel ağ tehditleri: ARP, DNS ve DHCP sahteciliği"
sure: 8
hedefler:
  - ARP, DNS ve DHCP sahteciliğinin mantığını açıklamak
  - Her biri için switch ve istemci tarafı savunmaları sıralamak
animasyonlar: [mitm]
gorseller:
  - id: b-05-a
    tur: ai
    karakter: tarik
    alt: "Tünelci Tarık ağ santralinde iki kablonun arasına kendi kablosunu ekliyor; iki taraftaki cihazlar birbirleriyle konuştuğunu sanıyor"
    prompt: "A dim wiring closet with a patch panel. Two glowing cables lead to two devices, a laptop and a router, drawn as little characters chatting happily. The villain has unplugged the cable between them and spliced in his own loop of glowing fiber-optic cable that runs through his hands, so every message passes him first, his headlamp glowing."
---

# Yerel ağ tehditleri: ARP, DNS ve DHCP sahteciliği

> Yerel ağ **güvene dayalıdır**: biri "ağ geçidi benim" derse cihazlar çoğu zaman inanır.
> 🕳️ **Tünel 5:** Laboratuvardaki iki bilgisayarın ARP tablosunda aynı MAC adresi iki farklı IP için görünüyor.

![Tünelci Tarık ağ santralinde iki kablonun arasına kendi kablosunu ekliyor; iki taraftaki cihazlar birbirleriyle konuştuğunu sanıyor](../../gorseller/b-05-a.webp)

## Üç yalan

| Saldırı | Yalan | Sonuç |
|---|---|---|
| **ARP sahteciliği** | "Ağ geçidinin MAC adresi benim" | Trafik saldırgandan geçer |
| **DNS sahteciliği** | "portal.kampus.test şu IP'de" | Kurban sahte siteye gider |
| **Sahte DHCP** | "Ağ geçidin ve DNS'in benim" | Yeni bağlanan herkes saldırgana yönelir |

::animasyon[mitm]

## Belirtiler

- ARP tablosunda **aynı MAC, iki IP** (biri ağ geçidi).
- Yerel ağda birden fazla DHCP sunucusu cevabı.
- Sertifika uyarıları birden çoğalıyor.

```bash
ip neigh          # Linux ARP tablosu   (Windows: arp -a)
```

## Savunma

| Katman | Önlem |
|---|---|
| **Switch** | DHCP Snooping (yalnızca güvenilir porttan DHCP), Dynamic ARP Inspection, port güvenliği |
| **Ağ tasarımı** | Küçük VLAN'lar, misafir ağında istemci izolasyonu |
| **İstemci / uygulama** | HTTPS ve HSTS, sertifika uyarısını asla geçmemek, DNS over HTTPS/TLS |
| **İzleme** | ARP değişikliği ve sahte DHCP alarmları (IDS) |

Şifreleme hâlâ en güçlü kalkan: trafik saldırgandan geçse bile **okunamaz ve değiştirilemez**.

## 🧪 Dene (5 dk)

Kendi bilgisayarında ARP tablosuna bak. Ağ geçidinin MAC adresini not et.
Laboratuvarda eğitmen sahtecilik gösterimini yaparken tabloya tekrar bak: ne değişti?

## ✅ Akılda kalsın

- Yerel ağ protokolleri kimlik doğrulamaz; yalanlar bu yüzden işe yarar.
- DHCP Snooping ve Dynamic ARP Inspection yalanları switch'te durdurur.
- Şifreli trafik, araya giren birine de anlamsız görünür.
