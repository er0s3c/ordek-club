---
id: m07-01
tur: ders
baslik: Neden bir güvenlikçi kod yazar?
sure: 7
hedefler:
  - Algoritma mantığını adım adım düşünmek
  - Python'u çalıştırmak ve değişken/veri tiplerini kullanmak
gorseller:
  - id: m07-01-a
    tur: ai
    karakter: orhan
    alt: "Fütüristik mutfakta Kuklacı Orhan robot kolu ipleriyle yönetip tarife yabancı bir malzeme ekletiyor"
    prompt: "A small futuristic kitchen where a friendly robot arm follows a recipe card covered only with simple abstract shapes and dots. From above, the villain controls the robot arm with glowing marionette strings, making it pour a suspicious glowing green ingredient into the pot."
---

# Neden bir güvenlikçi kod yazar?

> 10.000 satırlık bir logda başarısız girişleri elle sayarsan bir saat sürer.
> 6 satırlık bir Python programı bunu **bir saniyede** yapar.

![Fütüristik mutfakta Kuklacı Orhan robot kolu ipleriyle yönetip tarife yabancı bir malzeme ekletiyor](../../gorseller/m07-01-a.webp)

> 🕴️ **DOSYA: Kuklacı Orhan** · *Bot Ustası*
>
> ![Kuklacı Orhan — Bot Ustası](../../gorseller/karakter-orhan.webp)
>
> 📼 **Bölüm 7 — İpler.** Kampüs ağında binlerce küçük cihaz aynı anda aynı kapıyı yokluyor: Kuklacı Orhan'ın botları. Orhan kodu ustasından öğrendi; adı hiç anılmayan, tek bir tırnakla kapı açan birinden.
>
> **Tehdit:** Botnet'ler, kötü niyetli script'ler, koda gömülü anahtarlar, eval/komut enjeksiyonu. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

## Algoritma = tarif

Bilgisayar tahmin etmez; **adım adım** ne yapacağını söylersin.

> Görev: "Log dosyasında kaç başarısız giriş var?"
> 1. Dosyayı aç. 2. Her satırı oku. 3. Satırda "Failed" varsa sayacı 1 artır. 4. Sonunda sayacı yazdır.

Önce Türkçe adımları yaz, sonra koda çevir. Bu alışkanlık her şeyi kolaylaştırır.

## İlk Python

Kurulum: [python.org](https://www.python.org/downloads/) (Windows'ta "Add to PATH" işaretle) veya laboratuvar VM'inde hazır.

```bash
python3 --version
python3 merhaba.py
```

```python
# merhaba.py
isim = "Deniz"          # str  (metin)
hafta = 8               # int  (tam sayı)
ortalama = 87.5         # float (ondalık)
aktif = True            # bool (doğru/yanlış)

print(f"Merhaba {isim}, Akademi'de {hafta}. haftadasın!")
print(type(ortalama))
```

`f"..."` içinde süslü parantezle değişkenleri metne koyarsın.

## Etkileşimli deneme

Terminalde sadece `python3` yazarsan bir **etkileşimli kabuk** açılır; her satırı anında dener:

```python
>>> 2 ** 10
1024
>>> "parola" * 3
'parolaparolaparola'
>>> len("ordek-club")
10
```

Çıkmak için `exit()`.

## 🧪 Dene (4 dk)

Bir program yaz: adını, bölümünü ve en sevdiğin dersi değişkene koysun ve tek bir cümle yazdırsın.

## ✅ Akılda kalsın

- Önce adımları Türkçe yaz, sonra kodla.
- Temel tipler: `str`, `int`, `float`, `bool`.
- `f"...{degisken}..."` ile metin oluştur.
