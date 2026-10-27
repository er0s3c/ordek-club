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
  - id: b-05-b
    tur: ai
    alt: "Mahallede üç yalancı: sahte kapıcı, sahte rehber ve sahte resepsiyonist; her biri gelenleri kendi kapısına yönlendiriyor"
    prompt: "A neighborhood street at night with three impostors: a fake doorman shouting that he lives at every address, a fake directory clerk handing out wrong maps from a booth, and a fake receptionist giving newcomers keys to a trap room; confused travelers follow them while the real helpers stand ignored."
---

# Yerel ağ tehditleri: ARP, DNS ve DHCP sahteciliği

> Yerel ağ **güvene dayalıdır**: biri "ağ geçidi benim" derse cihazlar çoğu zaman inanır.
> 🕳️ **Tünel 5:** Laboratuvardaki iki bilgisayarın ARP tablosunda aynı MAC adresi iki farklı IP için görünüyor.

::cizgi[b-05-sahne]

## Üç yalan

![Mahallede üç yalancı: sahte kapıcı, sahte rehber ve sahte resepsiyonist; her biri gelenleri kendi kapısına yönlendiriyor](../../gorseller/b-05-b.webp)

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
