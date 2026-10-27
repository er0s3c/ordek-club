---
id: m07-03
baslik: Files, JSON, CSV and making peace with errors
hedefler:
  - Read and write files
  - Work with JSON and CSV data
  - Handle errors with try/except
---

# Files, JSON, CSV and making peace with errors

> Security data always lives in a file: a log, a report, an export.
> The program that can read it is the program that can understand it.

::cizgi[m07-03-sahne]

## Reading and writing files

```python
with open("notlar.txt", "w", encoding="utf-8") as f:
    f.write("ilk satır\n")

with open("notlar.txt", encoding="utf-8") as f:
    for satir in f:                 # read line by line for large files
        print(satir.strip())
```

`with` closes the file automatically when the work is done.

## JSON — the language of APIs

![A nested cabinet of labelled drawers (JSON) next to a flat, ordered grid shelf (CSV)](../../gorseller/m07-03-b.webp)

```python
import json

veri = {"kullanici": "ayse", "deneme": 3, "kilitli": False}
metin = json.dumps(veri, ensure_ascii=False)   # dictionary → JSON text
geri = json.loads(metin)                         # JSON text → dictionary
print(geri["deneme"])
```

## CSV — tables

```python
import csv

with open("girisler.csv", newline="", encoding="utf-8") as f:
    for satir in csv.DictReader(f):     # the first line is the header
        print(satir["kullanici"], satir["sonuc"])
```

## Errors: don't let the program crash

![A safety net gently catching a wagon as it is about to leave the track](../../gorseller/m07-03-c.webp)

```python
try:
    with open("yok.log", encoding="utf-8") as f:
        icerik = f.read()
except FileNotFoundError:
    print("Dosya bulunamadı, yolu kontrol et.")
except PermissionError:
    print("Okuma izni yok.")
```

Don't **swallow** the error silently (`except: pass`); at least print what happened.
In security tools, a silent error means a missed attack.

## 🧪 Try it (5 min)

Write a dictionary to a `rapor.json` file, then read the file back and print one of its fields.
Catch the `FileNotFoundError` by typing the file name wrong.

## ✅ Remember

- `with open(...)` opens and closes a file safely.
- `json` is for API data, `csv` for table data.
- Catch errors, but never swallow them silently.
