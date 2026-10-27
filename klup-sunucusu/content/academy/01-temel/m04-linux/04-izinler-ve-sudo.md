---
id: m04-04
tur: ders
baslik: "rwxr-x---: Linux izinlerini okumak"
sure: 7
hedefler:
  - Kullanıcı, grup ve diğerleri izinlerini okumak
  - chmod ve sudo'yu güvenli kullanmak
gorseller:
  - id: m04-04-b
    tur: ai
    alt: "Üç kapılı bir dolap: sahip, grup ve diğerleri için ayrı kapılar; her kapıda göz, kalem ve çalıştırma kolu simgeleri açık ya da kilitli"
    prompt: "A tall wooden cabinet with three separate doors side by side, one for the owner, one for a small group of friends, and one for strangers; each door has three small symbols, an eye, a pencil and a pull lever, glowing green when allowed and covered by a tiny padlock when not: the owner's door has all three open, the group's door has the eye and lever open, the strangers' door is fully locked."
  - id: m04-04-c
    tur: ai
    alt: "Öğrenciye kısa süreliğine verilen parlayan bir kral tacı; yanında hızla akan kum saati"
    prompt: "A student is handed a glowing crown by a gloved hand for just a moment to open a heavy royal door, an hourglass beside them running fast, the crown already fading back toward its velvet cushion."
---

# rwxr-x---: Linux izinlerini okumak

> `ls -l` çıktısının başındaki o garip harfler, dosyayı **kimin, ne yapabileceğini** söyler.

::cizgi[m04-04-sahne]

## Okumayı öğren

![Üç kapılı bir dolap: sahip, grup ve diğerleri için ayrı kapılar; her kapıda göz, kalem ve çalıştırma kolu simgeleri açık ya da kilitli](../../gorseller/m04-04-b.webp)

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

![Öğrenciye kısa süreliğine verilen parlayan bir kral tacı; yanında hızla akan kum saati](../../gorseller/m04-04-c.webp)

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
