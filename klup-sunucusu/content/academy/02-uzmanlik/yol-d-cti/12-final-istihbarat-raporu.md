---
id: d-12
tur: uygulama
baslik: "Final: Sis Düdüğü istihbarat raporu"
sure: 120
hedefler:
  - Kurgusal bir kampanya için kanıta dayalı, güven düzeyi belirtilmiş bir istihbarat raporu yazmak
  - Sahte bayrakları ayırıp eyleme dönük savunma önerileri vermek
gorseller:
  - id: d-12-a
    tur: ai
    karakter: bedri
    alt: "Şafakta sisli limanda bütün sahte bayraklar indirilip açık bir rapor dosyasının yanına katlanmış; Bayrakçı Bedri iskele babasının üstünde oturup omuz silkiyor"
    prompt: "The foggy harbor at dawn with soft amber light breaking through. All the small flags have been taken down from a tall flagpole rack and lie neatly folded on a wooden table beside an open report folder; only one plain flag remains on the pole, showing a single simple abstract symbol. The villain sits on a mooring bollard nearby, empty hands raised in a theatrical shrug, with a reluctant grin."
  - id: d-12-b
    tur: ai
    karakter: bedri
    alt: "Karanlık bir ofiste gece yarısında durmuş bir duvar saatinin altında aynı ayna simgesini taşıyan kayıt kartları; masadaki el aynasında Kapüşonlular'ın eski fotoğrafı yansıyor, kapıda Bayrakçı Bedri'nin silüeti kasketini çıkarıyor"
    prompt: "A dark empty office at night. On the wall a round clock has stopped at an hour deep in the night, and beneath it a row of glowing green index cards is pinned up, every card carrying the same small abstract mirror symbol. On the desk lies an oval hand mirror reflecting a faded instant photo of hooded teenagers in a basement lab. In the doorway, the villain's silhouette tips his captain's cap and steps back into the fog."
---

# Final: Sis Düdüğü istihbarat raporu

> İyi bir rapor kimin yaptığını bağırmaz; neyi bildiğini, neyi bilmediğini ve ne kadar emin olduğunu söyler.
> 🚩 **Son bayrak:** Bütün dosyalar masanda. Rektörlük yarın sabah soracak: "Saldırıyı MERCAN-7 mi yaptı, ne yapmalıyız?"

![Şafakta sisli limanda bütün sahte bayraklar indirilip açık bir rapor dosyasının yanına katlanmış; Bayrakçı Bedri iskele babasının üstünde oturup omuz silkiyor](../../gorseller/d-12-a.webp)

## Görev

Laboratuvardaki vaka dosyalarını (`lab/d-tehdit-raporlari.md`, `d-altyapi-kayitlari.txt`, `d-ioc-listesi.csv`,
`d-stix-paketi.json`, `d-av-olaylari.jsonl`) kullanarak:

1. **PIR** — rektörlüğün sorusunu bir ya da iki PIR'e çevir (D06)
2. **Kaynak değerlendirmesi** — her kaynağa Admiralty kodu (D02)
3. **Olay ve altyapı** — zaman çizelgesi, ATT&CK eşlemesi, altyapı ilişkileri (D03, D07, D10)
4. **Hipotezler** — en az üç hipotezli ACH tablosu (D11)
5. **Değerlendirme** — güven düzeyi ve olasılık diliyle sonuç
6. **Öneriler** — tespit kuralları (Sigma/YARA), engelleme listesi (temizlenmiş), farkındalık

Yalnızca laboratuvar dosyalarını kullan; gerçek bir grubu veya kişiyi araştırma, rapora gerçek isim yazma.

## Güven dili

| İfade | Olasılık |
|---|---|
| Neredeyse kesin | %95–99 |
| Büyük olasılıkla | %80–95 |
| Muhtemelen | %55–80 |
| Yarı yarıya | %45–55 |
| Muhtemelen değil | %20–45 |
| Çok düşük olasılıkla | %5–20 |

**Güven düzeyi** (düşük / orta / yüksek) ayrıdır: olasılığın değil, **kanıtın kalitesinin** ölçüsüdür.
Örnek: "Kampanyanın MERCAN-7 tarafından yürütülmüş olması *çok düşük olasılıkla* doğrudur (*orta güven*)."

## Rapor iskeleti

| Bölüm | İçerik |
|---|---|
| **Yönetici özeti** | Üç cümle: ne oldu, kim (güven düzeyiyle), ne yapılmalı |
| **Temel değerlendirmeler** | Her biri olasılık + güven düzeyi + dayandığı kanıt |
| **Kanıt tablosu** | Kanıt, kaynak, Admiralty kodu, hangi hipotezi destekliyor |
| **ACH tablosu** | Hipotezler × kanıtlar, çelişki sayıları |
| **ATT&CK eşlemesi** | Taktik, teknik, gözlem, mevcut tespit var mı? |
| **Öneriler** | Kısa vade (engelle, temizle), orta vade (kurallar), uzun vade (eğitim, PIR güncelleme) |
| **Ekler** | Temizlenmiş IOC listesi, Sigma/YARA kuralları, TLP etiketi |

## Değerlendirme

| Ölçüt | Puan |
|---|---:|
| PIR ve kapsam net; yalnızca laboratuvar verisi kullanıldı | 1 |
| Kaynaklar Admiralty koduyla gerekçeli değerlendirildi | 2 |
| Zaman çizelgesi ve ATT&CK eşlemesi doğru | 2 |
| ACH tablosu ve sahte bayrak analizi ikna edici | 3 |
| Güven dili tutarlı; bilinmeyenler açıkça yazıldı | 1 |
| Öneriler uygulanabilir; IOC listesi yanlış pozitiflerden temizlenmiş | 1 |

## ✅ Akılda kalsın

- Rapor bir karar içindir: yönetici özeti tek başına okunabilmeli.
- Olasılık ve güven ayrı söylenir; bilinmeyen de bir bulgudur.
- Ucuz izler bayrak diker; altyapı ve davranış sahibini gösterir.

> 🔒 **DOSYA KAPANDI: Bayrakçı Bedri** · *raporunu teslim edince*
>
> ![Karanlık bir ofiste gece yarısında durmuş bir duvar saatinin altında aynı ayna simgesini taşıyan kayıt kartları; masadaki el aynasında Kapüşonlular'ın eski fotoğrafı yansıyor, kapıda Bayrakçı Bedri'nin silüeti kasketini çıkarıyor](../../gorseller/d-12-b.webp)
>
> Bayraklar söküldü; bütün altyapı tek bir şirkete çıkıyor: Ayna Teknoloji. Kâğıt üstünde kimse yok, ama bütün alan adları aynı gece, aynı saatte kaydedilmiş: Kapüşonlular'ın yirmi yıl önce buluştuğu saatte.
>
> ➡️ *Sezon 2 sürüyor: diğer uzmanlık yollarında Gölge Ağ'ın başka dosyaları seni bekliyor.*
