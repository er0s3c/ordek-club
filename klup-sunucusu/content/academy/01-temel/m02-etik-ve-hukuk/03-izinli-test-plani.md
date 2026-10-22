---
id: m02-03
tur: ders
baslik: İzinli bir test nasıl planlanır?
sure: 6
hedefler:
  - Bir güvenlik testinin kapsamını tanımlamak
  - Yazılı izinde bulunması gerekenleri saymak
gorseller:
  - id: m02-03-a
    tur: ai
    karakter: kemal
    alt: "Avukat Kemal, test kapsamını gösteren planda yasak odaların içinden kendi kesik çizgisini çiziyor"
    prompt: "A large blueprint of a fictional office building on a desk: some rooms outlined with glowing green borders, others shaded red and crossed out. The villain uses his fountain pen to draw his own dotted line straight through the forbidden red rooms, smirking."
---

# İzinli bir test nasıl planlanır?

> İyi bir test, ilk komuttan **önce** başlar: kağıt üzerinde.
> Profesyoneller buna *Rules of Engagement* (çalışma kuralları) der.

![Avukat Kemal, test kapsamını gösteren planda yasak odaların içinden kendi kesik çizgisini çiziyor](../../gorseller/m02-03-a.webp)

## Yazılı iznin 7 parçası

| Parça | Örnek |
|---|---|
| **Taraflar** | Sistemin sahibi ve test eden kişi/ekip, imzalarıyla |
| **Kapsam** | `test.kuzeykiyi.edu.example` — yalnızca bu adres |
| **Kapsam dışı** | E-posta sunucusu, öğrenci portalı, fiziksel binalar |
| **Zaman** | 3–5 Mart, 09:00–17:00 |
| **İzinli yöntemler** | Web uygulaması testi, manuel inceleme |
| **Yasaklı faaliyetler** | Hizmeti durdurma, veri silme, sosyal mühendislik |
| **İletişim** | Acil durumda aranacak kişi ve testi durdurma prosedürü |

## Yasaklı faaliyetler neden önemli?

Kapsam içinde bile her şey serbest değildir. En sık yasaklananlar:

- Sistemi yavaşlatan veya durduran testler (DoS)
- Gerçek kullanıcı verisini indirmek, saklamak
- Çalışanları kandırmaya yönelik deneme (ayrıca izin istemedikçe)
- Bulunan açığı kanıttan öteye götürmek

## Bir şey ters giderse?

**Dur, belgele, bildir.** Testi hemen durdur, ne yaptığını saatiyle not al ve iletişim kişisini ara.
Saklamaya çalışmak durumu her zaman kötüleştirir.

## 🧪 Dene (4 dk)

Tablodaki örneğe göre: test sırasında öğrenci portalının giriş sayfasında bir hata fark ettin.
Ne yaparsın?

<details><summary>Cevap</summary>Portal kapsam dışı: dokunma, test etme. Gözlemini not al ve iletişim kişisine bildir; kapsama eklenip eklenmeyeceğine sistem sahibi karar verir.</details>

## ✅ Akılda kalsın

- Test kağıt üzerinde başlar: kapsam, zaman, yöntem, yasaklar.
- Kapsam dışına "küçük bir bakış" bile ihlaldir.
- Sorun çıkarsa: dur, belgele, bildir.
