---
id: m06-06
tur: uygulama
baslik: "Uygulama: Tarayıcının arkasında ne var?"
sure: 30
hedefler:
  - Bir web sayfasının ağ isteklerini geliştirici araçlarıyla incelemek
  - İstemci ve sunucu tarafı bileşenleri ayırt etmek
gorseller:
  - id: m06-06-a
    tur: ekran
    alt: Ördek Lab eğitim uygulamasının Network sekmesinde Fetch/XHR filtresi ve bir JSON yanıtının Preview görünümü
    nasil: "Yerel Ördek Lab (veya Ördek Club) uygulamasını açın, giriş yapın → F12 → Network → 'Fetch/XHR' filtresi → sayfada bir işlem yapın. JSON dönen bir isteği seçip sağdaki 'Preview' sekmesini açın. 'Fetch/XHR' düğmesini ve JSON önizlemesini kehribar (#C9953B) çerçeveyle işaretleyin. Gerçek kişisel veri görünmemeli; test hesabı kullanın."
  - id: m06-06-b
    tur: ai
    karakter: celal
    alt: "Odaları açılmış dev tarayıcı evinde Çerezci Celal çerez kavanozuna uzanıyor; dışarıdan bir öğrenci büyüteçle izliyor"
    prompt: "A giant web browser drawn as an open dollhouse with rooms: a network room full of flying envelopes, a storage room with a big glass cookie jar, and a console room with a glowing terminal. The villain tiptoes into the storage room reaching for the cookie jar, while outside a student with a magnifying glass inspects every room."
---

# Uygulama: Tarayıcının arkasında ne var?

> Laboratuvardaki eğitim uygulamasını hiç dokunmadan, yalnızca **izleyerek** tanı.
> Bu, her web güvenliği testinin ilk adımıdır: keşif.

![Odaları açılmış dev tarayıcı evinde Çerezci Celal çerez kavanozuna uzanıyor; dışarıdan bir öğrenci büyüteçle izliyor](../../gorseller/m06-06-b.webp)

## Ortam

Ördek Lab'deki eğitim uygulaması (laboratuvar adresi eğitmen tarafından verilir).
Test hesabıyla giriş yap. **Bu görevde hiçbir isteği değiştirmiyorsun** — sadece gözlemliyorsun.

![Fetch/XHR ve JSON önizlemesi](../../gorseller/m06-06-a.webp)

## Görev

F12 → **Network** açıkken uygulamada gezin ve şu tabloyu doldur:

| # | Soru | Cevabın |
|---|---|---|
| 1 | Giriş yaparken giden istek hangi **yöntem** ve **adres**? | |
| 2 | Giriş başarılı olunca sunucu hangi **çerezi** bıraktı? HttpOnly/Secure var mı? | |
| 3 | Sayfadaki verileri getiren bir **API isteği** bul. Adresi ve döndürdüğü JSON alanları? | |
| 4 | Yanıtlarda hangi **güvenlik başlıkları** var, hangileri eksik? | |
| 5 | Hangi istekler **4xx/5xx** döndü? Neden olabilir? | |
| 6 | Sayfada çalışan JavaScript dosyalarının kaç tanesi **başka bir alan adından** geliyor? | |

## Teslim

Tabloyu ve bir paragraf yorum: *"Bu uygulamada bir saldırgan olsaydım, ilk nereye bakardım ve neden?"*

<details><summary>Değerlendirme notu</summary>Doğru cevap tek değildir. İyi yorumlar şunlara dikkat çeker: kimlik numarası içeren API adresleri (yetkilendirme kontrolü), eksik güvenlik başlıkları, HttpOnly olmayan çerezler, ayrıntılı hata mesajları.</details>

## ✅ Akılda kalsın

- Keşif = dokunmadan izlemek; her testin ilk adımı.
- Network sekmesi bir uygulamanın bütün konuşmalarını gösterir.
- Kimlik numarası taşıyan API adresleri yetkilendirme sorusunu doğurur.
