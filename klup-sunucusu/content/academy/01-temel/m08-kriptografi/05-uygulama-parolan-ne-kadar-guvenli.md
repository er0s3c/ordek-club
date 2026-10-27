---
id: m08-05
tur: uygulama
baslik: "Uygulama: Parolan ne kadar güvenli?"
sure: 25
hedefler:
  - Parola gücünü uzunluk ve karakter kümesiyle hesaplamak
  - Kimlik doğrulama yöntemlerini senaryoya göre karşılaştırmak
gorseller:
  - id: m08-05-b
    tur: ai
    alt: "Kısa bir kombinasyon kilidi birkaç saniyede açılırken uzun bir kombinasyon kilidinin karşısında robot yaşlanıp beklemekte"
    prompt: "Split scene: on the left a small combination lock with only a few wheels being cracked open instantly by a busy little robot, on the right a very long combination lock with many wheels and the same robot, now old with a white beard and cobwebs, still spinning the wheels."
---

# Uygulama: Parolan ne kadar güvenli?

> ⚠️ Bu uygulamada **gerçek parolanı asla** yazma — sadece aşağıdaki kurgusal örneklerle çalış.

::cizgi[m08-05-sahne]

## Bölüm 1 — Hesapla

![Kısa bir kombinasyon kilidi birkaç saniyede açılırken uzun bir kombinasyon kilidinin karşısında robot yaşlanıp beklemekte](../../gorseller/m08-05-b.webp)

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
