---
id: m11-03
tur: uygulama
baslik: "Uygulama: Çözüm raporu"
sure: 45
hedefler:
  - Çözülen görevleri yeniden üretilebilir biçimde raporlamak
  - Başarısız denemeleri de öğrenme kaydı olarak yazmak
---

# Uygulama: Çözüm raporu

> Bir bayrağı bulmak bir kez işe yarar. **Nasıl bulduğunu yazmak** bir dahaki sefere de işe yarar.

::cizgi[m11-03-sahne]

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
> ::cizgi[don-kapanis]
>
> ➡️ *Sezon 2: **Tek Tırnak Jasmine** ve uzmanlık yolları*
