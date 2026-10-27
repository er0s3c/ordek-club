---
id: m07-03
tur: ders
baslik: Dosyalar, JSON, CSV ve hatalarla barışmak
sure: 8
hedefler:
  - Dosya okuyup yazmak
  - JSON ve CSV verisiyle çalışmak
  - Hataları try/except ile yönetmek
gorseller:
  - id: m07-03-b
    tur: ai
    alt: "Etiketli çekmecelerden oluşan iç içe bir dolap (JSON) ve yanında düz sıralı tablo rafı (CSV)"
    prompt: "Two pieces of furniture side by side: on the left a small cabinet with labeled drawers where some drawers open to reveal even smaller boxes nested inside, on the right a long flat shelf divided into a neat grid of identical cubbies holding cards in rows and columns."
  - id: m07-03-c
    tur: ai
    alt: "Tren yoldan çıkacakken bir güvenlik ağı vagonu nazikçe yakalıyor"
    prompt: "A toy train wagon flies off a broken section of track and is gently caught by a safety net held by a calm small robot, which notes the problem on a clipboard, while the rest of the train keeps running."
---

# Dosyalar, JSON, CSV ve hatalarla barışmak

> Güvenlik verisi hep bir dosyadadır: log, rapor, dışa aktarım.
> Onu okuyabilen program, onu anlayabilen programdır.

::cizgi[m07-03-sahne]

## Dosya okuma ve yazma

```python
with open("notlar.txt", "w", encoding="utf-8") as f:
    f.write("ilk satır\n")

with open("notlar.txt", encoding="utf-8") as f:
    for satir in f:                 # büyük dosyalarda satır satır oku
        print(satir.strip())
```

`with` dosyayı iş bitince otomatik kapatır.

## JSON — API'lerin dili

![Etiketli çekmecelerden oluşan iç içe bir dolap (JSON) ve yanında düz sıralı tablo rafı (CSV)](../../gorseller/m07-03-b.webp)

```python
import json

veri = {"kullanici": "ayse", "deneme": 3, "kilitli": False}
metin = json.dumps(veri, ensure_ascii=False)   # sözlük → JSON metni
geri = json.loads(metin)                         # JSON metni → sözlük
print(geri["deneme"])
```

## CSV — tablolar

```python
import csv

with open("girisler.csv", newline="", encoding="utf-8") as f:
    for satir in csv.DictReader(f):     # ilk satır başlık
        print(satir["kullanici"], satir["sonuc"])
```

## Hatalar: programın çökmesin

![Tren yoldan çıkacakken bir güvenlik ağı vagonu nazikçe yakalıyor](../../gorseller/m07-03-c.webp)

```python
try:
    with open("yok.log", encoding="utf-8") as f:
        icerik = f.read()
except FileNotFoundError:
    print("Dosya bulunamadı, yolu kontrol et.")
except PermissionError:
    print("Okuma izni yok.")
```

Hatayı **sessizce yutma** (`except: pass`); en azından ne olduğunu yazdır.
Güvenlik araçlarında sessiz hata, kaçırılmış bir saldırı demektir.

## 🧪 Dene (5 dk)

Bir sözlüğü `rapor.json` dosyasına yaz, sonra dosyayı okuyup bir alanını yazdır.
Dosya adını yanlış yazarak `FileNotFoundError`'ı yakala.

## ✅ Akılda kalsın

- `with open(...)` dosyayı güvenle açıp kapatır.
- `json` API verisi, `csv` tablo verisi içindir.
- Hataları yakala ama asla sessizce yutma.
