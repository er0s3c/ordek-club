---
id: b-02
tur: ders
baslik: "Trafik inceleme: Wireshark ve tcpdump"
sure: 8
hedefler:
  - tcpdump ile trafik yakalayıp Wireshark'ta incelemek
  - Filtrelerle şüpheli trafiği ayıklamak
animasyonlar: [packet-journey]
gorseller:
  - id: b-02-b
    tur: ekran
    alt: "Wireshark'ta Statistics → Conversations penceresi; IPv4 sekmesinde en çok veri aktaran konuşmalar"
    nasil: "Laboratuvar VM'inde birkaç dakikalık kendi trafiğinizi yakalayın (veya ders için verilen örnek pcap'i açın). Wireshark'ta Statistics → Conversations → IPv4 sekmesini açın, 'Bytes' sütununa göre büyükten küçüğe sıralayın. En üstteki iki satırı ve Bytes sütununu kehribar (#C9953B) çerçeveyle işaretleyin. Gerçek ev/okul IP'leri görünüyorsa bulanıklaştırın."
  - id: b-02-c
    tur: ai
    alt: "Şehir trafiğinin kuşbakışı haritası; en kalın akış çizgisi tek bir binaya gidiyor"
    prompt: "A bird's-eye night map of city traffic drawn as glowing flow lines between buildings, most lines thin and calm, but one unusually thick bright line running steadily from one house to one far-away building, an analyst circling it with chalk."
---

# Trafik inceleme: Wireshark ve tcpdump

> Ağda olan her şey bir **iz** bırakır. Tarık'ı görmek için önce trafiği okuyabilmen gerekiyor.
> 🕳️ **Tünel 2:** Laboratuvar ağında gece 03:00'te bir sunucu tanımadığı bir adresle konuşuyor.

::cizgi[b-02-sahne]

## Yakala: tcpdump

Sunucularda arayüz yoktur; trafiği komut satırından yakalar, sonra Wireshark'ta açarsın.

```bash
sudo tcpdump -i eth0 -w yakalama.pcap            # yakala, dosyaya yaz
sudo tcpdump -i eth0 -nn port 53                  # yalnızca DNS, isim çözmeden
sudo tcpdump -r yakalama.pcap host 10.66.0.20     # dosyadan oku, tek host
```

::animasyon[packet-journey]

## İncele: Wireshark filtreleri

| Filtre | Ne gösterir? |
|---|---|
| `ip.addr == 10.66.0.20` | Tek bir cihazın bütün trafiği |
| `dns` | DNS sorguları — garip alan adları? |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | Bağlantı başlatma denemeleri (tarama?) |
| `http.request` | Şifresiz web istekleri |
| `!(ip.addr == 10.66.0.0/24)` | Ağ dışına giden her şey |

## Büyük resim

![Şehir trafiğinin kuşbakışı haritası; en kalın akış çizgisi tek bir binaya gidiyor](../../gorseller/b-02-c.webp)

![Wireshark Conversations penceresi](../../gorseller/b-02-b.webp)

*Statistics → Conversations* "kim kiminle, ne kadar konuştu?" sorusunu tek ekranda cevaplar.
*Statistics → Protocol Hierarchy* ağda hangi protokollerin döndüğünü gösterir. Beklenmeyen bir protokol, ilk ipucudur.

## Kural

Yalnızca **kendi** cihazının ya da **laboratuvarın** trafiğini yakala. Başkasının trafiğini dinlemek suçtur.

## 🧪 Dene (5 dk)

Laboratuvar VM'inde `tcpdump` ile 1 dakika yakala, bu sırada birkaç siteye git. Dosyayı Wireshark'ta aç:
en çok veri aktaran konuşma hangisi? Kaç farklı DNS sorgusu yapılmış?

## ✅ Akılda kalsın

- tcpdump yakalar, Wireshark anlatır.
- Filtreler gürültüyü atar: tek host, tek protokol, ağ dışına çıkan trafik.
- Conversations ve Protocol Hierarchy büyük resmi gösterir.
