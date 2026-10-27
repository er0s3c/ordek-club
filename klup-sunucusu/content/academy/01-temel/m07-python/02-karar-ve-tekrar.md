---
id: m07-02
tur: ders
baslik: Karar ver, tekrar et — koşullar, döngüler, fonksiyonlar
sure: 8
hedefler:
  - if, for ve while kullanmak
  - Liste ve sözlüklerle veri tutmak
  - Tekrar eden işi fonksiyona çevirmek
gorseller:
  - id: m07-02-b
    tur: ai
    alt: "Tren makası: vagon yeşil ışıkta bir raya, kırmızı ışıkta öbür raya yönleniyor"
    prompt: "A railway junction at night: a small glowing wagon arrives at a switch where a signal lamp decides its path, green light sends it to the left track toward a bright station, red light sends it to the right track toward a quiet depot."
  - id: m07-02-c
    tur: ai
    alt: "Dairesel bir rayda dönen oyuncak tren, her turda bir kutu yüklüyor"
    prompt: "A toy train running on a circular track around a table, stopping at the same little platform on every lap to pick up one box from a stack, the stack getting smaller each time while the wagons fill up."
---

# Karar ver, tekrar et

> Programların gücü iki şeyden gelir: **karar vermek** (if) ve **sıkılmadan tekrar etmek** (for/while).

::cizgi[m07-02-sahne]

## Koşullar

![Tren makası: vagon yeşil ışıkta bir raya, kırmızı ışıkta öbür raya yönleniyor](../../gorseller/m07-02-b.webp)

```python
deneme = 7
if deneme >= 10:
    print("Hesap kilitlensin")
elif deneme >= 5:
    print("Uyarı: şüpheli")
else:
    print("Normal")
```

Python'da **girinti** (4 boşluk) bloğu belirler; parantez yoktur.

## Listeler ve sözlükler

```python
portlar = [22, 80, 443]               # liste: sıralı
portlar.append(3306)

servis = {22: "SSH", 80: "HTTP", 443: "HTTPS"}   # sözlük: anahtar → değer
print(servis[443])                    # HTTPS
print(servis.get(3306, "bilinmiyor")) # anahtar yoksa varsayılan
```

## Döngüler

![Dairesel bir rayda dönen oyuncak tren, her turda bir kutu yüklüyor](../../gorseller/m07-02-c.webp)

```python
for p in portlar:
    print(p, servis.get(p, "?"))

sayac = 0
while sayac < 3:
    sayac += 1
```

## Fonksiyonlar

Aynı işi üç kez yazıyorsan, bir fonksiyon zamanı gelmiştir:

```python
def risk_seviyesi(deneme: int) -> str:
    if deneme >= 10:
        return "yüksek"
    if deneme >= 5:
        return "orta"
    return "düşük"

for ip, n in {"203.0.113.66": 58, "198.51.100.23": 3}.items():
    print(ip, risk_seviyesi(n))
```

## 🧪 Dene (5 dk)

Bir sözlükte 4 öğrencinin quiz puanını tut. 70 ve üstüne "geçti", altına "tekrar" yazdıran bir döngü yaz.

## ✅ Akılda kalsın

- `if/elif/else` karar verir; girinti bloğu belirler.
- Liste sıralı veri, sözlük anahtar → değer tutar.
- Tekrar eden mantığı fonksiyona çevir.
