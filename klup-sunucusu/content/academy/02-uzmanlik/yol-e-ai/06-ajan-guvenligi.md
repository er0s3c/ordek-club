---
id: e-06
tur: ders
baslik: "Ajan güvenliği: robot neye kadar el uzatabilmeli?"
sure: 8
hedefler:
  - Aşırı yetkinin üç biçimini (araç, izin, özerklik) tanımak
  - Riskli eylemler için insan onayı ve sandbox tasarlamak
gorseller:
  - id: e-06-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel yüksek bir sahne köprüsünden, kollarıyla bütün kollara uzanan robot kuklayı parlayan iplerle orkestra şefi gibi yönetiyor"
    prompt: "A theater backstage packed with brass levers, pulleys, ropes and big switches. A translucent robot puppet with many long extendable arms reaches toward every lever at once, one arm already pulling a big glowing red switch. Above, the villain sits comfortably on a high catwalk, guiding the puppet's arms with glowing green strings like an orchestra conductor."
---

# Ajan güvenliği: robot neye kadar el uzatabilmeli?

> Sohbet eden bir model yanlış **söyler**. Ajan yanlış **yapar**: e-posta gönderir, kayıt siler, para harcar.
> 🎭 **Ses 6:** Ayna'nın alet çantasında bir e-posta aracı var. Veysel ona bir duyuru okuttu; Ayna kimse istemeden mesaj yolladı.

![Vantrolog Veysel yüksek bir sahne köprüsünden, kollarıyla bütün kollara uzanan robot kuklayı parlayan iplerle orkestra şefi gibi yönetiyor](../../gorseller/e-06-a.webp)

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
