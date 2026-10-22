---
id: m06-03
tur: ders
baslik: Ön yüz, arka yüz ve API
sure: 7
hedefler:
  - HTML, CSS ve JavaScript'in rollerini ayırt etmek
  - Frontend, backend, API ve veritabanı ilişkisini açıklamak
gorseller:
  - id: m06-03-a
    tur: ai
    karakter: celal
    alt: "Tiyatronun perde arkasında Çerezci Celal servis penceresinden sızıp kontrol paneline uzanıyor"
    prompt: "A theater cutaway: a bright front stage with colorful set pieces, behind the curtain a backstage full of ropes, gears and a control panel, and below a basement archive of boxes. The villain climbs through the small service window between stage and backstage, reaching for the control levers."
---

# Ön yüz, arka yüz ve API

> Gördüğün sayfa bir tiyatro sahnesidir. Asıl iş **perde arkasında** döner —
> ve güvenlik kararları da orada verilmelidir.

![Tiyatronun perde arkasında Çerezci Celal servis penceresinden sızıp kontrol paneline uzanıyor](../../gorseller/m06-03-a.webp)

## Sahne: frontend

| Dil | Görevi | Benzetme |
|---|---|---|
| **HTML** | İçerik ve yapı | Dekor ve oyuncular |
| **CSS** | Görünüm | Kostüm ve ışık |
| **JavaScript** | Davranış | Oyuncuların hareketi |

Frontend **senin bilgisayarında** çalışır. Yani kullanıcı onu görebilir, değiştirebilir, atlayabilir.

## Perde arkası: backend ve veritabanı

- **Backend** — Sunucuda çalışan kod. Kimin ne yapabileceğine karar verir.
- **Veritabanı** — Verilerin tablolarda saklandığı yer (öğrenciler, notlar, ödevler).

## Aradaki pencere: API ve JSON

Modern uygulamalarda frontend, backend ile **API** üzerinden konuşur. Veriler genelde **JSON** biçimindedir:

```http
GET /api/odevler/42
```
```json
{ "id": 42, "baslik": "Ağ Temelleri", "teslim": "2026-03-10", "puan": 85 }
```

## Altın kural

> **Frontend'deki kontrol bir kolaylıktır, güvenlik değildir.**

"Not alanı sadece 0–100 kabul eder" kuralı yalnızca JavaScript'te varsa, kullanıcı isteği
doğrudan API'ye `"puan": 1000` diye gönderebilir. Her kontrol **backend'de** tekrar yapılmalıdır.

## 🧪 Dene (3 dk)

F12 → Network → **Fetch/XHR** filtresini seç ve kullandığın bir web uygulamasında bir şeye tıkla.
JSON dönen bir API isteği bulabildin mi?

## ✅ Akılda kalsın

- HTML yapı, CSS görünüm, JavaScript davranış.
- Frontend kullanıcının elindedir; güvenlik kararları backend'de verilir.
- API'ler JSON ile konuşur ve doğrudan çağrılabilir.
