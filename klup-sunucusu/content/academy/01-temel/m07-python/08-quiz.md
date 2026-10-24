---
id: m07-08
tur: quiz
baslik: "M07 Quiz: Python ve otomasyon"
sure: 6
gecme: 70
sorular:
  - soru: Python'da bir kod bloğunu (ör. if içini) ne belirler?
    tur: coktan
    secenekler: [Süslü parantez, Girinti, Noktalı virgül, end anahtar kelimesi]
    dogru: 1
    aciklama: Python blokları girintiyle belirler.
  - soru: "Bir log dosyasında en sık geçen IP'leri bulmak için en uygun yapı hangisidir?"
    tur: coktan
    secenekler: [list, collections.Counter, str, bool]
    dogru: 1
    aciklama: Counter saymak için özelleşmiş bir sözlüktür ve most_common() sunar.
  - soru: Bir dosyanın sonradan değiştirilip değiştirilmediğini anlamak için ne kullanılır?
    tur: coktan
    secenekler: [Dosya boyutu, SHA-256 hash değeri, Dosya adı, Oluşturma tarihi]
    dogru: 1
    aciklama: Tek bir bit değişse bile hash tamamen değişir.
  - soru: Kullanıcı girdisini bir sistem komutunda kullanmanın en güvenli yolu hangisidir?
    tur: coktan
    secenekler:
      - os.system("ping " + girdi)
      - eval(girdi)
      - subprocess.run(["ping", "-c", "1", girdi])
      - subprocess.run("ping " + girdi, shell=True)
    dogru: 2
    aciklama: Liste biçimi girdiyi tek bir argüman olarak verir; shell yorumlaması olmaz.
  - soru: API anahtarı nerede tutulmalıdır?
    tur: coktan
    secenekler: [Kodun en üstünde bir değişkende, GitHub README dosyasında, Ortam değişkeninde veya gizli bir ayar dosyasında, Yorum satırında]
    dogru: 2
    aciklama: Koda gömülen anahtar, kod paylaşıldığında sızar.
  - soru: "\"except: pass\" ile tüm hataları sessizce yutmak, güvenlik araçlarında iyi bir uygulamadır."
    tur: dogru-yanlis
    dogru: false
    aciklama: Sessiz hata, fark edilmemiş bir sorun veya saldırı demektir.
  - soru: requests ile istek yaparken verify=False kullanmak sertifika doğrulamasını kapatır.
    tur: dogru-yanlis
    dogru: true
    aciklama: Bu, bağlantıyı ortadaki adam saldırılarına açık bırakır; kullanılmamalıdır.
gorseller:
  - id: m07-08-a
    tur: ai
    karakter: orhan
    alt: "Bütün ipleri kesilmiş Kuklacı Orhan; küçük robotları ayaklarının dibinde uyuyor, elinde boş kumanda çıtası"
    prompt: "Every glowing marionette string has been cut and hangs loose from above. The villain stands dumbfounded holding his useless wooden control bar, while his tiny robots lie peacefully asleep in a heap at his feet."
---

# M07 Quiz: Python ve otomasyon

7 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Kuklacı Orhan** · *quiz'i %70 ile geçince*
>
> ![Bütün ipleri kesilmiş Kuklacı Orhan; küçük robotları ayaklarının dibinde uyuyor, elinde boş kumanda çıtası](../../gorseller/m07-08-a.webp)
>
> Loglardan bot ordusunu buldun; ipler kesildi. Orhan'ın sunucusunda çalınmış parola özetleri duruyor. Onları kırmaya çalışan adamın adı loglarda: Kasa Kıran Kadir.
>
> ➡️ *Sıradaki dosya: **Kasa Kıran Kadir** (M08)*
