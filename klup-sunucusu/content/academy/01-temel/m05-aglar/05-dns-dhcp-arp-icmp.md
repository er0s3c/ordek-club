---
id: m05-05
tur: ders
baslik: Ağın görünmez yardımcıları — DNS, DHCP, ARP, ICMP
sure: 7
hedefler:
  - DNS, DHCP, ARP ve ICMP'nin görevini açıklamak
  - Her birine yönelik bir saldırı fikrini tanımak
animasyonlar: [dns-resolution]
gorseller:
  - id: m05-05-a
    tur: ai
    karakter: nuri
    alt: "Dinleyici Nuri, rehber kitaplı yardımcı robotun kulağına yanlış adres fısıldıyor"
    prompt: "Four tiny helper robots stand in a row in a server hallway, each with a prop: a big address book, glowing key tags, a cupped hand calling out, an ear trumpet. The villain leans in and whispers into the ear of the address-book robot, pointing it the wrong way."
---

# Ağın görünmez yardımcıları — DNS, DHCP, ARP, ICMP

> Wi-Fi'ye bağlandığın an, arka planda dört yardımcı çalışmaya başlar.
> Sen sadece "bağlandı" yazısını görürsün.

![Dinleyici Nuri, rehber kitaplı yardımcı robotun kulağına yanlış adres fısıldıyor](../../gorseller/m05-05-a.webp)

## Dört yardımcı

| Protokol | Görevi | Benzetme | Kötüye kullanım |
|---|---|---|---|
| **DHCP** | Bağlanan cihaza IP adresi verir | Otel resepsiyonu oda verir | Sahte DHCP sunucusu, trafiği kendine yönlendirir |
| **DNS** | Alan adını IP'ye çevirir | Telefon rehberi | Sahte DNS yanıtı, seni sahte siteye yollar |
| **ARP** | Yerel ağda IP'nin MAC'ini bulur | "192.168.1.1 kim?" diye bağırmak | ARP sahteciliği, ortadaki adam (M10) |
| **ICMP** | Hata ve teşhis mesajları | "Orada mısın?" yankısı | Tarama, ağ haritası çıkarma |

## DNS adım adım

Tarayıcına `ornek.edu.tr` yazdığında IP adresi nasıl bulunur?

::animasyon[dns-resolution]

```bash
nslookup example.com       # alan adının IP'si
ping -c 4 example.com      # ICMP ile "orada mısın?" (Windows: ping example.com)
arp -a                     # bilgisayarının ARP tablosu
```

## Güvenlikçi için anahtar fikir

Bu protokollerin çoğu **kimlik doğrulaması olmadan** tasarlandı — "soran herkese cevap ver, gelen cevaba inan".
Ortak bir ağda sahte bir cevap vermek bu yüzden mümkündür.
Savunmalar: DNSSEC, şifreli DNS (DoH/DoT), switch'lerde DHCP snooping ve Dynamic ARP Inspection.

## 🧪 Dene (3 dk)

`nslookup example.com` ve `arp -a` çalıştır. ARP tablonda router'ının (varsayılan ağ geçidi) MAC adresi var mı?

## ✅ Akılda kalsın

- DHCP adres verir, DNS ad çözer, ARP yerel MAC bulur, ICMP teşhis eder.
- Bu protokoller çoğunlukla gelen cevaba körü körüne güvenir.
- Ortak ağlarda sahte cevaplar mümkündür; şifreli bağlantı korur.
