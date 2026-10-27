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
  - id: a-11-b
    tur: ai
    alt: "Kapıdaki bekçi şüpheli paketleri ayıklıyor ama içerideki kasanın kilidi de ayrıca sağlam"
    prompt: "A doorman at a building entrance sorts incoming parcels, catching a few suspicious ones that glow green, while behind him in the hallway the vault door still has its own strong lock, showing two layers of defense."
---

# Savunma tarafı: WAF, loglarda saldırı izi, güvenli kod

> Saldırgan ne kadar dikkatli olursa olsun **iz bırakır**. Soru, birinin o izlere bakıp bakmadığıdır.
> 🗂️ **Çekmece 11:** Portalın gece logları masanda. Jasmine'in ayak izleri orada.

::cizgi[a-11-sahne]

## WAF: kapıdaki bekçi

![Kapıdaki bekçi şüpheli paketleri ayıklıyor ama içerideki kasanın kilidi de ayrıca sağlam](../../gorseller/a-11-b.webp)

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
