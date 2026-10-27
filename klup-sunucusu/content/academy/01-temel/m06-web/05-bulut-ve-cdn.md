---
id: m06-05
tur: ders
baslik: Bulut ve CDN — sunucu artık nerede?
sure: 5
hedefler:
  - Bulut servis modellerini tanımak
  - CDN'in performans ve güvenlikteki rolünü açıklamak
gorseller:
  - id: m06-05-b
    tur: ai
    alt: "Pizza benzetmesi: kendi mutfağında yapılan, hazır hamur ile yapılan ve restoranda yenen pizza; her adımda müşterinin yaptığı iş azalıyor"
    prompt: "Three panels in a row: a student cooking pizza in a rented empty kitchen with only the oven provided, then a student just adding toppings to a ready-made base in a shared kitchen, then a student simply eating a served pizza at a restaurant table. Each step the student does less work."
  - id: m06-05-c
    tur: ai
    alt: "Merkez fırından dünyanın dört bir yanındaki küçük şubelere giden teslimat yolları; kullanıcılar en yakın şubeden alıyor"
    prompt: "A glowing world map seen from above: one large central bakery in the middle and many small branch shops spread across the continents, each stocked with the same pastries, people in every city picking up their order from the nearest branch while the central bakery stays calm behind a protective wall."
---

# Bulut ve CDN — sunucu artık nerede?

> Bugün çoğu uygulamanın sunucusu bir bodrum katında değil, **başkasının veri merkezinde** çalışıyor.

::cizgi[m06-05-sahne]

## Bulut: kirala, kullan

![Pizza benzetmesi: kendi mutfağında yapılan, hazır hamur ile yapılan ve restoranda yenen pizza; her adımda müşterinin yaptığı iş azalıyor](../../gorseller/m06-05-b.webp)

| Model | Sen ne yönetirsin? | Örnek |
|---|---|---|
| **IaaS** | İşletim sistemi ve üstü | Bulutta sanal sunucu |
| **PaaS** | Sadece uygulaman | Uygulama barındırma platformları |
| **SaaS** | Hiçbir şey, sadece kullanırsın | E-posta, ofis uygulamaları |

## Paylaşılan sorumluluk

Bulut sağlayıcı **bulutun güvenliğinden** (binalar, donanım) sorumludur;
sen **buluttaki şeyin güvenliğinden** (ayarların, verin, erişim izinlerin) sorumlusun.

Gerçek veri sızıntılarının önemli bir kısmı bulutun "kırılması"ndan değil,
**herkese açık bırakılmış bir depolama alanı** gibi yanlış ayarlardan çıkar.

## CDN: içeriği sana yaklaştırmak

![Merkez fırından dünyanın dört bir yanındaki küçük şubelere giden teslimat yolları; kullanıcılar en yakın şubeden alıyor](../../gorseller/m06-05-c.webp)

**CDN** (İçerik Dağıtım Ağı), sitenin görsellerini ve dosyalarını dünyanın dört bir yanındaki
sunuculara kopyalar. Sen en yakındakinden alırsın → sayfa hızlı açılır.

Güvenlik katkısı:
- Asıl sunucuyu gizler ve ona gelen yükü azaltır.
- Büyük trafik saldırılarını (DDoS) emebilir.
- Çoğu zaman bir web uygulaması güvenlik duvarı (WAF) da sunar.

## 🧪 Dene (3 dk)

`nslookup` ile büyük bir haber sitesinin adresine bak. Dönen IP'ler o şirketin mi,
yoksa bir CDN'in mi olabilir? (İpucu: IP'nin sahibini bir WHOIS sorgusuyla bulabilirsin — M09.)

## ✅ Akılda kalsın

- IaaS → PaaS → SaaS: yukarı çıktıkça daha az şey yönetirsin.
- Bulutta yanlış ayar, en sık sızıntı sebebidir.
- CDN içeriği yakına taşır, asıl sunucuyu korur.
