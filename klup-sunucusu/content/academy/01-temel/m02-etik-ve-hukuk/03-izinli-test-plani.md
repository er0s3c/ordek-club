---
id: m02-03
tur: ders
baslik: İzinli bir test nasıl planlanır?
sure: 6
hedefler:
  - Bir güvenlik testinin kapsamını tanımlamak
  - Yazılı izinde bulunması gerekenleri saymak
gorseller:
  - id: m02-03-b
    tur: ai
    alt: "Masada açık bir izin dosyası; etrafında yedi nesne: iki el sıkışması, yeşil çizgiyle çevrili bina maketi, kırmızı bantlı odalar, kum saati, alet çantası, yasak işaretli çekiç ve kırmızı telefon"
    prompt: "An open permission folder lying on a desk under a green banker's lamp, surrounded by seven neatly arranged objects: two hands shaking above the folder, a small building model outlined by a glowing green boundary line, a few model rooms wrapped in red tape, an hourglass, an open toolbox with careful tools, a sledgehammer under a red prohibition circle, and a red emergency telephone."
---

# İzinli bir test nasıl planlanır?

> İyi bir test, ilk komuttan **önce** başlar: kağıt üzerinde.
> Profesyoneller buna *Rules of Engagement* (çalışma kuralları) der.

::cizgi[m02-03-sahne]

## Yazılı iznin 7 parçası

![Masada açık bir izin dosyası; etrafında yedi nesne: iki el sıkışması, yeşil çizgiyle çevrili bina maketi, kırmızı bantlı odalar, kum saati, alet çantası, yasak işaretli çekiç ve kırmızı telefon](../../gorseller/m02-03-b.webp)

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
