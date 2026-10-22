---
id: a-03
tur: ders
baslik: "Erişim kontrolü ve IDOR: başkasının verisini görebiliyor muyum?"
sure: 7
hedefler:
  - IDOR açığını ve yatay/dikey yetki yükseltmeyi açıklamak
  - İki hesapla erişim kontrolünü test etmek
gorseller:
  - id: a-03-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine otel koridorunda anahtar etiketindeki numarayı kalemiyle değiştirip yan odanın kapısını açıyor"
    prompt: "A long dim hotel corridor with numbered brass doors. The villain stands in front of a door holding a room key tag, calmly redrawing the number on the tag with her fountain pen, and the neighboring door swings open by itself revealing shelves of glowing student files inside."
---

# Erişim kontrolü ve IDOR: başkasının verisini görebiliyor muyum?

> Giriş doğru olabilir; asıl soru **"bu veri senin mi?"** sorusunun sorulup sorulmadığıdır.
> 🗂️ **Çekmece 3:** Portalda not kartı adresi `/notlar/1001`. Jasmine'in aklındaki sayı: 1002.

![Tek Tırnak Jasmine otel koridorunda anahtar etiketindeki numarayı kalemiyle değiştirip yan odanın kapısını açıyor](../../gorseller/a-03-a.webp)

## IDOR nedir?

**Insecure Direct Object Reference:** Sunucu, istenen nesnenin (not, sepet, fatura) isteyen kişiye
ait olup olmadığını kontrol etmez. Kimliği değiştir → başkasının verisi gelir.

```http
GET /api/notlar/1001   → senin notların   ✅
GET /api/notlar/1002   → başkasının notları ❌ (ama sunucu veriyor)
```

## İki yön

| Tür | Örnek |
|---|---|
| **Yatay** | Öğrenci A, öğrenci B'nin verisini görür |
| **Dikey** | Öğrenci, yalnızca yöneticinin yapabileceği işi yapar (`/admin/kullanici-sil`) |

## Nasıl test edilir?

1. Laboratuvarda **iki test hesabı** aç: A ve B.
2. A ile bir istek yap (ör. sepetini görüntüle), Repeater'a gönder.
3. Aynı isteği **B'nin oturumuyla** ya da A'nın oturumunda B'nin kimliğiyle tekrarla.
4. Yanıt değişmiyorsa ya da B'nin verisi geliyorsa: bulgu.

Kimlik yalnızca URL'de değil; JSON gövdede, çerezde, gizli form alanında da olabilir.

## Savunma

- Sunucu **her istekte** sahipliği kontrol eder: `WHERE id = ? AND sahip_id = oturumdaki_kullanici`.
- Tahmin edilemez kimlikler (UUID) zorlaştırır ama **tek başına çözüm değildir**.
- Yetki kuralları tek bir yerde toplanır, her uç noktada otomatik uygulanır.

## 🧪 Dene (5 dk)

Yerel Juice Shop'ta hesap aç, sepete bir ürün ekle. Burp'te `/rest/basket/<sayı>` isteğini bul,
Repeater'da sayıyı bir azalt ve gönder. Kimin sepetini gördün? Sunucu neyi kontrol etmeliydi?

## ✅ Akılda kalsın

- IDOR = sunucu "bu senin mi?" diye sormuyor.
- İki hesapla test et: A'nın isteğini B'nin gözüyle tekrarla.
- Rastgele kimlik yardımcıdır; asıl çözüm her istekte sahiplik kontrolüdür.
