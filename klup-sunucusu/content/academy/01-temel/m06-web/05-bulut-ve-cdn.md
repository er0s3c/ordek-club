---
id: m06-05
tur: ders
baslik: Bulut ve CDN — sunucu artık nerede?
sure: 5
hedefler:
  - Bulut servis modellerini tanımak
  - CDN'in performans ve güvenlikteki rolünü açıklamak
gorseller:
  - id: m06-05-a
    tur: ai
    karakter: celal
    alt: "Dünya üzerindeki CDN depolarından birinde Çerezci Celal çaldığı çerezleri bir teslimat dronuna yüklüyor"
    prompt: "A stylized dark globe with many small glowing warehouse buildings on different continents sending light trails to nearby cities. On the roof of one warehouse, the villain loads a tray of swiped glowing cookies onto a small delivery drone, looking around furtively."
---

# Bulut ve CDN — sunucu artık nerede?

> Bugün çoğu uygulamanın sunucusu bir bodrum katında değil, **başkasının veri merkezinde** çalışıyor.

![Dünya üzerindeki CDN depolarından birinde Çerezci Celal çaldığı çerezleri bir teslimat dronuna yüklüyor](../../gorseller/m06-05-a.webp)

## Bulut: kirala, kullan

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
