---
id: d-11
tur: ders
baslik: "Korelasyon ve atıf: sahte bayrağı nasıl ayırırsın?"
sure: 9
hedefler:
  - Elmas Modeli ve rakip hipotezler analiziyle (ACH) kanıtları birleştirmek
  - Bilişsel yanlılıkları ve sahte bayrak göstergelerini tanımak
gorseller:
  - id: d-11-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri kanıt panosundaki kırmızı ipleri gizlice başka bir kaptanın silüetine yönlendiriyor; kaçırdığı kehribar ipler kendi askıdaki kasketine çıkıyor"
    prompt: "A dim ship's cabin with a large investigation corkboard covered in abstract photos and symbol cards linked by strings. The villain secretly re-pins all the red strings so they lead to a faceless silhouette portrait of a different captain, looking very pleased with himself, but a few amber strings he missed still run straight across the cabin to his own captain's cap hanging on a hook by the door."
---

# Korelasyon ve atıf: sahte bayrağı nasıl ayırırsın?

> Kanıtı toplamak kolay; onu doğru hipoteze bağlamak zor. Bedri ipleri senin yerine bağlamaya çalışır.
> 🚩 **Bayrak 11:** Elinde rapor, altyapı kaydı, zararlı yazılım analizi ve av sonuçları var. Hepsi aynı yere mi çıkıyor?

![Bayrakçı Bedri kanıt panosundaki kırmızı ipleri gizlice başka bir kaptanın silüetine yönlendiriyor; kaçırdığı kehribar ipler kendi askıdaki kasketine çıkıyor](../../gorseller/d-11-a.webp)

## Elmas Modeli (Diamond Model)

Her saldırı olayının dört köşesi vardır: **Saldırgan (adversary) · Yetenek (capability) · Altyapı (infrastructure) · Kurban (victim)**.
Boş bir köşe, toplanacak bilginin yeridir. Sahte bayrak genellikle yetenek köşesini boyar; altyapı köşesi daha zor taklit edilir.

Olayları zaman çizgisinde ise **Siber Öldürme Zinciri (Cyber Kill Chain)** ile sırala: keşif → silahlandırma → iletim → istismar → kurulum → komuta-kontrol → eylem.

## Zihnin tuzakları

| Yanlılık | Belirtisi |
|---|---|
| **Doğrulama yanlılığı (confirmation bias)** | Yalnızca ilk hipotezi destekleyen kanıtı aramak |
| **Çapalama (anchoring)** | İlk duyulan isme takılıp kalmak |
| **Ayna düşüncesi (mirror imaging)** | "Ben olsam böyle yapardım, o da öyle yapmıştır" |
| **Erişilebilirlik (availability)** | En çok konuşulan grubu en olası sanmak |

## Rakip hipotezler analizi (ACH)

Analysis of Competing Hypotheses: hipotezleri **yan yana** koy, her kanıtın her hipotezle uyumunu işaretle (✔ uyumlu · ✘ çelişkili · – nötr).
Kazanan, en çok ✔ alan değil, **en az ✘ alan** hipotezdir. Her hipotezle uyumlu kanıt ayırt edici değildir.

| Kanıt | H1: MERCAN-7 | H2: Başkası, sahte bayrakla | H3: Derleyiciyi kullanan bağımsız biri |
|---|---|---|---|
| DLL'de `MERCAN-7 was here` | ✔ | ✔ | ✔ |
| Teknikler MERCAN-7'nin geçmişinden farklı | ✘ | ✔ | ✔ |
| … | | | |

## Sahte bayrak göstergeleri

- Atıf kanıtları **fazla temiz ve fazla erken**: sorumluluk iddiası olaydan hemen sonra.
- Ucuz izler bir grubu, pahalı izler (altyapı, kayıt düzeni) başka birini gösteriyor.
- İddiayı yayan kaynaklar yeni, koordineli ve döngüsel.

## 🧪 Dene (6 dk)

Tabloyu tamamla: tüm `lab/d-*` dosyalarından en az **altı** kanıt ekle (altyapı, sertifika, EXIF, sosyal hesaplar, imphash, av sonuçları).
Hangi hipotez en az çelişki alıyor? Hangi kanıt hiçbir hipotezi ayırmıyor?

## ✅ Akılda kalsın

- Elmas Modeli boş köşeyi, ACH zayıf hipotezi gösterir.
- Kazanan, en az çelişkiyle karşılaşan hipotezdir; her şeyle uyumlu kanıt ayırt edici değildir.
- Ucuz izlerle pahalı izler farklı yeri gösteriyorsa, pahalı ize güven.
