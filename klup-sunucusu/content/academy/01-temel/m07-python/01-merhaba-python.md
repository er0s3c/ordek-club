---
id: m07-01
tur: ders
baslik: Neden bir güvenlikçi kod yazar?
sure: 7
hedefler:
  - Algoritma mantığını adım adım düşünmek
  - Python'u çalıştırmak ve değişken/veri tiplerini kullanmak
gorseller:
  - id: m07-01-b
    tur: ai
    alt: "Mutfak tezgâhında adım adım tarif kartları ve onları sırayla uygulayan küçük bir robot aşçı"
    prompt: "A cozy kitchen counter with a row of recipe cards pinned in order on a string above it, each card showing a simple picture step, and a small friendly robot chef following them one by one: cracking an egg, stirring, pouring into a pan, and serving."
---

# Neden bir güvenlikçi kod yazar?

> 10.000 satırlık bir logda başarısız girişleri elle sayarsan bir saat sürer.
> 6 satırlık bir Python programı bunu **bir saniyede** yapar.

::cizgi[m07-01-sahne]

> 🕴️ **DOSYA: Kuklacı Orhan** · *Bot Ustası*
>
> ![Kuklacı Orhan — Bot Ustası](../../gorseller/karakter-orhan.webp)
>
> **Tehdit:** Botnet'ler, kötü niyetli script'ler, koda gömülü anahtarlar, eval/komut enjeksiyonu. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[orhan-acilis]

## Algoritma = tarif

![Mutfak tezgâhında adım adım tarif kartları ve onları sırayla uygulayan küçük bir robot aşçı](../../gorseller/m07-01-b.webp)

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
