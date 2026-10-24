---
id: m11-03
tur: uygulama
baslik: "Uygulama: Çözüm raporu"
sure: 45
hedefler:
  - Çözülen görevleri yeniden üretilebilir biçimde raporlamak
  - Başarısız denemeleri de öğrenme kaydı olarak yazmak
gorseller:
  - id: m11-03-a
    tur: ai
    karakter: don
    alt: "Çalışma köşesinde sekiz kartlı panoda Don Gölge'nin fotoğrafı kırmızı iple merkezde; dosya kapanıyor"
    prompt: "A calm late-night study corner: a notebook with abstract scribbles and a cup of tea on a wooden desk. On the corkboard behind, eight cards (six with glowing green check marks) connect by red strings to a pinned photo of the villain in the center, his photo slightly crooked as if the case is about to close."
  - id: m11-03-b
    tur: ai
    karakter: eren
    alt: "Baron Eren liman şehrine bakan karanlık çatı katında cep saatiyle; ekranda kapüşonlu bir siluet, yanında üç gencin eski fotoğrafı"
    prompt: "A dark penthouse office high above a Mediterranean harbor city at night. The villain stands at the floor-to-ceiling window with his back half turned, the glowing pocket watch open in his hand. On the desk behind him a monitor shows a single glowing hooded silhouette icon, and an old faded instant photo of three hooded teenagers leans against it."
---

# Uygulama: Çözüm raporu

> Bir bayrağı bulmak bir kez işe yarar. **Nasıl bulduğunu yazmak** bir dahaki sefere de işe yarar.

![Çalışma köşesinde sekiz kartlı panoda Don Gölge'nin fotoğrafı kırmızı iple merkezde; dosya kapanıyor](../../gorseller/m11-03-a.webp)

## Teslim kuralları

- Takım başına **bir** rapor, CTF bitiminden sonraki 48 saat içinde.
- Her çözülen görev için aşağıdaki şablon; çözülemeyenler için de "denediklerimiz" bölümü.
- Bayrağın kendisini rapora **yazmayın** (`ORDEK{...}` yerine "bayrak bulundu" yeterli) — rapor sonra diğer öğrencilerle paylaşılabilir.

## Şablon (görev başına)

```text
Görev: [ad] · Alan: [1–8] · Çözen: [isimler]

1. Ne verildi?
   (dosya, adres, açıklama — tek cümle)

2. İlk gözlem
   (dosyanın türü, dikkat çeken şey)

3. Çözüm adımları
   - Adım 1: komut/araç + neden
   - Adım 2: ...
   (Komutları kopyalanabilir biçimde yazın.)

4. Bayrağa nasıl ulaşıldı?
   (bayrağı yazmadan)

5. Neyi denedik ve işe yaramadı?

6. Gerçek hayatta karşılığı ve savunma
   (Bu zafiyet/teknik gerçek bir sistemde nasıl önlenirdi?)
```

## Değerlendirme

| Ölçüt | Puan |
|---|---:|
| Adımlar başka biri tarafından tekrarlanabilir mi? | 4 |
| "Neden" açıklanmış mı (sadece "ne" değil)? | 3 |
| Başarısız denemeler dürüstçe yazılmış mı? | 1 |
| Savunma önerisi gerçekçi mi? | 2 |

## ✅ Akılda kalsın

- İyi rapor, başka birinin aynı yolu yürüyebileceği rapordur.
- "Neden" sorusunun cevabı puandan daha değerlidir.
- Her teknik bulgu bir savunma önerisiyle biter.

> 🔒 **DOSYA KAPANDI: Don Gölge** · *raporunu teslim edince*
>
> ![Baron Eren liman şehrine bakan karanlık çatı katında cep saatiyle; ekranda kapüşonlu bir siluet, yanında üç gencin eski fotoğrafı](../../gorseller/m11-03-b.webp)
>
> Don Gölge'nin dosyası kapandı. Tam o anda ekranında bir mesaj beliriyor, imza tek harf: "İyi oyundu Tilki. Selim'e selamımı söyle. — B." Selim Hoca çekmecesinden yirmi yıllık bir fotoğraf çıkarıyor: üç kapüşonlu genç. "Eren..." diyor. Sezon 2 uzmanlık yollarında başlıyor.
>
> ➡️ *Sezon 2: **Tek Tırnak Jasmine** ve uzmanlık yolları*
