---
id: m03-07
tur: quiz
baslik: "M03 Quiz: İşletim sistemi güvenliği"
sure: 5
gecme: 70
sorular:
  - soru: Windows'ta "odev.pdf" gibi görünen ama aslında "odev.pdf.exe" olan bir dosyayı fark etmenin en kolay yolu nedir?
    tur: coktan
    secenekler:
      - Dosyayı açıp bakmak
      - Dosya adı uzantılarını görünür yapmak
      - Dosyayı yeniden adlandırmak
      - Dosyayı masaüstüne taşımak
    dogru: 1
    aciklama: Uzantılar gizlenince çift uzantı hilesi görünmez; uzantıları açmak hileyi ortaya çıkarır.
  - soru: Günlük kullanımda standart hesap kullanmak hangi güvenlik ilkesinin uygulamasıdır?
    tur: coktan
    secenekler:
      - Derinlemesine savunma
      - En az yetki
      - Veri minimizasyonu
      - Varsayılan izin
    dogru: 1
    aciklama: Kullanıcıya işini yapacak kadar yetki vermek en az yetki ilkesidir.
  - soru: Zararlı yazılımların bilgisayar yeniden başladığında da çalışmaya devam etmesine ne denir?
    tur: coktan
    secenekler:
      - Kalıcılık (persistence)
      - Şifreleme
      - Yedekleme
      - Sanallaştırma
    dogru: 0
    aciklama: Başlangıç öğeleri ve servisler kalıcılığın yaygın yollarıdır.
  - soru: Güvenlik duvarı kuralları nasıl değerlendirilir?
    tur: coktan
    secenekler:
      - Rastgele bir kural seçilir
      - Sırayla kontrol edilir, eşleşen ilk kural uygulanır
      - En son eklenen kural her zaman kazanır
      - Tüm kurallar birleştirilir
    dogru: 1
    aciklama: Kurallar yukarıdan aşağı değerlendirilir; hiçbiri eşleşmezse varsayılan kural uygulanır.
  - soru: 3-2-1 yedekleme kuralında "1" neyi ifade eder?
    tur: coktan
    secenekler:
      - Bir günde bir yedek
      - Bir kopyanın başka bir yerde ve bağlantısız durması
      - Tek bir şifre
      - Bir yıl saklama süresi
    dogru: 1
    aciklama: Bağlantısız kopya, fidye yazılımı bağlı diskleri şifrelese bile güvende kalır.
  - soru: Disk şifreleme, bilgisayar açıkken internetten gelen saldırılara karşı korur.
    tur: dogru-yanlis
    dogru: false
    aciklama: Disk şifreleme esas olarak cihaz kapalıyken veya çalındığında veriyi korur.
gorseller:
  - id: m03-07-a
    tur: ai
    karakter: riza
    alt: "Anahtarcı Rıza havalandırma boşluğunda anahtarlığıyla sıkışmış; arkadaki bilgisayarlarda yeşil kalkanlar parlıyor"
    prompt: "The villain is stuck halfway through a narrow air vent in a computer lab at night, his giant keyring snagged on the vent edge, legs kicking in the air. Behind him a row of laptops glow with calm green shield icons."
---

# M03 Quiz: İşletim sistemi güvenliği

6 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Anahtarcı Rıza** · *quiz'i %70 ile geçince*
>
> ![Anahtarcı Rıza havalandırma boşluğunda anahtarlığıyla sıkışmış; arkadaki bilgisayarlarda yeşil kalkanlar parlıyor](../../gorseller/m03-07-a.webp)
>
> Arka kapı kapandı; makineler güncel ve kilitli. Rıza'nın düşürdüğü anahtarlıkta bir etiket var: "Sadri Usta'ya — sunucu odası."
>
> ➡️ *Sıradaki dosya: **Süper Kullanıcı Sadri** (M04)*
