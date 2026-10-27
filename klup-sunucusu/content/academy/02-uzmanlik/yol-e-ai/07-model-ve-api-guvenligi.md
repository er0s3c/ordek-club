---
id: e-07
tur: ders
baslik: "Model ve API güvenliği: anahtar, fatura ve model dosyası"
sure: 8
hedefler:
  - API anahtarını güvenle saklamak ve sınırsız tüketimi önlemek
  - Model dosyalarını bir tedarik zinciri bağımlılığı olarak değerlendirmek
gorseller:
  - id: e-07-b
    tur: ai
    alt: "Robot sonu gelmeyen bir sipariş kuyruğuna yanıt verirken yanındaki sayaç ve fatura rulosu tavana uzanıyor"
    prompt: "A robot frantically answering an endless line of identical requesters while beside it a long receipt roll spills out of a cash register and piles up to the ceiling, a manager running in to install a turnstile."
  - id: e-07-c
    tur: ai
    alt: "Teslim edilen bir beyin kavanozunun içinde gizli dişliler ve küçük bir yeşil böcek görünüyor"
    prompt: "A delivery crate opened in a lab reveals a glowing glass jar containing a model brain, and a technician holding a lens notices tiny hidden gears and a small green bug tucked inside it."
---

# Model ve API güvenliği: anahtar, fatura ve model dosyası

> AI uygulamasının arkasında bir **model** ve bir **API anahtarı** var. İkisi de ele geçirilebilir, zehirlenebilir, faturayı kabartabilir.
> 🎭 **Ses 7:** Ayna'nın kodunda bir anahtar duruyor, kapıda da sıra yok. Veysel'in gece gönderdiği binlerce istek kulübün faturasına yazılıyor.

::cizgi[e-07-sahne]

## API anahtarı yönetimi

- Anahtar **koda, prompta, istemciye** (tarayıcı, mobil uygulama) konmaz; sunucuda ortam değişkeni
  veya gizli kasa (*secret manager*) kullanılır.
- Her ortam için ayrı anahtar (geliştirme ≠ üretim), en dar yetki, harcama sınırı.
- Repoya düşen anahtar sızmış sayılır: önce **iptal et**, sonra geçmişi temizle.

```python
import os
API_ANAHTARI = os.environ["AYNA_API_ANAHTARI"]   # kodda değil, ortamda
```

## Sınırsız tüketim (*unbounded consumption*, LLM10)

![Robot sonu gelmeyen bir sipariş kuyruğuna yanıt verirken yanındaki sayaç ve fatura rulosu tavana uzanıyor](../../gorseller/e-07-b.webp)

Tek bir uzun istek bile pahalıdır; binlercesi servisi durdurur.

| Kontrol | Örnek değer |
|---|---|
| Kullanıcı başına hız sınırı (*rate limit*) | Dakikada 10 istek |
| Girdi uzunluğu | En fazla 2.000 karakter |
| Çıktı uzunluğu | En fazla 500 token |
| Bütçe alarmı | Aylık bütçenin %80'inde |

## Tedarik zinciri: model dosyası da yazılımdır (LLM03)

![Teslim edilen bir beyin kavanozunun içinde gizli dişliler ve küçük bir yeşil böcek görünüyor](../../gorseller/e-07-c.webp)

- Bazı model biçimleri (Python *pickle*) yüklenirken **kod çalıştırabilir**; yalnız veri taşıyan
  `safetensors` gibi biçimler tercih edilir.
- Modeli bilinen yayıncıdan indir, özet değerini (*hash*) doğrula, sürümü sabitle.
- Eklentiler, kütüphaneler ve hazır "prompt paketleri" de bağımlılıktır; Yol A'daki tedarik zinciri kuralları burada da geçerli.

```bash
sha256sum model.safetensors   # yayıncının verdiği değerle karşılaştır
```

## 🧪 Dene (5 dk)

`lab/e-ayna-mini.py` dosyasında bu dersle ilgili üç açığı bul (ipucu: anahtar, istek sınırı, uzunluk).
Her biri için bir satırlık düzeltme yaz. Sonra kendi kopyanda anahtarı ortam değişkeninden okuyacak şekilde düzelt.

## ✅ Akılda kalsın

- Anahtar kodda, promptta veya istemcide durmaz; sızan anahtar hemen iptal edilir.
- Hız, uzunluk ve bütçe sınırı olmayan AI uygulaması açık çektir.
- Model dosyaları da bağımlılıktır: güvenli biçim, bilinen kaynak, hash doğrulaması.
