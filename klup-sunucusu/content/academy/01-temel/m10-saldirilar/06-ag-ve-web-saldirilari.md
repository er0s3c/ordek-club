---
id: m10-06
tur: ders
baslik: Ağda ve web'de saldırılar — MITM, web açıkları, DDoS
sure: 8
hedefler:
  - MITM ve spoofing kavramlarını açıklamak
  - Web uygulaması açıklarının ortak kökünü görmek
  - DDoS'un etkisini ve savunmasını anlamak
animasyonlar: [mitm, xss]
gorseller:
  - id: m10-06-b
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine kart katalog dolabına parlayan bir kesme işareti sokuyor; bütün çekmeceler aynı anda fırlıyor"
    prompt: "A tall wooden card-catalogue cabinet stands for a database in a dim library. The villain slips a single glowing green apostrophe-shaped token into a small form slot on its front, and every drawer bursts open at once, spilling glowing index cards into the air while a little librarian robot panics."
  - id: m10-06-c
    tur: ai
    alt: "Küçük bir dükkânın kapısını binlerce karton figür tıkıyor; gerçek müşteriler içeri giremiyor"
    prompt: "A tiny shop entrance completely jammed by a huge crowd of identical cardboard figures pushing forward, while a few real customers stand outside unable to get in, the shopkeeper overwhelmed behind the counter."
---

# Ağda ve web'de saldırılar

> Saldırganlar iki yerde pusu kurar: **yolda** (ağ) ve **kapıda** (web uygulaması).
> Bir de kapıyı kalabalıkla tıkarlar (DDoS).

::cizgi[m10-06-sahne]

## Yolda: MITM ve spoofing

**Ortadaki adam** (MITM), iki taraf arasına girip trafiği okur veya değiştirir.
**Spoofing** kimlik taklididir: sahte ARP, sahte DNS, sahte e-posta göndereni, sahte Wi-Fi ağı.

::animasyon[mitm]

Savunma: her yerde **HTTPS + HSTS**, sertifika uyarılarını asla geçmemek, ortak Wi-Fi'de hassas işlem yapmamak veya VPN.

## Kapıda: web uygulaması açıkları

Web açıklarının çoğu tek bir kökten çıkar: **kullanıcı girdisine güvenmek**.

![Tek Tırnak Jasmine kart katalog dolabına parlayan bir kesme işareti sokuyor; bütün çekmeceler aynı anda fırlıyor](../../gorseller/m10-06-b.webp)

| Açık | Kök neden | Kısa savunma |
|---|---|---|
| **SQL Injection** | Girdi sorgu metnine eklenir | Parametreli sorgu |
| **XSS** | Girdi sayfaya kaçışlanmadan basılır | Çıktıda kaçışlama + CSP |
| **IDOR / yetki hatası** | Sunucu "bu senin mi?" diye sormaz | Her istekte yetki kontrolü |
| **Bilgi ifşası** | Ayrıntılı hata mesajları | Genel hata, ayrıntı loglarda |

XSS'in bir kullanıcıdan diğerine nasıl taşındığını gör:

::animasyon[xss]

Bunların her birini **Ördek Lab**'de güvenle deneyeceksin (Yol A).

## Kalabalıkla tıkamak: DDoS

![Küçük bir dükkânın kapısını binlerce karton figür tıkıyor; gerçek müşteriler içeri giremiyor](../../gorseller/m10-06-c.webp)

**Dağıtık hizmet engelleme**: binlerce ele geçirilmiş cihazdan (botnet) aynı anda gelen trafik, servisi kullanılamaz hâle getirir.
CIA'nın **erişilebilirlik** ayağını hedefler.

Savunma: CDN ve DDoS koruma hizmetleri, hız sınırı, kapasite planlaması.

> ⚠️ "Sadece denemek için" bile olsa bir siteye DDoS yapmak suçtur ve başkalarına da zarar verir.

## 🧪 Dene (3 dk)

Tablodaki dört web açığını CIA ilkeleriyle eşle. Bazıları birden fazla ilkeyi bozabilir mi?

## ✅ Akılda kalsın

- MITM yolda dinler/değiştirir; HTTPS ve sertifika kontrolü korur.
- Web açıklarının ortak kökü: kullanıcı girdisine güvenmek.
- DDoS erişilebilirliği hedefler; denemek bile suçtur.
