---
id: m09-04
tur: ders
baslik: Bulduğunu inandırıcı anlatmak
sure: 6
hedefler:
  - Bir OSINT bulgusunu kaynak ve güven düzeyiyle raporlamak
gorseller:
  - id: m09-04-a
    tur: ai
    karakter: mine
    alt: "Maskeli Mine kanıt panosundaki zaman çizelgesine sahte kanıt kartları iğneliyor"
    prompt: "A clean evidence board wall with cards (simple icons only: a globe, a camera, a calendar, a document) pinned in a neat timeline connected by thin lines. The villain pins an extra suspicious card into the sequence with a gloved hand, glancing back over her shoulder."
---

# Bulduğunu inandırıcı anlatmak

> İyi bir araştırmacı "buldum" demez; **"şuradan, şu tarihte, şu kadar eminim"** der.

![Maskeli Mine kanıt panosundaki zaman çizelgesine sahte kanıt kartları iğneliyor](../../gorseller/m09-04-a.webp)

## Her bulgu için dört şey

| | Örnek |
|---|---|
| **Bulgu** | `kku-burs-onay.example` alan adı 3 gün önce kaydedilmiş |
| **Kaynak** | WHOIS sorgusu, 4 Mart 2026, 10:12 |
| **Kanıt** | Ekran görüntüsü (ek 2) |
| **Güven düzeyi** | Yüksek — kayıt bilgisi doğrudan sorgulandı |

## Güven düzeyi

- **Yüksek** — Birbirinden bağımsız birden fazla güvenilir kaynak, doğrudan gözlem.
- **Orta** — Tek güvenilir kaynak ya da dolaylı kanıt.
- **Düşük** — Doğrulanamayan tek kaynak, tahmin.

"Kesin" kelimesini **çok** az kullan. Yanlış ama emin bir rapor, belirsiz ama dürüst bir rapordan daha zararlıdır.

## Kısa rapor iskeleti

```text
1. Soru:        Ne araştırıldı ve neden?
2. Özet:        3 cümlelik sonuç (teknik olmayan biri için)
3. Bulgular:    Her biri kaynak, kanıt ve güven düzeyiyle
4. Sonuç ve öneri
5. Ekler:       Ekran görüntüleri, sorgu çıktıları (tarih/saatli)
```

## Kanıt toplarken

- Ekran görüntüsüne **tarih ve adresi** dahil et.
- Sayfa değişebilir: web arşivine kaydet veya PDF olarak sakla.
- Rapora gereksiz kişisel veri koyma; gerekiyorsa maskele.

## 🧪 Dene (4 dk)

M01'deki sahte burs mesajı için tek bir bulguyu yukarıdaki dört alanla (bulgu, kaynak, kanıt, güven) yaz.

## ✅ Akılda kalsın

- Bulgu + kaynak + kanıt + güven düzeyi.
- Özet, teknik olmayan biri için yazılır.
- Kanıt tarihli olsun, kişisel veri minimum.
