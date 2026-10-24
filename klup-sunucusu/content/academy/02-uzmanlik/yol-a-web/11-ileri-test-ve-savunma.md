---
id: a-11
tur: ders
baslik: "Savunma tarafı: WAF, loglarda saldırı izi, güvenli kod"
sure: 8
hedefler:
  - WAF'ın neyi yapıp neyi yapamadığını açıklamak
  - Web sunucusu loglarında saldırı izlerini bulmak
animasyonlar: [soc-alert]
gorseller:
  - id: a-11-a
    tur: ai
    karakter: jasmine
    alt: "Güvenlik izleme odasında Tek Tırnak Jasmine'in yeşil damlaları log ekranlarından süzülüyor; kehribar bir el feneri izi yakalıyor"
    prompt: "A dark security monitoring room with a wall of screens showing abstract scrolling log lines. A trail of glowing green droplets from the villain's pen trickles across the screens like footprints. The villain, half hidden in the doorway, freezes as a bright amber flashlight beam from a defender's hand lands exactly on her trail."
---

# Savunma tarafı: WAF, loglarda saldırı izi, güvenli kod

> Saldırgan ne kadar dikkatli olursa olsun **iz bırakır**. Soru, birinin o izlere bakıp bakmadığıdır.
> 🗂️ **Çekmece 11:** Portalın gece logları masanda. Jasmine'in ayak izleri orada.

![Güvenlik izleme odasında Tek Tırnak Jasmine'in yeşil damlaları log ekranlarından süzülüyor; kehribar bir el feneri izi yakalıyor](../../gorseller/a-11-a.webp)

## WAF: kapıdaki bekçi

**Web Application Firewall**, bilinen saldırı kalıplarını isteğe ulaşmadan engeller.

- ✅ Toplu, otomatik saldırıları ve bilinen kalıpları keser; açık kapanana kadar zaman kazandırır.
- ❌ Kodlama hilesiyle atlatılabilir, iş mantığı hatasını ve IDOR'u **göremez**.
- WAF bir yama değildir; **kodu düzeltmenin yerini tutmaz.**

## Loglarda ne aranır?

| İz | Neye işaret eder? |
|---|---|
| `'`, `%27`, `UNION`, `ORDER BY` | SQL enjeksiyonu denemesi |
| `../`, `%2e%2e` | Path traversal |
| `<script`, `%3Cscript` | XSS denemesi |
| Aynı IP'den çok sayıda `401` / `429` | Kaba kuvvet |
| Ardışık kimlikler (`/1042`, `/1043`…) | IDOR taraması |
| Normalden çok büyük yanıt boyutu | Veri sızmış olabilir |

::animasyon[soc-alert]

```bash
grep -E "%27|'|union|order%20by" -i /opt/akademi/access.log
awk '{print $1}' /opt/akademi/access.log | sort | uniq -c | sort -rn
```

## Güvenli kod kontrol listesi

Girdi doğrulama · bağlama göre çıktı kaçışlama · parametreli sorgu · her istekte yetki ·
koddan uzak gizli anahtarlar · ayrıntısız hata mesajları · güvenlik olaylarının loglanması.

## 🧪 Dene (8 dk)

Laboratuvar VM'inde `/opt/akademi/access.log` dosyasını incele:

1. Saldırgan IP hangisi? İlk isteği ne zaman ve neydi?
2. Enjeksiyon denemelerinden **hangisi başarılı oldu**? (İpucu: yanıt boyutuna bak.)
3. Hangi denemeler engellendi ve hangi savunma tarafından?

## ✅ Akılda kalsın

- WAF zaman kazandırır; açığı kodda kapatırsın.
- Saldırı izleri: özel karakterler, ardışık kimlikler, 401/429 yığınları, şişkin yanıtlar.
- Loglamadığın saldırıyı hiç göremezsin.
