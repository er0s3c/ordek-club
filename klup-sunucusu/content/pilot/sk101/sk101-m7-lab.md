---
id: sk101-m7-lab
tur: uygulama
baslik: İlk yarım saatin kayıtları
sure: 20
hedefler:
  - Yetkili olay sorumlusunu belirle
  - Etkiyi sınırlayıp kanıtı koru
  - İşlemleri zaman çizelgesine kaydet
beceriler:
  - incident
ingilizce: translations/en/sk101-m7-lab.md
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
      - Sınırlama ile kanıt koruma birlikte planlanmalıdır.
      - Bu gözlem bütün sistemin güvenli olduğunu kanıtlar.
      - Bu sonuca başka hiçbir bağlam etki etmez.
    answer: 0
    explanation: Sınırlama ile kanıt koruma birlikte planlanmalıdır.
  - id: recall
    kind: fill
    prompt: Derste belirtilen İngilizce anahtar kavramı yaz.
    answers:
      - containment
    caseSensitive: false
    explanation: Anahtar kavram containment.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - İşlemleri zaman çizelgesine kaydet
      - Yetkili olay sorumlusunu belirle
      - Etkiyi sınırlayıp kanıtı koru
    answer:
      - 1
      - 2
      - 0
    explanation: Yetkili olay sorumlusunu belirle → Etkiyi sınırlayıp kanıtı koru →
      İşlemleri zaman çizelgesine kaydet
---

# İlk yarım saatin kayıtları

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

Şüpheli ek açılması ve yetkisiz paylaşım doğrulanmış. İlgili oturumu sınırlama, özgün kayıtları koruma ve yetkili olay sorumlusuna asgari veriyle bildirme sırasını gerekçelendir.

## Kanıt

```text
09:10 attachment opened
09:12 unexpected login confirmed
09:14 incident owner notified
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. Yetkili olay sorumlusunu belirle
2. Etkiyi sınırlayıp kanıtı koru
3. İşlemleri zaman çizelgesine kaydet

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **containment**.

## Ek okuma

[NIST Incident Response](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
