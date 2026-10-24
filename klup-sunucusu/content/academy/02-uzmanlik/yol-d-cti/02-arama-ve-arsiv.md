---
id: d-02
tur: ders
baslik: "Arama ve arşiv: bilgi nereden çıktı?"
sure: 8
hedefler:
  - Gelişmiş arama operatörleri ve web arşivleriyle bir bilginin ilk kaynağını bulmak
  - Kaynağı ve bilgiyi Admiralty koduyla ayrı ayrı derecelendirmek
gorseller:
  - id: d-02-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri iskeledeki ilk megafona fısıldıyor; aynı parlayan simge bir megafondan diğerine geçerek büyüyor"
    prompt: "A foggy harbor promenade with five old-fashioned brass megaphones mounted on tall poles, each one pointing at the next in a loose circle. The villain leans close and whispers into the first megaphone with a sly half-smile, and the same glowing green abstract symbol travels from megaphone to megaphone, growing bigger and brighter each time."
---

# Arama ve arşiv: bilgi nereden çıktı?

> Beş site aynı şeyi söylüyorsa beş kaynağın mı var, yoksa bir kaynağın beş yankısı mı?
> 🚩 **Bayrak 2:** İki haber sitesi "uzmanlara göre MERCAN-7" diyor. Bağlantıları takip ettiğinde hepsi aynı anonim bloğa çıkıyor.

![Bayrakçı Bedri iskeledeki ilk megafona fısıldıyor; aynı parlayan simge bir megafondan diğerine geçerek büyüyor](../../gorseller/d-02-a.webp)

## Gelişmiş arama

```text
"MERCAN-7" site:example            tam ifade, tek site
"Sis Düdüğü" -reklam               bir kelimeyi dışla
filetype:pdf "tehdit raporu"       yalnızca PDF
"MERCAN-7" before:2026-10-04       belirli tarihten önce
```

Amaç çok sonuç değil, **en eski** sonuç. İddianın ilk göründüğü yer genellikle hikâyenin kaynağıdır.

## Arşivler

Sayfalar değişir, silinir. Web arşivi (Wayback Machine — `web.archive.org`) bir sayfanın geçmiş kopyalarını gösterir:
bir blog yazısı sonradan düzeltilmiş mi, "eski" görünen bir site aslında geçen hafta mı açılmış?
Kendi bulgunu da arşivle: kanıt, kaynak silinince kaybolmasın.

## Döngüsel raporlama (circular reporting)

A, B'yi; B, C'yi; C yine A'yı kaynak gösterir. Sonunda **tek** bir iddia, çok kaynaklıymış gibi görünür.
Sahte bayrağın en ucuz yükselticisi budur. Her bağlantıyı geriye doğru izle, zaman damgalarını sırala.

## Admiralty kodu

Kaynağı ve bilgiyi **ayrı** puanla: güvenilir bir kaynak yanılabilir, şüpheli bir kaynak doğru söyleyebilir.

| Kaynak güvenilirliği | Bilgi doğruluğu |
|---|---|
| **A** Tamamen güvenilir | **1** Başka kaynakla doğrulandı |
| **B** Genellikle güvenilir | **2** Muhtemelen doğru |
| **C** Oldukça güvenilir | **3** Belki doğru |
| **D** Genellikle güvenilmez | **4** Şüpheli |
| **E** Güvenilmez | **5** Muhtemelen yanlış |
| **F** Değerlendirilemez | **6** Değerlendirilemez |

Örnek: yeni açılmış anonim bir blogdaki doğrulanmamış iddia → **F6**.

## 🧪 Dene (5 dk)

`lab/d-tehdit-raporlari.md` içindeki K2, K3, K4, K6 ve K7'yi **saatine göre** sırala. "MERCAN-7" iddiası ilk nerede çıktı?
Her kaynağa bir Admiralty kodu ver ve tek cümleyle gerekçelendir.

## ✅ Akılda kalsın

- En çok sonuç değil, en eski sonuç önemlidir.
- Aynı iddiayı tekrarlayan beş site, tek kaynak olabilir.
- Kaynak ve bilgi ayrı derecelendirilir: harf + rakam.
