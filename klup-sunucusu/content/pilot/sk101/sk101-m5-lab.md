---
id: sk101-m5-lab
tur: uygulama
baslik: Gece açılan hesap
sure: 20
hedefler:
  - Kaynak ve zaman bilgisini doğrula
  - Hesap olaylarını ilişkilendir
  - Değişiklik kaydıyla karşılaştır
beceriler:
  - windows
ingilizce: translations/en/sk101-m5-lab.md
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
etkinlikler:
  - id: interpret
    kind: log
    prompt: Hesap oluşturma kaydını seç.
    options:
      - 02:10 EventID=4625 Account=lab-admin
      - 02:12 EventID=4624 Account=lab-admin
      - 02:13 EventID=4720 Target=lab-temp
    answer: 2
    explanation: 4720 satırı hesap oluşturma gözlemidir; yetki bağlamı ayrıca doğrulanır.
  - id: recall
    kind: fill
    prompt: Derste belirtilen İngilizce anahtar kavramı yaz.
    answers:
      - event
    caseSensitive: false
    explanation: Anahtar kavram event.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - Değişiklik kaydıyla karşılaştır
      - Kaynak ve zaman bilgisini doğrula
      - Hesap olaylarını ilişkilendir
    answer:
      - 1
      - 2
      - 0
    explanation: Kaynak ve zaman bilgisini doğrula → Hesap olaylarını ilişkilendir →
      Değişiklik kaydıyla karşılaştır
---

# Gece açılan hesap

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

Üç Windows kaydında başarısız giriş, başarılı giriş ve yeni hesap oluşturma var. Hesap oluşturma olayını seç; değişiklik kaydı ve hesap sahibi doğrulaması olmadan olayın tümünü açıklayamayacağını belirt.

## Kanıt

```text
02:10 EventID=4625 Account=lab-admin
02:12 EventID=4624 Account=lab-admin
02:13 EventID=4720 Target=lab-temp
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. Kaynak ve zaman bilgisini doğrula
2. Hesap olaylarını ilişkilendir
3. Değişiklik kaydıyla karşılaştır

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **event**.

## Ek okuma

[Microsoft audit event reference](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4624)
