---
id: sk101-m4-lab
tur: uygulama
baslik: Unutulan izinler
sure: 20
hedefler:
  - Sahibi ve mevcut modu oku
  - En az gerekli modu uygula
  - Sonucu yeniden doğrula
beceriler:
  - linux
ingilizce: translations/en/sk101-m4-lab.md
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
      - Temel dosya modu 600 olmalıdır.
      - Bu gözlem bütün sistemin güvenli olduğunu kanıtlar.
    answer: 1
    explanation: Temel dosya modu 600 olmalıdır.
  - id: recall
    kind: command
    prompt: incident.txt için yalnız sahibine okuma/yazma izni veren komutu yaz.
    answers:
      - chmod 600 incident.txt
    explanation: 600 modu sahibine okuma ve yazma verir.
  - id: sequence
    kind: order
    prompt: İnceleme adımlarını sırala.
    options:
      - Sonucu yeniden doğrula
      - Sahibi ve mevcut modu oku
      - En az gerekli modu uygula
    answer:
      - 1
      - 2
      - 0
    explanation: Sahibi ve mevcut modu oku → En az gerekli modu uygula → Sonucu
      yeniden doğrula
---

# Unutulan izinler

> Yayımlanmamış vaka labı taslağı; teknik ve dil incelemesi gerekir.

## Brifing

incident.txt dosyası diğer kullanıcılarca okunabiliyor. Dosya sahibi öğrencidir. Önce modu kaydet, sonra yalnız sahibine okuma/yazma verecek değişikliği öner ve doğrula. Ayrı Linux sunucusu kurulduğunda Komut Hattı'nda gerçek dosyayla çalışılabilir.

## Kanıt

```text
Before: -rw-r--r-- student student incident.txt
Required: owner read/write only
```

Bütün kayıtlar ve hedefler sentetiktir. Dış hedefe bağlantı kurulmaz.

## Beklenen düşünme

1. Sahibi ve mevcut modu oku
2. En az gerekli modu uygula
3. Sonucu yeniden doğrula

Hangi sonucun doğrudan desteklendiğini ve hangi ek kanıtın yorumunu değiştireceğini açıkla.

Anahtar kavram: **permissions**.

## Ek okuma

[GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html)
