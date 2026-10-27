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
  - id: m05-05-b
    tur: ai
    alt: "Ağın dört görünmez yardımcısı: oda anahtarı veren resepsiyonist (DHCP), rehber tutan kütüphaneci (DNS), koridorda seslenen kapıcı (ARP) ve yankı dinleyen bekçi (ICMP)"
    prompt: "Four friendly helper figures in a noir hotel lobby, each in a separate pool of light: a receptionist handing a room key to a newly arrived laptop, a librarian looking up a name in a thick address directory, a doorman in the hallway cupping his hands and calling out to find who lives in which room, and a night watchman shouting into a dark corridor and listening for the echo."
---

# Ağın görünmez yardımcıları — DNS, DHCP, ARP, ICMP

> Wi-Fi'ye bağlandığın an, arka planda dört yardımcı çalışmaya başlar.
> Sen sadece "bağlandı" yazısını görürsün.

::cizgi[m05-05-sahne]

## Dört yardımcı

![Ağın dört görünmez yardımcısı: oda anahtarı veren resepsiyonist (DHCP), rehber tutan kütüphaneci (DNS), koridorda seslenen kapıcı (ARP) ve yankı dinleyen bekçi (ICMP)](../../gorseller/m05-05-b.webp)

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
