---
id: sk101-m2-lab
tur: uygulama
baslik: Portal neden açılmıyor?
sure: 20
hedefler:
  - Durum kodunu kaydet
  - İstek ve hesap bağlamını incele
  - Nedeni ek kanıtla sınayarak yaz
beceriler:
  - network
ingilizce: translations/en/sk101-m2-lab.md
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Hangi yorum kanıtla destekleniyor?
    options:
      - Bu sonuca başka hiçbir bağlam etki etmez.
      - Sunucudan HTTP yanıtı alınmış, erişim reddedilmiştir.
      - Bu gözlem bütün sistemin güvenli olduğunu kanıtlar.
    answer: 1
    explanation: Sunucudan HTTP yanıtı alınmış, erişim reddedilmiştir.
  - id: recall
    kind: fill
    prompt: Derste belirtilen İngilizce anahtar kavramı yaz.
    answers:
      - status
    caseSensitive: false
    explanation: Anahtar kavram status.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - Nedeni ek kanıtla sınayarak yaz
      - Durum kodunu kaydet
      - İstek ve hesap bağlamını incele
    answer:
      - 1
      - 2
      - 0
    explanation: Durum kodunu kaydet → İstek ve hesap bağlamını incele → Nedeni ek
      kanıtla sınayarak yaz
---

# Portal neden açılmıyor?

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

DNS yanıtı var, TCP bağlantısı kuruluyor, HTTP 403 dönüyor. Bu üç gözlemi ayrı sınıflandır; hangi aşamanın başarısız olduğunu kesinleşmiş kök neden gibi sunma.

## Kanıt

```text
DNS: portal.mavifener.example -> 192.0.2.40
TCP: connected to port 443
HTTP/1.1 403 Forbidden
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. Durum kodunu kaydet
2. İstek ve hesap bağlamını incele
3. Nedeni ek kanıtla sınayarak yaz

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **status**.

## Ek okuma

[RFC 1034](https://www.rfc-editor.org/rfc/rfc1034)
