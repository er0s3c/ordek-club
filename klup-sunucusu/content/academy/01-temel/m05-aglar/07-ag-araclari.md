---
id: m05-07
tur: ders
baslik: Ağ teşhis çantan — ping, traceroute, ip, ss
sure: 6
hedefler:
  - Temel ağ teşhis komutlarını kullanmak
  - Bir bağlantı sorununu katman katman daraltmak
gorseller:
  - id: m05-07-a
    tur: ai
    karakter: nuri
    alt: "Teşhis aletleriyle dolu açık çantanın yanında tezgâhın altına gizlenmiş yanıp sönen dinleme cihazı"
    prompt: "An open vintage leather tool bag on a workbench holding a stethoscope, a magnifying glass, a folded map, a compass and a small radar dish. Under the bench, the villain is caught mid-motion sticking a small blinking listening bug to the underside of the table."
---

# Ağ teşhis çantan — ping, traceroute, ip, ss

> "İnternet yok!" Bunu duyan bir güvenlikçi tahmin etmez, **ölçer**.
> Dört komutla sorunun hangi katmanda olduğunu bulursun.

![Teşhis aletleriyle dolu açık çantanın yanında tezgâhın altına gizlenmiş yanıp sönen dinleme cihazı](../../gorseller/m05-07-a.webp)

## Sorunu aşağıdan yukarı daralt

```bash
# 1. Benim adresim var mı?           (ağ erişimi + DHCP)
ip a                     # Windows: ipconfig

# 2. Router'a ulaşıyor muyum?          (yerel ağ)
ping -c 3 192.168.1.1    # Windows: ping 192.168.1.1

# 3. İnternete çıkıyor muyum?          (IP yönlendirme)
ping -c 3 1.1.1.1

# 4. Ad çözümleme çalışıyor mu?        (DNS)
nslookup example.com

# 5. Yol nerede kopuyor?
traceroute example.com   # Windows: tracert example.com
```

| Sonuç | Muhtemel sorun |
|---|---|
| 1 başarısız | Kablo/Wi-Fi veya DHCP |
| 2 başarısız | Yerel ağ, router |
| 3 başarısız | İnternet sağlayıcı |
| 3 başarılı, 4 başarısız | **DNS** — en sık rastlanan! |

## Bağlantıları görmek

```bash
ss -tunp        # Linux: hangi program kime bağlı
netstat -ano    # Windows: bağlantılar ve işlem numaraları
```

Güvenlikçi için bu çıktı bir **hikâye**dir: tanımadığın bir program, tanımadığın bir adrese
sürekli bağlanıyorsa incelemeye değer.

> Not: `ping` cevap vermeyen bir sunucu her zaman kapalı değildir;
> birçok güvenlik duvarı ICMP'yi kasıtlı olarak engeller.

## 🧪 Dene (4 dk)

Yukarıdaki 5 adımı kendi bilgisayarında çalıştır. `traceroute example.com` kaç atlamada (hop) hedefe ulaştı?

## ✅ Akılda kalsın

- Sorunu aşağıdan yukarı daralt: adres → router → internet → DNS.
- "İnternet var ama siteler açılmıyor" çoğunlukla DNS'tir.
- `ss`/`netstat` çıktısı bilgisayarının kiminle konuştuğunu anlatır.
