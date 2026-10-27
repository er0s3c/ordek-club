---
id: m05-09
tur: uygulama
baslik: "Uygulama: Bir web sitesine ne oluyor?"
sure: 30
hedefler:
  - Kendi oluşturduğun trafikte DNS çözümlemesini ve TCP bağlantısını gözlemlemek
  - Gözlemlerini zaman sırasıyla anlatmak
gorseller:
  - id: m05-09-a
    tur: ekran
    alt: Wireshark'ta bir TCP üçlü el sıkışmasının üç paketi (SYN, SYN-ACK, ACK) seçili ve işaretli
    nasil: "Aynı yakalamada filtre kutusuna 'tcp.port == 443 && tcp.flags.syn == 1' yazın; ilk SYN paketine sağ tık → 'Conversation Filter' → 'TCP' seçin; filtreyi silmeden o bağlantının ilk paketleri listelenir. SYN, SYN-ACK ve ACK satırlarını kehribar (#C9953B) çerçeveyle işaretleyin. 'Info' sütununda Seq/Ack numaraları görünsün. Kendi IP adresinizi bulanıklaştırın."
  - id: m05-09-c
    tur: ai
    alt: "Bir saatin kadranında sıralanmış dört olay: rehber sorusu, el sıkışma, kilitli kapsül ve teslim edilen sayfa"
    prompt: "A large vintage clock face lying flat on a desk with four small scenes placed around the dial in order: a person asking a librarian for an address, two hands shaking, a locked glowing capsule being sealed, and a page being delivered on a silver tray. A pencil and timeline notebook rest beside it."
---

# Uygulama: Bir web sitesine ne oluyor?

> Tarayıcıya bir adres yazdığın andan sayfanın açıldığı ana kadar geçen **yarım saniyeyi**
> paket paket yeniden kur.

::cizgi[m05-09-sahne]

## Görev

Kendi bilgisayarında, Wireshark ile:

1. Yakalamayı başlat, tarayıcıda **`example.com`** aç, yakalamayı durdur.
2. **DNS:** `dns` filtresiyle `example.com` sorgusunu ve cevabını bul. Hangi IP döndü?
3. **TCP:** O IP'ye giden ilk SYN paketini bul. El sıkışmanın üç paketini işaretle:

![TCP el sıkışması paketleri](../../gorseller/m05-09-a.webp)

4. **TLS:** `tls.handshake` filtresiyle Client Hello'yu bul. İçinde `example.com` adı görünüyor mu (SNI)?
5. Her adımın **zamanını** (Time sütunu) not et.

## Teslim: zaman çizelgesi

![Bir saatin kadranında sıralanmış dört olay: rehber sorusu, el sıkışma, kilitli kapsül ve teslim edilen sayfa](../../gorseller/m05-09-c.webp)

```text
0.000 s  DNS sorgusu: example.com A ?
0.0xx s  DNS cevabı: ...
0.0xx s  TCP SYN → ...:443
...
```

Ardından 3 soruya kısa cevap ver:

1. DNS cevabı ile TCP SYN arasında ne kadar süre geçti?
2. TLS Client Hello'da alan adını görebildin mi? Bu bir gizlilik sorunu mudur?
3. Sayfanın **içeriğini** neden göremedin?

<details><summary>Kontrol</summary>3. sorunun cevabı: İçerik TLS ile şifreli. SNI (alan adı) ise bilinçli olarak açık gider — bu yüzden ağ yöneticisi hangi sitelere gittiğini görebilir ama ne yaptığını göremez.</details>

## ✅ Akılda kalsın

- Bir sayfa açılışı: DNS → TCP el sıkışma → TLS → HTTP.
- Zaman sütunu olayları sıraya koymanın anahtarıdır.
- HTTPS içeriği gizler, gidilen alan adı (SNI) görünebilir.
