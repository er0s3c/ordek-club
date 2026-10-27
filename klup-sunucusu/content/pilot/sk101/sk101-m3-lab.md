---
id: sk101-m3-lab
tur: uygulama
baslik: Yanlış siparişin izi
sure: 20
hedefler:
  - İzinli iki test hesabını belirle
  - Nesne sahibi ve yanıtı karşılaştır
  - Asgari kanıtla yetki hatasını raporla
beceriler:
  - web
ingilizce: translations/en/sk101-m3-lab.md
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
      - Nesne sahibi ile istek sahibinin yetkisi sunucuda karşılaştırılmalıdır.
      - Bu gözlem bütün sistemin güvenli olduğunu kanıtlar.
      - Bu sonuca başka hiçbir bağlam etki etmez.
    answer: 0
    explanation: Nesne sahibi ile istek sahibinin yetkisi sunucuda karşılaştırılmalıdır.
  - id: recall
    kind: fill
    prompt: Derste belirtilen İngilizce anahtar kavramı yaz.
    answers:
      - authorization
    caseSensitive: false
    explanation: Anahtar kavram authorization.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - Asgari kanıtla yetki hatasını raporla
      - İzinli iki test hesabını belirle
      - Nesne sahibi ve yanıtı karşılaştır
    answer:
      - 1
      - 2
      - 0
    explanation: İzinli iki test hesabını belirle → Nesne sahibi ve yanıtı
      karşılaştır → Asgari kanıtla yetki hatasını raporla
---

# Yanlış siparişin izi

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

Eğitim hesabı A, B hesabının kurgusal siparişini görüntüleyebiliyor. Kanıtı kişisel veri olmadan kaydet; nesne yetkilendirmesini ve olası etki sınırını tartış.

## Kanıt

```text
GET /orders/42 HTTP/1.1
Training session owner: A
Synthetic order owner: B
HTTP/1.1 200 OK
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. İzinli iki test hesabını belirle
2. Nesne sahibi ve yanıtı karşılaştır
3. Asgari kanıtla yetki hatasını raporla

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **authorization**.

## Ek okuma

[MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
