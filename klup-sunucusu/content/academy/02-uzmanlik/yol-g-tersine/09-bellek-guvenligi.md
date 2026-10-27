---
id: g-09
tur: ders
baslik: "Bellek güvenliği: buffer overflow mantığı"
sure: 7
hedefler:
  - Buffer overflow'un neden çökmeye ve kontrol kaybına yol açtığını açıklamak
  - Güvensiz C kodunu tanıyıp güvenli hâline çevirmek
gorseller:
  - id: g-09-b
    tur: ai
    alt: "Taşan bir bardak: fazla su yan bardaklara akıp onların içindekini değiştiriyor"
    prompt: "A row of glasses on a counter, a pitcher pouring too much glowing green water into one small glass, which overflows into the next glasses and changes the color of their contents."
  - id: g-09-c
    tur: ai
    alt: "Bellek bir kale gibi: her gün yeri değişen odalar, kapısı kilitli odalar ve kapı arasına konmuş zil ipleri"
    prompt: "A castle floor plan model on a table where rooms slide to new positions every night, some rooms have doors that cannot be opened from inside, and thin bell strings are stretched across corridors to ring if anyone trips them."
---

# Bellek güvenliği: buffer overflow mantığı

> Bir bardağa sığdığından fazla su dökersen masa ıslanır. Bellekte taşan veri ise **komşusunu** bozar.
> ⚙️ **Çark 9:** Sabri'nin en eski böcekleri kendi dişlilerini değil, başkasının makinesindeki gevşek bir yayı kullanıyordu. Selim Hoca: "O yayı bulmak savunmacının işi."

::cizgi[g-09-sahne]

## Sorun

![Taşan bir bardak: fazla su yan bardaklara akıp onların içindekini değiştiriyor](../../gorseller/g-09-b.webp)

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

![Bellek bir kale gibi: her gün yeri değişen odalar, kapısı kilitli odalar ve kapı arasına konmuş zil ipleri](../../gorseller/g-09-c.webp)

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
