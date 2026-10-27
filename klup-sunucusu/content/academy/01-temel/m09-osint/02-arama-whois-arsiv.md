---
id: m09-02
tur: ders
baslik: Arama motoru, WHOIS, DNS ve internetin hafızası
sure: 8
hedefler:
  - Arama operatörleriyle hedefli arama yapmak
  - WHOIS ve DNS kayıtlarını okumak
  - Web arşivinde bir sitenin geçmişine bakmak
gorseller:
  - id: m09-02-a
    tur: ekran
    alt: Web arşivinde (Wayback Machine) example.com için yıllara göre kayıt takvimi
    nasil: "https://web.archive.org adresine gidin, arama kutusuna example.com yazın. Üstte yıllara göre çubuk grafik, altta takvim görünümü çıksın. Grafik çubuğunu ve takvimdeki noktalı günlerden birini kehribar (#C9953B) çerçeveyle işaretleyin. Tarayıcıda oturum açmış hesap bilgisi görünmesin."
  - id: m09-02-c
    tur: ai
    alt: "Bir alan adının nüfus cüzdanı; doğum tarihi yeni olduğu için kırmızı yanıp sönüyor"
    prompt: "A clerk at a records office holds up an identity card attached to a small model house, the birth date area of the card glowing urgent red because the house appeared only days ago, while older model houses on the shelf have calm faded cards."
---

# Arama motoru, WHOIS, DNS ve internetin hafızası

> İnternette bir şey kaybolsa da çoğu zaman **izi** kalır. Doğru sorguyu bilen o izi bulur.

::cizgi[m09-02-sahne]

## Arama operatörleri

| Operatör | Örnek | Ne yapar? |
|---|---|---|
| `"..."` | `"Kuzey Kıyı Üniversitesi"` | Tam ifade |
| `site:` | `site:kuzeykiyi.edu.example burs` | Sadece o sitede |
| `filetype:` | `filetype:pdf yönetmelik` | Belirli dosya türü |
| `-` | `ördek -yemek` | Kelimeyi hariç tut |
| `before:` / `after:` | `after:2025-01-01` | Tarih aralığı |

## WHOIS: alan adının nüfus kaydı

![Bir alan adının nüfus cüzdanı; doğum tarihi yeni olduğu için kırmızı yanıp sönüyor](../../gorseller/m09-02-c.webp)

```bash
whois example.com
```

Bakılacaklar: **kayıt tarihi** (yeni mi?), **kayıt şirketi**, **bitiş tarihi**. Kişisel bilgiler çoğunlukla gizlilik hizmetiyle saklanır.

> Bir "üniversite burs" sitesinin alan adı **3 gün önce** kaydedildiyse, bu tek başına büyük bir işarettir.

## DNS kayıtları

```bash
nslookup -type=MX example.com     # e-posta sunucuları
nslookup -type=TXT example.com    # SPF gibi doğrulama kayıtları
```

| Kayıt | Anlamı |
|---|---|
| `A` / `AAAA` | IPv4 / IPv6 adresi |
| `MX` | E-postayı kabul eden sunucu |
| `TXT` | Doğrulama ve e-posta güvenliği (SPF, DMARC) |
| `NS` | Alan adının ad sunucuları |

## İnternetin hafızası: web arşivi

Bir sitenin **eski hâllerini** web arşivlerinde görebilirsin. Değiştirilmiş veya silinmiş içerik için çok değerlidir.

![Web arşivi takvimi](../../gorseller/m09-02-a.webp)

## 🧪 Dene (5 dk)

`whois example.com` çalıştır (veya bir WHOIS web sitesi kullan). Kayıt tarihi ne?
Sonra web arşivinde `example.com`'un en eski kaydını bul. İkisi tutarlı mı?

## ✅ Akılda kalsın

- Operatörler aramayı daraltır: `site:`, `filetype:`, `"..."`.
- WHOIS'teki yeni kayıt tarihi bir uyarı işaretidir.
- Web arşivi bir sitenin geçmişini gösterir.
