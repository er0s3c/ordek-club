---
id: f-11
tur: ders
baslik: "IoT güvenlik testi: tehdit modeli ve firmware envanteri"
sure: 9
hedefler:
  - Bir IoT cihazı için saldırı yüzeyi haritası ve tehdit modeli çıkarmak
  - Bulguları OWASP IoT Top 10 ile eşleştirip firmware bileşen envanteri hazırlamak
gorseller:
  - id: f-11-b
    tur: ai
    alt: "Bir akıllı cihazın çevresinde işaretlenmiş giriş noktaları: mobil uygulama, bulut, kablosuz bağlantı ve fiziksel pimler"
    prompt: "A smart doorbell device placed on a large map table, with glowing chalk circles around its entry points connected by arrows: a phone app, a cloud server, radio waves and a row of physical pins on its back."
---

# IoT güvenlik testi: tehdit modeli ve firmware envanteri

> Test, rastgele açık aramak değildir. Önce **haritayı** çizersin, sonra her kapıyı tek tek denetlersin.
> 🔧 **Devre 11:** Leman her cihazın kapılarını bir planda işaretlemiş. Aynı planı sen savunma için çiz.

::cizgi[f-11-sahne]

## Saldırı yüzeyi haritası

![Bir akıllı cihazın çevresinde işaretlenmiş giriş noktaları: mobil uygulama, bulut, kablosuz bağlantı ve fiziksel pimler](../../gorseller/f-11-b.webp)

Bir cihazı yedi katmanda düşün: **donanım** (UART, flash) · **firmware** · **yerel ağ servisleri** · **radyo** (Wi-Fi, BLE) ·
**mobil uygulama** · **bulut API** · **güncelleme kanalı**. Her katman için sor: kim erişir, ne korur, ne olursa ne kaybederiz?

## OWASP IoT Top 10

| # | Başlık |
|---|---|
| I1 | Zayıf, tahmin edilebilir veya gömülü parolalar |
| I2 | Güvensiz ağ servisleri |
| I3 | Güvensiz ekosistem arayüzleri (bulut, API, mobil) |
| I4 | Güvenli güncelleme mekanizması eksikliği |
| I5 | Güvensiz veya eski bileşenler |
| I6 | Yetersiz gizlilik koruması |
| I7 | Güvensiz veri aktarımı ve depolama |
| I8 | Cihaz yönetimi eksikliği |
| I9 | Güvensiz varsayılan ayarlar |
| I10 | Fiziksel sertleştirme eksikliği |

## Firmware envanteri

Envanter (SBOM, Software Bill of Materials): firmware'deki her bileşen ve sürümü.

```text
bileşen     sürüm     yayın   bilinen açık?
BusyBox     1.24.1    2016    CVE veritabanında ara
OpenSSL     1.0.2k    2017    destek süresi bitmiş
```

Eski bir kütüphane, cihazın tamamını eski yapar.

## Test akışı

1. **Kapsam ve yazılı izin** — hangi cihaz, hangi yöntem, hangi saat.
2. Harita → tehdit listesi → test planı.
3. Kanıt topla: komut, çıktı, ekran görüntüsü.
4. Bulguyu Top 10 ile eşle, riskini yaz, düzeltme öner.

## 🧪 Dene (6 dk)

`content/academy/lab/f-cihaz-config.txt` dosyasındaki kapı denetleyicisini incele. En az **yedi** sorun bul ve
her birini OWASP IoT Top 10 başlığıyla eşle. En kritik üçünü seç ve nedenini bir cümleyle yaz.

## ✅ Akılda kalsın

- Önce harita, sonra test; kapsam ve izin her zaman yazılı.
- OWASP IoT Top 10 bulgularını ortak bir dille raporlatır.
- Firmware envanteri, eski bileşenleri görünür kılar.
