---
id: m04-07
tur: quiz
baslik: "M04 Quiz: Linux ve komut satırı"
sure: 5
gecme: 70
sorular:
  - soru: Linux'ta log dosyaları genellikle hangi dizinde bulunur?
    tur: coktan
    secenekler: ["/etc", "/var/log", "/home", "/bin"]
    dogru: 1
    aciklama: /var/log, sistem ve servis loglarının standart yeridir.
  - soru: "\"grep -c Failed auth.log\" komutu ne yapar?"
    tur: coktan
    secenekler:
      - '"Failed" geçen satırları siler'
      - '"Failed" geçen satırların sayısını verir'
      - Dosyayı Failed adıyla kopyalar
      - Dosyayı şifreler
    dogru: 1
    aciklama: -c seçeneği eşleşen satırları göstermek yerine sayar.
  - soru: "-rw-r----- izinleriyle bir dosyayı \"diğerleri\" grubundaki bir kullanıcı ne yapabilir?"
    tur: coktan
    secenekler: ["Okuyabilir", "Yazabilir", "Çalıştırabilir", "Hiçbir şey yapamaz"]
    dogru: 3
    aciklama: Son üç karakter (---) diğerlerinin hiçbir izni olmadığını gösterir.
  - soru: Aşağıdakilerden hangisi genellikle bir güvenlik hatasıdır?
    tur: coktan
    secenekler: ["chmod 600 anahtar.pem", "chmod u+x betik.sh", "chmod -R 777 /var/www", "chmod o-r notlar.txt"]
    dogru: 2
    aciklama: 777 herkese okuma, yazma ve çalıştırma verir.
  - soru: İnternetten bulunan "curl adres | bash" komutunu çalıştırmadan önce ne yapmalısın?
    tur: coktan
    secenekler:
      - Başına sudo eklemek
      - Betiği indirip içeriğini okumak
      - Komutu iki kez çalıştırmak
      - Güvenlik duvarını kapatmak
    dogru: 1
    aciklama: Okumadığın kodu çalıştırmak, ne yaptığını bilmediğin bir programı yönetici gibi çalıştırmak olabilir.
  - soru: Base64 ile kodlanmış bir metin, anahtar olmadan çözülemez.
    tur: dogru-yanlis
    dogru: false
    aciklama: Base64 bir kodlamadır, şifreleme değildir; herkes çözebilir.
gorseller:
  - id: m04-07-a
    tur: ai
    karakter: sadri
    alt: "Süper Kullanıcı Sadri devrilen sunucu tahtının önünde yerde, çatlak monokluyla; bütün sunucu ışıkları sakin yeşil"
    prompt: "In a server room the villain's throne of server racks has toppled over; he sits on the floor amid tangled cables holding his cracked green monocle, stunned, while every server light around him has turned a calm steady green."
---

# M04 Quiz: Linux ve komut satırı

6 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Süper Kullanıcı Sadri** · *quiz'i %70 ile geçince*
>
> ![Süper Kullanıcı Sadri devrilen sunucu tahtının önünde yerde, çatlak monokluyla; bütün sunucu ışıkları sakin yeşil](../../gorseller/m04-07-a.webp)
>
> Sadri'nin tahtı devrildi. Loglarda unuttuğu tek satır kaldı: yirmi yıllık bir kullanıcı adı, "eren". Selim Hoca o satırı görünce uzun süre konuşmuyor.
>
> ➡️ *Sıradaki dosya: **Dinleyici Nuri** (M05)*
