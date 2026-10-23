---
id: g-09
tur: ders
baslik: "Bellek güvenliği: buffer overflow mantığı"
sure: 7
hedefler:
  - Buffer overflow'un neden çökmeye ve kontrol kaybına yol açtığını açıklamak
  - Güvensiz C kodunu tanıyıp güvenli hâline çevirmek
gorseller:
  - id: g-09-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri raftaki küçük bir fincana durmadan dişli döküyor; taşan dişliler yandaki fincandaki dönüş oku pulunu deviriyor, ama raftaki pirinç nöbetçi kanarya ötmeye başlamış"
    prompt: "On a wooden shelf stands a neat row of small porcelain cups. The villain pours an endless stream of tiny brass gears into one small cup; it overflows and the gears spill into the neighboring cup, knocking over a little brass token shaped like a curved return arrow. Just beside the cups, a small brass canary figurine has sprung up and is singing an alarm, and the villain freezes mid-pour with a guilty grin."
---

# Bellek güvenliği: buffer overflow mantığı

> Bir bardağa sığdığından fazla su dökersen masa ıslanır. Bellekte taşan veri ise **komşusunu** bozar.
> ⚙️ **Çark 9:** Sabri'nin en eski böcekleri kendi dişlilerini değil, başkasının makinesindeki gevşek bir yayı kullanıyordu. Selim Hoca: "O yayı bulmak savunmacının işi."

![Saatçi Sabri raftaki küçük bir fincana durmadan dişli döküyor; taşan dişliler yandaki fincandaki dönüş oku pulunu deviriyor, ama raftaki pirinç nöbetçi kanarya ötmeye başlamış](../../gorseller/g-09-a.webp)

## Sorun

C ve C++'ta tampon (buffer) sabit boyutludur ve dil sınır denetimi yapmaz:

```c
char ad[16];
strcpy(ad, girdi);   // girdi 16 bayttan uzunsa? Taşar.
```

Stack'te `ad`'ın hemen ötesinde kaydedilmiş register'lar ve fonksiyonun **dönüş adresi** durur.
Taşan veri onu bozarsa `ret` yanlış adrese döner: en iyi ihtimalle çökme (crash), en kötü ihtimalle programın kontrolü başkasına geçer.

## Diğer bellek hataları

| Hata | Kısaca |
|---|---|
| **Heap overflow** | Heap'teki bir tamponun taşması |
| **Use-after-free** | Serbest bırakılmış belleği yeniden kullanmak |
| **Integer overflow** | Boyut hesabı sarar, tampon küçük ayrılır |
| **Format string** | `printf(girdi)` — girdi biçim komutu gibi yorumlanır |

## Savunma katmanları

- **Sınırlı fonksiyonlar:** `snprintf`, `strncpy` / `strlcpy`; uzunluğu her zaman denetle.
- **Bellek güvenli diller:** Rust, Go, C#, Java bu hata sınıfının çoğunu baştan engeller.
- **Derleyici ve işletim sistemi korumaları:** stack canary, DEP, ASLR — sonraki ders.
- **Fuzzing ve statik kod analizi:** hatayı saldırgandan önce bul.

## 🧪 Dene (5 dk)

Kod incelemesi yap: bu fonksiyonda kaç güvenlik hatası var, nasıl düzeltirsin?

```c
void selamla(const char *isim) {
    char tampon[32];
    sprintf(tampon, "Merhaba %s, hos geldin!", isim);
    printf(tampon);
}
```

<details><summary>Cevap</summary>İki hata: (1) <code>sprintf</code> sınırsız yazar; 10 karakterden uzun bir isim tamponu taşırır → <code>snprintf(tampon, sizeof tampon, ...)</code>. (2) <code>printf(tampon)</code> format string hatası → <code>printf("%s", tampon)</code>.</details>

## ✅ Akılda kalsın

- C sınır denetlemez; taşan veri dönüş adresini bozabilir.
- Çözüm katmanlıdır: sınırlı fonksiyonlar, bellek güvenli diller, derleyici korumaları.
- Bellek hatasını fuzzing ile saldırgandan önce bul.
