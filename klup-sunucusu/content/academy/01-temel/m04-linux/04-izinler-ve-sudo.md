---
id: m04-04
tur: ders
baslik: "rwxr-x---: Linux izinlerini okumak"
sure: 7
hedefler:
  - Kullanıcı, grup ve diğerleri izinlerini okumak
  - chmod ve sudo'yu güvenli kullanmak
gorseller:
  - id: m04-04-a
    tur: ai
    karakter: sadri
    alt: "Süper Kullanıcı Sadri okuma, yazma, çalıştırma kilitli üç kapıyı ardına kadar açıp kahkaha atıyor"
    prompt: "A room with three side-by-side doors (gold, silver, bronze), each fitted with three small lock icons shaped like an eye, a pencil and a play button. The villain flings all three doors wide open at once, every lock glowing open, laughing with his arms spread."
---

# rwxr-x---: Linux izinlerini okumak

> `ls -l` çıktısının başındaki o garip harfler, dosyayı **kimin, ne yapabileceğini** söyler.

![Süper Kullanıcı Sadri okuma, yazma, çalıştırma kilitli üç kapıyı ardına kadar açıp kahkaha atıyor](../../gorseller/m04-04-a.webp)

## Okumayı öğren

```text
-rwxr-x---  1 ayse  ogrenciler  2048  Mar 3  rapor.sh
 └┬┘└┬┘└┬┘     └┬─┘  └───┬────┘
  │  │  │      sahip    grup
  │  │  └── diğerleri: --- (hiçbir şey)
  │  └───── grup:      r-x (oku, çalıştır)
  └──────── sahip:     rwx (oku, yaz, çalıştır)
```

| Harf | Dosyada | Klasörde |
|---|---|---|
| `r` read | İçeriği oku | Listele |
| `w` write | Değiştir | Dosya ekle/sil |
| `x` execute | Program olarak çalıştır | İçine gir |

## chmod ile değiştir

```bash
chmod u+x betik.sh      # sahibine çalıştırma izni ver
chmod o-r gizli.txt     # diğerlerinden okumayı kaldır
chmod 600 anahtar.pem   # sadece sahip okur/yazar (r=4, w=2, x=1 → 6=rw)
```

🚩 **`chmod 777`** = herkes her şeyi yapabilir. "Çalışmadı, 777 yaptım" bir güvenlik açığıdır.

## sudo: geçici yönetici

```bash
sudo apt update     # bu tek komutu root yetkisiyle çalıştır
```

- Şifreni ister ve **kaydını tutar** (`/var/log/auth.log`).
- `sudo` yetkisi olan her hesap, pratikte yönetici hesabıdır; dikkatle verilir.
- İnternetten kopyaladığın bir komutun başında `sudo` varsa, **iki kez** oku.

## 🧪 Dene (5 dk)

```bash
touch deneme.txt
ls -l deneme.txt
chmod 600 deneme.txt
ls -l deneme.txt
```

İzinler nasıl değişti? Bu ayar hangi dosyalar için doğru olur?

## ✅ Akılda kalsın

- Üç grup (sahip, grup, diğerleri) × üç izin (r, w, x).
- `chmod 777` neredeyse her zaman yanlıştır.
- `sudo` güçlüdür ve loglanır; körü körüne kullanma.
