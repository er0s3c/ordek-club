---
id: f-12
tur: uygulama
baslik: "Final: akıllı cihaz ve mobil uygulama güvenlik denetimi"
sure: 120
hedefler:
  - Laboratuvar akıllı cihaz kitini veya eğitim amaçlı zafiyetli bir uygulamayı uçtan uca değerlendirmek
  - Bulguları riske göre önceliklendirip uygulanabilir düzeltmeler önermek
gorseller:
  - id: f-12-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman'ın tezgâhındaki tüm cihazların kapakları vidalanmış, portları kehribar mühürlerle kapatılmış; Leman soğumuş havyasıyla oturup etkilenmiş gibi başını sallıyor"
    prompt: "The same cluttered workbench from before, now neatly tidied: the smartphone, smart lock, small camera and circuit boards all have their back panels screwed shut, and every little port and pin row is covered with a glowing amber seal. The villain sits on a stool at the edge of the bench, goggles pushed up, her soldering iron cooled in its stand and her tiny drone powered down on her shoulder, nodding slowly with a reluctant impressed smile."
  - id: f-12-b
    tur: ai
    karakter: leman
    alt: "Boş tezgâhta yarım kalmış bir devre kartının içinde minik mekanik bir böcek; kartın arkasında kazınmış soyut simgeler, kapıda uzaklaşan Leman ve dronunun silüeti"
    prompt: "An empty workbench under a single hanging lamp in a dark workshop. In the center lies a half-finished circuit board, and nestled among its components is a tiny clockwork beetle glowing faintly green. The back edge of the board is engraved with small abstract symbols catching the lamplight. In the doorway behind, the villain's silhouette with goggles on her forehead walks away into the dark, her tiny drone following over her shoulder."
---

# Final: akıllı cihaz ve mobil uygulama güvenlik denetimi

> Denetim tek bir açığı bulmak değil; **cihazın bütün kapılarını haritalamak, kanıtlamak ve kapatmaktır**.
> 🔧 **Son devre:** Laboratuvar tezgâhı senin. Leman'ın kurduğu her gözü ve kulağı aç, incele, kapat.

![Lehimci Leman'ın tezgâhındaki tüm cihazların kapakları vidalanmış, portları kehribar mühürlerle kapatılmış; Leman soğumuş havyasıyla oturup etkilenmiş gibi başını sallıyor](../../gorseller/f-12-a.webp)

## Görev

Eğitmenin onayladığı **bir** hedef seç ve **yazılı kapsamla** değerlendir:

- **A — Laboratuvar kiti:** ESP32 kapı kilidi prototipi + laboratuvar MQTT broker'ı + eşlik eden mobil uygulama
- **B — Eğitim uygulaması:** DIVA, InsecureBankv2 veya bir OWASP MASTG test uygulaması (emülatörde)
- **C — Kendi projen:** kendi yazdığın uygulama ya da kendi IoT prototipin

Adımlar:

1. **Tehdit modeli** — saldırı yüzeyi haritası, varlıklar, olası saldırganlar (F11)
2. **Envanter** — bileşenler ve sürümler, izinler, açık servisler (F02, F08)
3. **Test** — statik, dinamik, ağ ve (A için) firmware/donanım incelemesi (F03–F10)
4. **Bulgular** — en az 6; MASVS veya OWASP IoT Top 10 ile eşlenmiş, her biri kanıtlı
5. **Düzeltmeler** — her bulgu için somut öneri ve öncelik

Donanım çalışması yalnızca laboratuvar kartlarında ve elektrik güvenliği kurallarıyla; radyo testleri yalnızca kendi cihazına.

## Rapor iskeleti

| Bölüm | İçerik |
|---|---|
| **Yönetici özeti** | En büyük 3 risk, olası etki, ilk yapılacaklar |
| **Kapsam** | Hedef, sürüm, yöntem, tarih, izin |
| **Tehdit modeli** | Saldırı yüzeyi çizimi + tehdit tablosu |
| **Bulgular** | Başlık, risk (yüksek/orta/düşük), kanıt, eşleştirme, öneri |
| **Düzeltme planı** | Hemen · bu sürüm · sonraki tasarım |

## Değerlendirme

| Ölçüt | Puan |
|---|---:|
| Kapsama ve etik kurallara uyuldu | 2 |
| Tehdit modeli ve envanter eksiksiz | 2 |
| Bulgular doğrulanmış, kanıtlı ve eşlenmiş | 3 |
| Düzeltmeler uygulanabilir ve önceliklendirilmiş | 2 |
| Rapor okunaklı ve yönetici özeti net | 1 |

## ✅ Akılda kalsın

- Denetim haritayla başlar, kapatılmış kapılarla biter.
- Her bulgu kanıtlı, eşlenmiş ve önceliklidir.
- En iyi cihaz, varsayılanı zaten güvenli olan cihazdır.

> 🔒 **DOSYA KAPANDI: Lehimci Leman** · *raporunu teslim edince*
>
> ![Boş tezgâhta yarım kalmış bir devre kartının içinde minik mekanik bir böcek; kartın arkasında kazınmış soyut simgeler, kapıda uzaklaşan Leman ve dronunun silüeti](../../gorseller/f-12-b.webp)
>
> Kameralar kapandı, kilitler yeniden programlandı. Leman'ın tezgâhında yarım kalmış bir kart duruyor; içinde minik, mekanik bir böcek. Kartın arkasına kazınmış not: "Sabri Usta'ya teslim."
>
> ➡️ *Sezon 2 sürüyor: diğer uzmanlık yollarında Gölge Ağ'ın başka dosyaları seni bekliyor.*
