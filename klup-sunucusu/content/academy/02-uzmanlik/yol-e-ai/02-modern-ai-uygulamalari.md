---
id: e-02
tur: ders
baslik: "Modern AI uygulamaları: RAG, embedding ve ajanlar"
sure: 8
hedefler:
  - RAG, embedding ve araç çağırmanın nasıl çalıştığını açıklamak
  - Bir AI uygulamasında güven sınırlarını işaretlemek
gorseller:
  - id: e-02-b
    tur: ai
    alt: "Robot cevap vermeden önce kütüphaneden ilgili üç kartı çekip okuyor"
    prompt: "A robot at a library desk pulls three relevant index cards from a huge card catalog with glowing threads that match the question, reads them, and only then turns to answer a waiting student."
  - id: e-02-c
    tur: ai
    alt: "Robotun belinde takvim, posta kutusu ve hesap makinesi gibi aletler asılı bir kemer"
    prompt: "A robot wearing a utility belt with small tools hanging from it, a calendar, a mailbox, a calculator and a door key, reaching for one tool while a student watches carefully from behind a counter."
---

# Modern AI uygulamaları: RAG, embedding ve ajanlar

> Ayna sadece "bilen" bir model değil; belge arar, araç çağırır, iş yapar. Her yeni yetenek, Veysel için yeni bir **ağız** demek.
> 🎭 **Ses 2:** Ayna'nın beyni küçük; asıl gücü arkasındaki dosya dolabı ve alet çantası.

::cizgi[e-02-sahne]

## RAG: modele kopya kâğıdı vermek

![Robot cevap vermeden önce kütüphaneden ilgili üç kartı çekip okuyor](../../gorseller/e-02-b.webp)

RAG (*Retrieval-Augmented Generation*): soru gelince uygulama ilgili belgeleri bulur ve **istemin içine yapıştırır**.

```text
soru → belge ara → en ilgili 2–5 parça → [sistem + belgeler + soru] → model → cevap
```

- **Embedding:** metni, anlamını temsil eden bir sayı dizisine (vektör) çevirmek. Benzer anlam → yakın vektör.
- **Vektör veritabanı** (*vector database*): bu vektörler arasında "en yakın" belgeyi arar.

Sonuç: bilgi tabanına giren her belge, bir gün **modelin önüne konan metin** olur.

## Araç çağırma ve ajanlar

![Robotun belinde takvim, posta kutusu ve hesap makinesi gibi aletler asılı bir kemer](../../gorseller/e-02-c.webp)

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
