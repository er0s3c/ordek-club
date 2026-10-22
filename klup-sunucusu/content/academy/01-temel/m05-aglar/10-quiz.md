---
id: m05-10
tur: quiz
baslik: "M05 Quiz: İnternet ve ağlar"
sure: 7
gecme: 70
sorular:
  - soru: Aynı yerel ağdaki cihazlar arasında çerçeveleri doğru cihaza teslim eden cihaz hangisidir?
    tur: coktan
    secenekler: [Modem, Switch, Access point, DNS sunucusu]
    dogru: 1
    aciklama: Switch, MAC adreslerine göre yerel ağ içinde teslim yapar.
  - soru: TCP/IP modelinde IP protokolü hangi katmandadır?
    tur: coktan
    secenekler: [Uygulama, Taşıma, İnternet, Ağ erişimi]
    dogru: 2
    aciklama: IP, paketleri ağlar arasında yönlendiren İnternet katmanındadır.
  - soru: Aşağıdakilerden hangisi özel (private) bir IP adresidir?
    tur: coktan
    secenekler: [8.8.8.8, 192.168.10.4, 151.101.1.69, 203.0.113.66]
    dogru: 1
    aciklama: 192.168.0.0/16 özel adres aralığıdır.
  - soru: TCP üçlü el sıkışmasının doğru sırası hangisidir?
    tur: coktan
    secenekler: [ACK → SYN → SYN-ACK, SYN → ACK → SYN-ACK, SYN → SYN-ACK → ACK, SYN-ACK → SYN → ACK]
    dogru: 2
    aciklama: İstemci SYN gönderir, sunucu SYN-ACK ile cevap verir, istemci ACK ile tamamlar.
  - soru: Veritabanı portları (ör. 3306, 5432) için doğru yaklaşım hangisidir?
    tur: coktan
    secenekler:
      - İnternete açık olmalı ki uygulama erişebilsin
      - İnternete kapalı olmalı; yalnızca gereken sunuculardan erişilmeli
      - Sadece gece açık olmalı
      - Port numarası değiştirilirse internete açılabilir
    dogru: 1
    aciklama: Veritabanı servisleri internete açık olmamalıdır.
  - soru: İnternet var ama alan adlarıyla sitelere girilemiyor, IP ile girilebiliyorsa sorun büyük olasılıkla nerededir?
    tur: coktan
    secenekler: [DHCP, DNS, ARP, Kablo]
    dogru: 1
    aciklama: Ad çözümlemesi çalışmıyordur.
  - soru: Adres çubuğundaki kilit simgesi, sitenin dürüst ve güvenilir olduğunu garanti eder.
    tur: dogru-yanlis
    dogru: false
    aciklama: Kilit yalnızca bağlantının şifreli olduğunu ve sertifikanın o alan adına ait olduğunu gösterir.
  - soru: Wireshark ile HTTPS trafiğinin içeriği varsayılan olarak okunabilir.
    tur: dogru-yanlis
    dogru: false
    aciklama: TLS içeriği şifreler; yalnızca bağlantı bilgileri ve el sıkışma görünür.
gorseller:
  - id: m05-10-a
    tur: ai
    karakter: nuri
    alt: "Fişi çekilmiş çanak antenin yanında yıkılmış Dinleyici Nuri; kafedeki bütün laptoplarda küçük asma kilitler parlıyor"
    prompt: "The villain slumps in a café corner beside his unplugged parabolic dish, his headphones hanging around his neck, crestfallen. On every laptop around the café a small glowing padlock shines."
---

# M05 Quiz: İnternet ve ağlar

8 soru · geçme notu %70.

> 🔒 **DOSYA KAPANDI: Dinleyici Nuri** · *quiz'i %70 ile geçince*
>
> ![Fişi çekilmiş çanak antenin yanında yıkılmış Dinleyici Nuri; kafedeki bütün laptoplarda küçük asma kilitler parlıyor](../../gorseller/m05-10-a.webp)
>
> Nuri'nin cihazı söküldü; trafik artık şifreli. Ama dinlediği son paket fırının kendi sunucusuna gidiyordu. Fırının sahibi kuzeni: Çerezci Celal.
>
> ➡️ *Sıradaki dosya: **Çerezci Celal** (M06)*
