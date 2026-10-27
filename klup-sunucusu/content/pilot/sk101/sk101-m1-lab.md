---
id: sk101-m1-lab
tur: uygulama
baslik: İlk vardiyanın olay kartı
sure: 20
hedefler:
  - Özgün kaydı belirle
  - Kayıtları karşılaştır
  - Değişikliğin etkisini yaz
beceriler:
  - ethics
ingilizce: translations/en/sk101-m1-lab.md
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
      - Bu gözlem bütün sistemin güvenli olduğunu kanıtlar.
      - Bu sonuca başka hiçbir bağlam etki etmez.
      - Gözlenen değişiklik bütünlüğü ilgilendirir.
    answer: 2
    explanation: Gözlenen değişiklik bütünlüğü ilgilendirir.
  - id: recall
    kind: fill
    prompt: Derste belirtilen İngilizce anahtar kavramı yaz.
    answers:
      - integrity
    caseSensitive: false
    explanation: Anahtar kavram integrity.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - Değişikliğin etkisini yaz
      - Özgün kaydı belirle
      - Kayıtları karşılaştır
    answer:
      - 1
      - 2
      - 0
    explanation: Özgün kaydı belirle → Kayıtları karşılaştır → Değişikliğin etkisini yaz
---

# İlk vardiyanın olay kartı

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

Bir sevkiyat kaydının hedefi değişmiş, portal erişilebilir kalmış. Kaynak kayıtla kopyayı karşılaştır; etkilenen güvenlik hedefini ve bilinmeyenleri yaz.

## Kanıt

```text
Original: container=MF-14 destination=North
Observed: container=MF-14 destination=South
File remains readable.
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. Özgün kaydı belirle
2. Kayıtları karşılaştır
3. Değişikliğin etkisini yaz

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **integrity**.

## Ek okuma

[NIST Incident Response](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
