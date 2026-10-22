---
id: m06-01
tur: ders
baslik: Bir web sayfası nasıl açılır?
sure: 7
hedefler:
  - Web sitesi ile web uygulamasını ayırt etmek
  - İstemci-sunucu modelini ve URL yapısını açıklamak
animasyonlar: [http-request]
gorseller:
  - id: m06-01-a
    tur: ai
    karakter: celal
    alt: "Restoran mutfağında Çerezci Celal müşterinin sipariş fişini gizlice değiştiriyor"
    prompt: "A cozy restaurant cutaway: on the left a customer at a table hands an order slip to a waiter, in the middle a swinging kitchen door, on the right a kitchen with a pantry of jars. Inside the kitchen, the villain intercepts the order slip and swaps it for his own, grinning under his chef hat."
---

# Bir web sayfası nasıl açılır?

> Bir web uygulaması restoran gibidir: sen (tarayıcı) sipariş verirsin,
> mutfak (sunucu) hazırlar, depo (veritabanı) malzemeyi verir.

![Restoran mutfağında Çerezci Celal müşterinin sipariş fişini gizlice değiştiriyor](../../gorseller/m06-01-a.webp)

> 🕴️ **DOSYA: Çerezci Celal** · *Oturum Hırsızı*
>
> ![Çerezci Celal — Oturum Hırsızı](../../gorseller/karakter-celal.webp)
>
> 📼 **Bölüm 6 — Taze Çerezler.** Celal'in fırınından çıkan şey kurabiye değil, oturum. Bir çerez ve başkasının hesabıyla içeridesin. Celal'in arkasında ise kimsenin görmediği biri var: veritabanlarına fısıldayan bir kadın.
>
> **Tehdit:** Oturum çerezi çalma, yetki kontrolü eksik API'ler (IDOR), sahte alan adları. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

## Site mi, uygulama mı?

- **Web sitesi** — Herkese aynı içeriği gösterir (kulübün tanıtım sayfası).
- **Web uygulaması** — Sana özel çalışır: giriş yaparsın, veri gönderirsin (öğrenci portalı, Ördek Club).

Güvenlik açısından ikincisi çok daha ilginçtir: girdi, oturum ve veri vardır.

## Bir isteğin yolculuğu

::animasyon[http-request]

## URL'yi okumayı öğren

```text
https://portal.kuzeykiyi.edu.example:443/notlar?donem=2026-guz#ozet
└─┬─┘   └────────────┬──────────────┘└┬┘└──┬──┘└─────┬─────┘└─┬─┘
şema           alan adı             port  yol     sorgu      parça
```

| Parça | Güvenlikçi neden bakar? |
|---|---|
| **Şema** | `http` şifresiz, `https` şifreli |
| **Alan adı** | Gerçek kurum mu? Sağdan sola oku: `edu.example` → `kuzeykiyi` → `portal` |
| **Yol ve sorgu** | Sunucuya gönderilen girdi; saldırıların çoğu buradan başlar |

🚩 `kuzeykiyi.edu.example.giris-dogrula.xyz` → gerçek alan adı **`giris-dogrula.xyz`**!
Alan adı her zaman **en sağdaki** kısımdır.

## 🧪 Dene (3 dk)

Şu adreslerin gerçek alan adını yaz:
1. `https://login.kuzeykiyi.edu.example/giris`
2. `https://kuzeykiyi.edu.example-guvenli.com/giris`

<details><summary>Cevap</summary>1 → kuzeykiyi.edu.example · 2 → example-guvenli.com (sahte!)</details>

## ✅ Akılda kalsın

- Tarayıcı ister, sunucu hazırlar, veritabanı saklar.
- URL: şema, alan adı, port, yol, sorgu.
- Alan adını sağdan sola oku; gerçek alan adı en sağdadır.
