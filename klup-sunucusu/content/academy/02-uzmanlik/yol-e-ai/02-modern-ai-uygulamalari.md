---
id: e-02
tur: ders
baslik: "Modern AI uygulamaları: RAG, embedding ve ajanlar"
sure: 8
hedefler:
  - RAG, embedding ve araç çağırmanın nasıl çalıştığını açıklamak
  - Bir AI uygulamasında güven sınırlarını işaretlemek
gorseller:
  - id: e-02-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel memur kılığında, robot kuklanın kucağına dosya taşıyan banda fazladan bir dosya bırakıp göz kırpıyor"
    prompt: "A cozy campus help desk at night. A translucent robot puppet with a glowing mouth sits behind the counter while a mechanical arm fetches folders from a tall filing wall and drops them onto a small conveyor belt leading into the robot's lap; a belt of tiny glowing gadgets hangs from the robot's waist. In the background, the villain disguised in a clerk's visor slides one extra folder onto the conveyor and winks."
---

# Modern AI uygulamaları: RAG, embedding ve ajanlar

> Ayna sadece "bilen" bir model değil; belge arar, araç çağırır, iş yapar. Her yeni yetenek, Veysel için yeni bir **ağız** demek.
> 🎭 **Ses 2:** Ayna'nın beyni küçük; asıl gücü arkasındaki dosya dolabı ve alet çantası.

![Vantrolog Veysel memur kılığında, robot kuklanın kucağına dosya taşıyan banda fazladan bir dosya bırakıp göz kırpıyor](../../gorseller/e-02-a.webp)

## RAG: modele kopya kâğıdı vermek

RAG (*Retrieval-Augmented Generation*): soru gelince uygulama ilgili belgeleri bulur ve **istemin içine yapıştırır**.

```text
soru → belge ara → en ilgili 2–5 parça → [sistem + belgeler + soru] → model → cevap
```

- **Embedding:** metni, anlamını temsil eden bir sayı dizisine (vektör) çevirmek. Benzer anlam → yakın vektör.
- **Vektör veritabanı** (*vector database*): bu vektörler arasında "en yakın" belgeyi arar.

Sonuç: bilgi tabanına giren her belge, bir gün **modelin önüne konan metin** olur.

## Araç çağırma ve ajanlar

Araç çağırma (*tool calling*): model "şu fonksiyonu şu parametreyle çalıştır" diye yapılandırılmış bir istek üretir;
fonksiyonu **uygulama** çalıştırır. Ajan (*agent*): bu döngüyü birkaç adım kendi kendine sürdüren sistem.

| Yetenek | Örnek | Ne ters gidebilir? |
|---|---|---|
| Okuma | Belge arama | Yanlış veya gizli belge getirmek |
| Yazma | E-posta gönderme | İstenmeyen alıcıya veri gitmesi |
| Eylem | Kayıt silme | Geri dönüşü olmayan hata |

## Güven sınırları

Bir AI uygulamasının şemasını çizerken her oka sor: **bu veri nereden geliyor, kim yazmış?**
Güvenilmeyen veri (kullanıcı, belge, web) ile güçlü yetenekler (araçlar, gizli veri) aynı istemde buluşuyorsa,
orası bir güven sınırıdır (*trust boundary*). Saldırılar hep orada olur.

## 🧪 Dene (5 dk)

Ayna'nın oyuncak kopyası `lab/e-ayna-mini.py` ile (yerel Ollama modeli açık olmalı):

```bash
python e-ayna-mini.py --debug -q "Kütüphane kaçta kapanıyor?"
```

Modele giden istemde hangi belgeler var? Biri soruyla ilgisiz mi? Sistem promptunda kaç araç tanımlı?
Uygulamanın akışını beş kutuluk bir şemayla çiz ve güven sınırlarını kırmızıyla işaretle.

## ✅ Akılda kalsın

- RAG, bulunan belgeleri istemin içine yapıştırır.
- Araçları model ister, uygulama çalıştırır.
- Güvenilmeyen veri ile güçlü yeteneğin buluştuğu yer güven sınırıdır.
