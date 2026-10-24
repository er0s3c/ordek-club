---
id: m05-08
tur: ders
baslik: Wireshark ile paketleri görmek
sure: 7
hedefler:
  - Wireshark'ta trafik yakalayıp filtrelemek
  - Ağ güvenliğinin temel ilkelerini sıralamak
gorseller:
  - id: m05-08-a
    tur: ekran
    alt: Wireshark ana ekranı; üstte "dns" görüntü filtresi, ortada paket listesi, altta seçili paketin katmanları
    nasil: "Wireshark'ı açın → kendi Wi-Fi/Ethernet arayüzünüzde yakalamayı başlatın → tarayıcıda example.com açın → yakalamayı durdurun → üstteki filtre kutusuna 'dns' yazıp Enter. Bir DNS sorgu paketini seçin; alt panelde katmanlar (Frame, Ethernet, IP, UDP, DNS) açık görünsün. Filtre kutusunu ve katman listesini kehribar (#C9953B) çerçeveyle işaretleyin. Kendi IP ve MAC adreslerinizi bulanıklaştırın."
  - id: m05-08-b
    tur: ai
    karakter: nuri
    alt: "Dinleyici Nuri paket otoyolunun üzerindeki köprüde dürbünle trafiği izliyor"
    prompt: "A pedestrian bridge over a busy glowing highway at night where vehicles are small glowing packets of different colors moving in lanes. The villain leans on the railing with binoculars and his headphones, scribbling notes about certain packets in a small notebook."
---

# Wireshark ile paketleri görmek

> Şimdiye kadar paketleri anlattık. Şimdi **gerçekten göreceksin**.
> Wireshark, ağ kartından geçen her paketi kaydeden bir mikroskoptur.

![Dinleyici Nuri paket otoyolunun üzerindeki köprüde dürbünle trafiği izliyor](../../gorseller/m05-08-b.webp)

## ⚠️ Önce kural

Yalnızca **kendi** bilgisayarının ve **kendi** ağının trafiğini yakala.
Kampüs ağında, yurtta veya başkasının trafiğini dinlemek (izinsiz dinleme) yasa dışıdır.

## Üç bölme

![Wireshark ekranı](../../gorseller/m05-08-a.webp)

1. **Filtre kutusu** — Gürültüyü azalt.
2. **Paket listesi** — Zaman, kaynak, hedef, protokol, özet.
3. **Paket ayrıntısı** — Seçili paketin zarfları, M05-02'deki katmanların ta kendisi.

## İlk filtrelerin

| Filtre | Gösterir |
|---|---|
| `dns` | Ad çözümleme sorguları |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | Yeni TCP bağlantı denemeleri |
| `http` | Şifresiz web trafiği |
| `tls.handshake` | HTTPS el sıkışmaları |
| `ip.addr == 192.168.1.1` | Belirli bir adresle konuşmalar |

HTTPS trafiğinde içeriği **göremezsin** — sadece kimle konuştuğunu ve el sıkışmayı görürsün. TLS işini yapıyor.

## Ağ güvenliğinin 5 temel ilkesi

1. **En az yetki** — Herkes ve her cihaz sadece ihtiyacı olana erişsin.
2. **Bölümlendirme** — Misafir, öğrenci ve yönetim ağları ayrı olsun.
3. **Şifreleme** — Yolda giden her şey şifreli olsun.
4. **Varsayılan red** — Açıkça izin verilmeyen trafik engellensin.
5. **Görünürlük** — Loglanmayan şey fark edilmez.

## 🧪 Dene (5 dk)

Kendi bilgisayarında 30 saniye yakala, bir web sitesi aç, durdur. `dns` filtresiyle o sitenin sorgusunu bul.

## ✅ Akılda kalsın

- Sadece kendi trafiğini, izinli ortamda yakala.
- Filtre → liste → ayrıntı; ayrıntı paneli katmanları gösterir.
- HTTPS içeriği gizler; kimle konuşulduğu yine görünür.
