---
id: a-03
tur: ders
baslik: "Erişim kontrolü ve IDOR: başkasının verisini görebiliyor muyum?"
sure: 7
hedefler:
  - IDOR açığını ve yatay/dikey yetki yükseltmeyi açıklamak
  - İki hesapla erişim kontrolünü test etmek
gorseller:
  - id: a-03-b
    tur: ai
    alt: "Otel koridorunda yatay geçiş (yan odaya girmek) ve dikey geçiş (asansörle yönetici katına çıkmak)"
    prompt: "A hotel cross-section: on one floor a guest uses their key on the neighbor's door and it opens, shown with a sideways arrow of light; in the center an elevator carries the same guest up to a penthouse manager office marked by a golden crown, shown with an upward arrow of light. Both doors should have stayed locked."
---

# Erişim kontrolü ve IDOR: başkasının verisini görebiliyor muyum?

> Giriş doğru olabilir; asıl soru **"bu veri senin mi?"** sorusunun sorulup sorulmadığıdır.
> 🗂️ **Çekmece 3:** Portalda not kartı adresi `/notlar/1001`. Jasmine'in aklındaki sayı: 1002.

::cizgi[a-03-sahne]

## IDOR nedir?

**Insecure Direct Object Reference:** Sunucu, istenen nesnenin (not, sepet, fatura) isteyen kişiye
ait olup olmadığını kontrol etmez. Kimliği değiştir → başkasının verisi gelir.

```http
GET /api/notlar/1001   → senin notların   ✅
GET /api/notlar/1002   → başkasının notları ❌ (ama sunucu veriyor)
```

## İki yön

![Otel koridorunda yatay geçiş (yan odaya girmek) ve dikey geçiş (asansörle yönetici katına çıkmak)](../../gorseller/a-03-b.webp)

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
