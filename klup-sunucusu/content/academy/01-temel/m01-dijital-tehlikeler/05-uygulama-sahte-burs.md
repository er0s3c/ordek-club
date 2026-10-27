---
id: m01-05
tur: uygulama
baslik: "Şüpheli Mesaj: Sahte Kampüs Bursu"
sure: 3
hedefler:
  - Göndereni @ işaretinden sonrasıyla kontrol ederim
  - Linke tıklamam, resmî siteye kendim girerim
  - Emin değilsem başka bir kanaldan doğrular, bildiririm
# Görev düzeni (docs/design-council/05 §6.6, kısa sürüm). Kurum ve alan adları kurgudur (RFC 2606 .example);
# hiçbir gerçek kurumu, kişiyi ya da siteyi taklit etmez.
gorevler:
  - id: sahte-burs
    baslik: "Şüpheli Mesaj: Sahte Kampüs Bursu"
    kanca:
      saat: "23:47"
      metin: "Deniz'in telefonuna bir mesaj düştü: \"Bursun onaylandı, 24 saat içinde doğrula.\" Herkes sevinecek. Sen önce bir bak."
    posta:
      gonderen: Kuzey Ada Burs Ofisi
      adres: burs@kuzeyada-burslar.example
      saat: "23:47"
      konu: "Burs başvurun ONAYLANDI, 24 saat içinde doğrula"
      govde: |
        Merhaba,

        Tebrikler! Başarı bursun onaylandı. Bursunun iptal olmaması için 24 saat içinde öğrenci numaran ve şifrenle giriş yapıp hesabını doğrula.

        Kuzey Ada Üniversitesi Burs Ofisi
      dugme: Hesabımı doğrula
      hedef: giris.kuzeyada-burslar.example
      resmi: kuzeyada.edu.example
    adimlar:
      - tur: sec
        baslik: Deniz ne yapsın?
        soru: Mesaj geldi. İlk hamle ne olsun?
        secenekler:
          - metin: Bağlantıya dokun
            sahne: giris
            geri: "Çoğu kişi tam burada tıklıyor; mesaj bunun için yazıldı. Simülasyon, hiçbir şey gitmedi. Şifreni yazsaydın dolandırıcıya gidecekti. Sorun sen değilsin."
          - metin: Göndereni incele
            dogru: true
            geri: "Sen yakaladın. Adı \"Burs Ofisi\" ama adresine bakalım."
          - metin: Gruba ilet
            geri: "İyi niyetli bir seçim. Ama uyarısız iletirsen tuzağı gruptaki herkese taşırsın. Önce kendin doğrula."
        ipuclari:
          - "Mesajın içindeki düğme, mesajı yazanın istediği yere gider. Önce mesajı kimin yazdığına bak."
          - "Üç seçenekten hangisi hiçbir şeye dokunmadan bilgi toplar?"
        cozum: "Birlikte bakalım: bağlantıya dokunmak ve iletmek mesajın istediği şeyi yapar. Göndereni incelemek ise hiçbir şeye dokunmadan bilgi toplar. İlk hamle hep bu."
      - tur: sec
        baslik: Adı başka, adresi başka
        soru: Bu mesaj okulun adresinden mi geliyor?
        panel: true
        secenekler:
          - metin: Evet
            geri: "Yakın. \"kuzeyada\" kelimesi iki adreste de var, ama ardından gelen kısım farklı. Bir daha yan yana bak."
          - metin: Hayır
            dogru: true
            geri: "Doğru. Ad \"Kuzey Ada Burs Ofisi\", ama adres okulunki değil. Tire ve fazladan bir kelime, başka bir yer demek."
          - metin: Emin değilim
            ipucu: true
            geri: "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak."
        ipuclari:
          - "Ad güzel görünür. Adrese bak: @ işaretinden sonrası, mesajın nereden geldiğini söyler."
          - "Okulun adresi kuzeyada.edu.example. Bu mesajdaki onunla aynı mı? Harf harf yan yana koy."
        cozum: "Birlikte bakalım: kuzeyada · .edu · .example ile kuzeyada · -burslar · .example. Ortadaki parça farklı; yani mesaj okulun adresinden gelmiyor."
      - tur: kanit
        baslik: Seni ne ikna etti?
        soru: Hangisi en güçlü işaret? Bir tane seç.
        tek: true
        secenekler:
          - metin: Gönderen adresi okulunkiyle aynı değil
            cekirdek: true
          - metin: Düğmenin gittiği adres okulunki değil
            cekirdek: true
          - metin: 24 saat baskısı yapıyor
            geri: "Acele ettirmek klasik bir işaret, ama gerçek okullar da son tarih koyar. Daha zor taklit edilen bir şey var."
          - metin: "\"Merhaba\" diye başlıyor"
            geri: "Gerçek okullar da \"Merhaba\" yazar. Bu tek başına kanıt değil. Az önce neyi yan yana koymuştun?"
          - metin: Bir kelime büyük harfle yazılmış
            geri: "Büyük harf dikkat çeker ama tek başına kanıt değil. Az önce neyi yan yana koymuştun?"
        dogru_geri: "Sen yakaladın. Adres, mesajın içinde değiştirilmesi en zor şey; bu yüzden en güçlü kanıt."
        eksik: "Bu tek başına kanıt değil. Az önce neyi yan yana koymuştun?"
        ipuclari:
          - "Az önce neyi yan yana koydun?"
          - "Değiştirmesi en zor olan şey hangisi: bir selam mı, bir adres mi?"
        cozum: "Birlikte bakalım: selamı, büyük harfi ve son tarihi herkes yazabilir. Ama mesajın geldiği adres ve düğmenin gittiği adres okulunki değil. Kanıt bunlar."
    kapanis:
      ifsa: "Mesajı \"Burs Ofisi\" yazmamıştı. Tatlı Dil Tevfik. Kibar, acil, tanıdık. Hep böyle gelir. Kayda geçti."
      kurallar:
        - Göndereni @ işaretinden sonrasıyla kontrol et.
        - Linke tıklama. Resmî siteye kendin gir.
        - Şüpheliyse bildir, iletme. Bu numaranın adı oltalama.
      sonraki: "00:12 Yeni mesaj. İçinde link yok. Adres de doğru. Ama gönderen, senin adını yanlış yazmış."
---

# Şüpheli Mesaj: Sahte Kampüs Bursu

::gorev[sahte-burs]

::cizgi[m01-05-sahne]
