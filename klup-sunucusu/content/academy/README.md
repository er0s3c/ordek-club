# Ördek Akademi — İçerik Rehberi

Bu klasör, Club Academy'deki ders sayfalarının **kaynağıdır**. Her `.md` dosyası bir sayfadır.
Platform (Faz 3) bu dosyaları içe aktarır; GitHub'da da okunabilir durumdadırlar.

```
content/academy/
├── 00-program/      Akademi hakkında: program, seviyeler, kurallar, takvim, etkinlikler
├── 01-temel/        Kısım I — ortak temel (M01–M11), herkes için zorunlu
├── 02-uzmanlik/     Kısım II — uzmanlık yolları (A–G)
├── gorseller/       Görseller buraya gelir (dosya adı = görsel kimliği)
├── akademi.yaml     Yolların sırası, başlıkları ve klasörleri (platform içe aktarıcısı okur)
├── karakterler.yaml Gölge Ağ Ailesi — modül kötü adamlarının TEK kaynağı
├── KARAKTERLER.md   Karakter kitabı (OTOMATİK üretilir)
└── GORSELLER.md     Yapılacak görseller listesi (OTOMATİK üretilir, elle düzenlemeyin)
```

## Platforma aktarma

Dersler platformda **/academy** altında görünür. İçerik değişince:

1. `npm run academy:check` — yazım kurallarını doğrula (hata olmamalı).
2. `npm run cli academy-import` — veritabanına aktar (ya da **Yönetim → Akademi → İçeriği şimdi içe aktar**).
   Docker konteyneri her başladığında bunu kendiliğinden yapar.

Sayfa kimliği (`id`) öğrencinin ilerlemesinin anahtarıdır: **yayınlanmış bir sayfanın id'si değiştirilmez.**
Kaldırılan sayfa silinmez, arşivlenir. Yeni bir yol eklemek için klasörü oluşturup `akademi.yaml`'a satır ekle.

## Yazım kuralları — öğrenciyi sıkmamak için

| Kural | Neden |
|---|---|
| Sayfa başına **en fazla ~350 kelime** (doğrulayıcı 450'de uyarır) | 5–8 dakikada bitsin |
| Her sayfa **bir soruya** cevap verir | Başlık bir soru ya da net bir vaattir |
| Önce **neden**, sonra **ne**, en son **nasıl** | Merak → bilgi → beceri |
| Paragraf en fazla 3 satır; liste tercih edilir | Ekranda taranabilir |
| Her sayfada **en az bir görsel** veya animasyon | Görsel hafıza |
| Her sayfa **🧪 Dene** ile biter (2–5 dk) | Okumak değil, yapmak |
| Sonda **✅ Akılda kalsın**: tam 3 madde | Tekrar için |
| Terim ilk geçtiğinde İngilizcesi parantez içinde | İki dilli sözlük |
| Komutlar ekran görüntüsü değil **kod bloğu** | Kopyalanabilir, aranabilir |

## Sayfa biçimi

```markdown
---
id: m04-02                    # benzersiz; dosya adı ile aynı numara
baslik: Dosyalar nerede saklanır?
sure: 7                       # dakika
hedefler:
  - Linux dizin yapısını tanımak
gorseller:
  - id: m04-02-a
    tur: ai                   # ai | ekran
    karakter: sadri           # sahnedeki kötü adam (karakterler.yaml id'si) ya da grup için "aile"
    alt: Ekran okuyucu için kısa açıklama
    prompt: "…"               # tur: ai → İngilizce üretim komutu
  - id: m04-02-b
    tur: ekran
    alt: …
    nasil: "…"                # tur: ekran → neyin, nasıl çekileceği
---

# Başlık

> **Neden önemli?** Bir–iki cümlelik kanca.

![Ters dönmüş klasör ağacının kökünde oturan Süper Kullanıcı Sadri elinde budama makasıyla](../../gorseller/m04-02-a.webp)

::animasyon[tcp-handshake]     ← platformdaki 15 hazır animasyondan biri
```

`::animasyon[...]` satırı, canlı derste kullanılan animasyonların aynısını sayfaya yerleştirir;
böylece birçok yerde ayrı görsele gerek kalmaz.

## Görseller

İki tür görsel var:

- 🎨 **AI görseli** — kavramları anlatan illüstrasyonlar. `prompt` alanındaki İngilizce komutu
  kullanın (Midjourney, DALL·E, Ideogram, Firefly vb.).
- 📸 **Ekran görüntüsü** — gerçek bir arayüzü gösterir (Windows Güvenlik, Wireshark, tarayıcı araçları…).
  `nasil` alanında neyin, nasıl çekileceği yazar.

Tam liste ve durum: **[GORSELLER.md](GORSELLER.md)** (`npm run academy:gorseller` ile yeniden üretilir).

### AI görsel stili — noir mafya + hacker

Sayfadaki `prompt` yalnızca **sahneyi** anlatır ve kötü adamdan "the villain" (grup için "the family")
diye söz eder. GORSELLER.md üretilirken karakterin görsel tarifi ve aşağıdaki stil eki **otomatik eklenir** —
listeden kopyaladığınız prompt tamdır.

- **Karakterler — Gölge Ağ Ailesi:** her modülün bir **kötü adamı** var (M01 Tatlı Dil Tevfik … M11 Don Gölge);
  ailenin en büyüğü **Baron Eren** (ve genç, kapüşonlu hâli), Sezon 2'yi açan **Tek Tırnak Jasmine**.
  Kimlik kartları, paletler, ilişkiler ve portre promptları: **[KARAKTERLER.md](KARAKTERLER.md)**.
- **Midjourney:** promptlar Midjourney'ye hazırdır (`--ar 16:9 --v 7 --no …`). Önce portreleri üretin,
  sahnelerde portreyi **Omni Reference** olarak verin ki yüz ve kıyafet her görselde aynı kalsın.
- **Her bölümün sahnesi:** temel modüllerdeki her sayfada kötü adamın o konudaki hamlesini gösteren bir sahne bulunur
  (doğrulayıcı kontrol eder).
- **Stil:** yarı-karikatür noir çizgi roman; ~5 kafa boyu, net silüet, kalın dış kontur + incelen iç çizgiler,
  sert cel gölgeler, camgöbeği-yeşil gölge ve kehribar ışık, 1940'lar mafya kıyafeti + parlayan terminaller, 16:9.
- **Renkler:** sıcak eskitilmiş palet — antrasit-kahve zemin (#14110F), bordo (#8F1D24), kehribar (#C9953B),
  hacker yeşili (#5FD3A7).
- **Asla:** görsel içinde yazı/harf (AI Türkçe yazıyı bozar — yazıyı sayfa verir), gerçek marka logosu,
  gerçek kişi yüzü veya benzerliği, gerçek kurum adı, stüdyo/sanatçı/ticari oyun adı. Kadın karakterler
  cinselleştirilmez; şiddet gösterilmez — kötü adamlar komik ve **alt edilecek** figürlerdir.
- **Hikâye — Gölge Ağ, Sezon 1:** her modül bir bölümdür. İlk sayfadaki `🕴️ DOSYA` kutusu kötü adamı ve
  `📼 Bölüm` girişini, son sayfadaki `🔒 DOSYA KAPANDI` kutusu bir sonraki kötü adama giden ipucunu verir.
  Metinler `karakterler.yaml` → `hikaye` altında; öğrenciye anlatılan hâli [00-program/09-golge-ag.md](00-program/09-golge-ag.md).
  Öğrenci hikâyede asla saldırmaz: izinle savunur, delil toplar, yetkililere teslim eder.

### Ekran görüntüsü kuralları

1. **1600×900** (veya 16:9 başka bir boyut), mümkünse koyu tema.
2. Yalnızca ilgili alanı kırpın; önemli yeri **kehribar (#C9953B) dikdörtgen veya ok** ile işaretleyin.
3. **Kişisel veri olmasın:** gerçek kullanıcı adı, e-posta, IP, Wi-Fi adı, kampüs sistemleri görünmesin.
   Test hesabı / laboratuvar sanal makinesi kullanın, gerekirse bulanıklaştırın.
4. Gerçek bir kurumun sistemini değil, kendi bilgisayarınızı veya laboratuvarı kullanın.

### Görselleri gönderme

Dosya adı = görsel kimliği: `m04-02-a.png` (PNG/JPG/WebP fark etmez). Toplu gönderebilirsiniz;
ben `gorseller/` klasörüne WebP olarak yerleştirir, GORSELLER.md'de durumu "hazır" yaparım.

## İçerik ve telif politikası

- Açıklamalar, örnekler, quizler ve senaryolar **özgün** yazılır; üçüncü taraf ders materyali kopyalanmaz.
- Kurgusal kurum/kişi adları kullanılır; gerçek bir üniversiteyi veya kişiyi taklit eden içerik olmaz.
- Kaynaklar **İleri kaynaklar** bölümünde belirtilir.
- Hukuk sayfalarındaki yasa bilgisi özet niteliğindedir; **eğitmen güncel yasa metnini kontrol eder**.
- Bu klasör herkese açık repoda durduğu için buradaki alıştırma quizlerinin cevapları da açıktır.
  **Not verilen** quizler (değerlendirmenin %20'si) yönetim panelinden ayrı soru havuzuyla hazırlanmalıdır.
