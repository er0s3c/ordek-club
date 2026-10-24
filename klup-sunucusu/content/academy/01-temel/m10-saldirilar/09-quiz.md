---
id: m10-09
tur: quiz
baslik: "M10 Quiz: Saldırı ve savunma temelleri"
sure: 7
gecme: 70
sorular:
  - soru: Bir saldırganın faydalanabileceği zayıf noktaya ne denir?
    tur: coktan
    secenekler: [Tehdit, Zafiyet, Risk, Varlık]
    dogru: 1
    aciklama: Zafiyet zayıf noktadır; tehdit onu kullanabilecek olandır.
  - soru: Bir saldırganın faturadaki IBAN numarasını değiştirmesi CIA üçlüsünün hangisini ihlal eder?
    tur: coktan
    secenekler: [Gizlilik, Bütünlük, Erişilebilirlik, Hiçbiri]
    dogru: 1
    aciklama: Verinin izinsiz değiştirilmesi bütünlük ihlalidir.
  - soru: "\"Rektörlükten arıyorum, hemen şifrenizi doğrulamamız gerekiyor\" hangi tetikleyicileri kullanır?"
    tur: coktan
    secenekler: [Merak ve açgözlülük, Otorite ve aciliyet, Yardımseverlik, Hiçbiri]
    dogru: 1
    aciklama: Yetkili biri olma iddiası (otorite) ve zaman baskısı (aciliyet).
  - soru: Kendi kendine ağ üzerinden yayılan zararlı yazılım türü hangisidir?
    tur: coktan
    secenekler: [Trojan, Worm, Spyware, Adware]
    dogru: 1
    aciklama: Worm kullanıcı müdahalesi olmadan açıkları kullanarak yayılır.
  - soru: Başka bir sitede sızmış kullanıcı adı ve parola çiftlerinin denenmesine ne denir?
    tur: coktan
    secenekler: [Brute-force, Password spraying, Credential stuffing, Phishing]
    dogru: 2
    aciklama: Credential stuffing sızmış kimlik bilgilerini başka sitelerde dener; farklı parolalar bunu boşa çıkarır.
  - soru: SQL Injection ve XSS gibi web açıklarının ortak kök nedeni nedir?
    tur: coktan
    secenekler: [Yavaş sunucu, Kullanıcı girdisine güvenmek, Zayıf Wi-Fi, Eski tarayıcı]
    dogru: 1
    aciklama: Girdi kod, sorgu veya sayfa içeriği olarak işlendiğinde bu açıklar oluşur.
  - soru: Cyber Kill Chain'de saldırıyı durdurmak için zinciri hangi aşamada kırmak gerekir?
    tur: coktan
    secenekler: [Sadece ilk aşamada, Sadece son aşamada, Herhangi bir aşamada, Hiçbir aşamada kırılamaz]
    dogru: 2
    aciklama: Herhangi bir halkayı kırmak saldırının ilerlemesini engeller; derinlemesine savunma buna dayanır.
  - soru: Bir siteye "sadece test için" DDoS saldırısı yapmak, zarar kalıcı değilse yasaldır.
    tur: dogru-yanlis
    dogru: false
    aciklama: İzinsiz hizmet engelleme suçtur ve başka kullanıcılara da zarar verir.
gorseller:
  - id: m10-09-a
    tur: ai
    karakter: ferhat
    alt: "Sorgu odasında kelepçeli Fidyeci Ferhat; zincirleri masada, duvardaki kapüşonlu gölgeye meydan okur gibi sırıtıyor"
    prompt: "A bare room lit by a single desk lamp: the villain sits at a metal table, his heavy padlocked chains piled uselessly in front of him. He smirks defiantly toward the wall, where a tall shadow of a hooded figure looms."
---

# M10 Quiz: Saldırı ve savunma temelleri

8 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Fidyeci Ferhat** · *quiz'i %70 ile geçince*
>
> ![Sorgu odasında kelepçeli Fidyeci Ferhat; zincirleri masada, duvardaki kapüşonlu gölgeye meydan okur gibi sırıtıyor](../../gorseller/m10-09-a.webp)
>
> Zincir üçüncü halkada kırıldı; yedekler kurtarıldı. Ferhat sorguda tek cümle kuruyor: "Don'u yakalarsınız. Ama Baron'u asla."
>
> ➡️ *Sıradaki dosya: **Don Gölge** (M11)*
