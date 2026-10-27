---
id: f-12
tur: uygulama
baslik: "Final: akıllı cihaz ve mobil uygulama güvenlik denetimi"
sure: 120
hedefler:
  - Laboratuvar akıllı cihaz kitini veya eğitim amaçlı zafiyetli bir uygulamayı uçtan uca değerlendirmek
  - Bulguları riske göre önceliklendirip uygulanabilir düzeltmeler önermek
gorseller:
  - id: f-12-c
    tur: ai
    alt: "Atölye masasında denetimi bitmiş cihazlar etiketli kutularda; analist mühürlü rapor dosyasını kapatıyor"
    prompt: "A workshop table at dawn with inspected devices placed in separate trays with colored tags, and an analyst closing a thick report folder with an amber seal."
---

# Final: akıllı cihaz ve mobil uygulama güvenlik denetimi

> Denetim tek bir açığı bulmak değil; **cihazın bütün kapılarını haritalamak, kanıtlamak ve kapatmaktır**.
> 🔧 **Son devre:** Laboratuvar tezgâhı senin. Leman'ın kurduğu her gözü ve kulağı aç, incele, kapat.

::cizgi[f-12-sahne]

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

![Atölye masasında denetimi bitmiş cihazlar etiketli kutularda; analist mühürlü rapor dosyasını kapatıyor](../../gorseller/f-12-c.webp)

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
> ::cizgi[leman-kapanis]
>
> ➡️ *Sezon 2 sürüyor: diğer uzmanlık yollarında Gölge Ağ'ın başka dosyaları seni bekliyor.*
