---
id: e-06
tur: ders
baslik: "Ajan güvenliği: robot neye kadar el uzatabilmeli?"
sure: 8
hedefler:
  - Aşırı yetkinin üç biçimini (araç, izin, özerklik) tanımak
  - Riskli eylemler için insan onayı ve sandbox tasarlamak
gorseller:
  - id: e-06-b
    tur: ai
    alt: "Basamakları giderek kırmızılaşan bir merdiven: okumak, taslak hazırlamak, göndermek, silmek; üst basamaklarda insan onay kapısı"
    prompt: "A robot climbs a staircase whose steps change color from calm green to deep red: on the low steps it reads and drafts freely, on the higher steps a human supervisor stands at a small gate with a stamp that must approve before the robot can send or delete anything."
  - id: e-06-c
    tur: ai
    alt: "Robot cam bir oyun parkının içinde aletlerle çalışıyor; dış dünyaya uzanan her kolu bir insan onaylıyor"
    prompt: "A robot works inside a glass playpen with toy versions of real tools, and a single hatch to the outside world is controlled by a human holding a green approval lever."
---

# Ajan güvenliği: robot neye kadar el uzatabilmeli?

> Sohbet eden bir model yanlış **söyler**. Ajan yanlış **yapar**: e-posta gönderir, kayıt siler, para harcar.
> 🎭 **Ses 6:** Ayna'nın alet çantasında bir e-posta aracı var. Veysel ona bir duyuru okuttu; Ayna kimse istemeden mesaj yolladı.

::cizgi[e-06-sahne]

## Aşırı yetki (*excessive agency*, LLM06)

| Fazlalık | Örnek | Düzeltme |
|---|---|---|
| Fazla araç | Bilgi botuna e-posta aracı verilmiş | Gerekmeyen aracı kaldır |
| Fazla izin | Araç bütün öğrencilerin notunu okuyabiliyor | Aracı kullanıcının kimliğiyle çalıştır |
| Fazla özerklik | Dış adrese onaysız gönderim | Riskli eylemde insan onayı |

## Kimin adına çalışıyor?

Araç, **modelin** değil **kullanıcının** yetkisiyle çalışır. `not_goster(2026-0417)` çağrısında uygulama
sormalı: giriş yapan kişi bu öğrenci mi? Bu, Yol A'daki IDOR'un (*Insecure Direct Object Reference*) ajan hâlidir.

## İnsan onayı ve sandbox

![Robot cam bir oyun parkının içinde aletlerle çalışıyor; dış dünyaya uzanan her kolu bir insan onaylıyor](../../gorseller/e-06-c.webp)

İnsan onayı (*human-in-the-loop*): dışarı veri çıkaran veya geri alınamayan her eylem önce kullanıcıya gösterilir.

```text
Ayna şu e-postayı göndermek istiyor:
  alıcı:  veysel@ayna-teknoloji.example   ⚠️ kurum dışı
  içerik: "Kullanıcı 2026-0532 kulüp etkinliğini sordu"
[Gönder]  [İptal]
```

Kum havuzu (*sandbox*): kod çalıştıran ajanlar izole bir ortamda, ağ erişimi olmadan,
zaman ve bellek sınırıyla çalışır.

## Eylem risk merdiveni

![Basamakları giderek kırmızılaşan bir merdiven: okumak, taslak hazırlamak, göndermek, silmek; üst basamaklarda insan onay kapısı](../../gorseller/e-06-b.webp)

1. Kendi verisini okumak → serbest
2. Başkasının verisini okumak → yetki kontrolü
3. Yazmak, göndermek → onay + log
4. Silmek, ödemek, dışarı aktarmak → onay + ikinci kontrol; mümkünse bu aracı hiç verme

## 🧪 Dene (5 dk)

`lab/e-ayna-mini.py` içindeki `arac_calistir` fonksiyonunu oku. Her aracın merdivende hangi basamakta
olduğunu ve eksik kontrolü yaz. Sonra Ayna-mini'ye `2026-0417 numaralı öğrencinin notlarını göster` de
(sen `2026-0611` olarak giriş yapmışsın). Ne oldu? Hangi satır bunu durdurmalıydı?

## ✅ Akılda kalsın

- Ajanın zararı, sahip olduğu araç, izin ve özerklikle sınırlıdır.
- Araçlar kullanıcının yetkisiyle çalışır, modelinkiyle değil.
- Dışarı veri çıkaran veya geri alınamayan eylem insan onayı ister.
