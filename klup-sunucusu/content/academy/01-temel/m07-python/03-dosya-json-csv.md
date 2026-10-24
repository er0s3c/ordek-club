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
  - id: m07-03-a
    tur: ai
    karakter: orhan
    alt: "Postane ayrıştırma odasında Kuklacı Orhan'ın küçük robotları buruşuk bir zarfı kanala sokuyor"
    prompt: "A tidy little post office sorting room where envelopes of three distinct shapes slide down a chute into matching bins. Two of the villain's tiny robots, dangling on his glowing strings, sneak a crumpled glowing envelope into the chute while he watches from the doorway."
---

# Dosyalar, JSON, CSV ve hatalarla barışmak

> Güvenlik verisi hep bir dosyadadır: log, rapor, dışa aktarım.
> Onu okuyabilen program, onu anlayabilen programdır.

![Postane ayrıştırma odasında Kuklacı Orhan'ın küçük robotları buruşuk bir zarfı kanala sokuyor](../../gorseller/m07-03-a.webp)

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
