---
id: m08-05
tur: uygulama
baslik: "Uygulama: Parolan ne kadar güvenli?"
sure: 25
hedefler:
  - Parola gücünü uzunluk ve karakter kümesiyle hesaplamak
  - Kimlik doğrulama yöntemlerini senaryoya göre karşılaştırmak
gorseller:
  - id: m08-05-a
    tur: ai
    karakter: kadir
    alt: "Kasa Kıran Kadir, kilit akan dev kum saatinin yanında esneyerek yaşlanıp bekliyor"
    prompt: "A tall elegant hourglass where tiny glowing padlocks fall slowly from an enormous, still nearly full top chamber. The villain sits beside it on a stool, yawning, his beard grown absurdly long, cobwebs on his beanie, waiting forever."
---

# Uygulama: Parolan ne kadar güvenli?

> ⚠️ Bu uygulamada **gerçek parolanı asla** yazma — sadece aşağıdaki kurgusal örneklerle çalış.

![Kasa Kıran Kadir, kilit akan dev kum saatinin yanında esneyerek yaşlanıp bekliyor](../../gorseller/m08-05-a.webp)

## Bölüm 1 — Hesapla

Bir parolanın olası kombinasyon sayısı: **(karakter kümesi büyüklüğü) ^ (uzunluk)**

| Küme | Büyüklük |
|---|---|
| Sadece rakam | 10 |
| Küçük harf | 26 |
| Büyük + küçük + rakam | 62 |
| + özel karakterler | ~94 |

Saldırganın saniyede **10 milyar** tahmin yapabildiğini varsay (hızlı hash'li bir sızıntı).

```python
def kirma_suresi(kume: int, uzunluk: int, hiz: float = 1e10) -> str:
    saniye = kume ** uzunluk / hiz
    for birim, s in [("yıl", 31_536_000), ("gün", 86_400), ("saat", 3_600), ("dakika", 60)]:
        if saniye >= s:
            return f"{saniye / s:,.0f} {birim}"
    return f"{saniye:.3f} saniye"

print(kirma_suresi(10, 6))      # 6 haneli PIN
```

Aşağıdaki kurgusal parolaların **en kötü durum** kırılma süresini hesapla ve tabloyu doldur:

| Kurgusal parola | Küme | Uzunluk | Süre |
|---|---|---|---|
| `482913` | | | |
| `ordekk` | | | |
| `Ordek2026` | | | |
| `K!p2#vX9` | | | |
| `kumda yuruyen mavi ordek` | | | |

> Not: Gerçekte saldırganlar önce **sözlük ve sızmış parola listelerini** dener.
> `Ordek2026` gibi "isim + yıl" kalıbı hesapladığından çok daha hızlı düşer.

## Bölüm 2 — Karşılaştır

Her senaryo için en uygun kimlik doğrulama yöntemini seç ve **neden** olduğunu bir cümleyle yaz:

1. Kulüp sunucusuna SSH ile bağlanan yönetici
2. Öğrenci portalına telefondan giren öğrenci
3. Kulübün sosyal medya hesabı (5 kişi ortak kullanıyor)

<details><summary>Tartışma notları</summary>1: SSH anahtarı (+ parola girişini kapat). 2: Parola yöneticisi + uygulama tabanlı MFA veya passkey. 3: Ortak parola yerine her kişiye ayrı hesap/rol; yoksa parola yöneticisinin paylaşım özelliği + MFA, kişi ayrılınca parolayı değiştir.</details>

## ✅ Akılda kalsın

- Her ek karakter, kombinasyonu kat kat artırır: uzunluk kazanır.
- Tahmin edilebilir kalıplar (isim + yıl) matematiği boşa çıkarır.
- Doğru yöntem senaryoya göre seçilir; ortak hesap yerine ayrı kimlik.
