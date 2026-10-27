---
id: m05-04
tur: ders
baslik: TCP, UDP ve portlar
sure: 7
hedefler:
  - TCP ve UDP farkını açıklamak
  - Yaygın portları ve servisleri tanımak
  - TCP üçlü el sıkışmasını adım adım anlatmak
animasyonlar: [tcp-handshake]
gorseller:
  - id: m05-04-b
    tur: ai
    alt: "Solda imza karşılığı teslim edilen numaralı koliler (TCP), sağda kalabalığa havadan atılan broşürler (UDP)"
    prompt: "Split scene: on the left a careful courier hands over parcels one by one in order and waits for the recipient to sign a receipt for each, a missing parcel being resent; on the right a fast delivery person on a bicycle tosses a stream of paper flyers into a crowd without stopping, some flyers fluttering away and nobody signing anything."
  - id: m05-04-c
    tur: ai
    alt: "Bir binanın cephesinde farklı renkli birçok kapı; bazıları ışıklı ve açık, çoğu kapalı ve tuğlayla örülmüş"
    prompt: "The front of a tall building with many doors in a grid, each door a different color with its own small lamp: only a few doors are open and lit with a doorkeeper standing in each, the rest are firmly closed and some are bricked up, a lone visitor walking along checking which doors answer."
---

# TCP, UDP ve portlar

> IP adresi seni binaya getirir; **port** hangi kapıyı çalacağını söyler.
> TCP ve UDP ise kapıdan nasıl konuşacağını.

::cizgi[m05-04-sahne]

## TCP mi, UDP mi?

![Solda imza karşılığı teslim edilen numaralı koliler (TCP), sağda kalabalığa havadan atılan broşürler (UDP)](../../gorseller/m05-04-b.webp)

| | TCP | UDP |
|---|---|---|
| Benzetme | İadeli taahhütlü mektup | Kartpostal |
| Bağlantı | Önce el sıkışır | Doğrudan gönderir |
| Kayıp paket | Yeniden gönderir, sırayı korur | Umursamaz |
| Nerede? | Web, e-posta, SSH, dosya | DNS, video görüşme, oyun |

## Üçlü el sıkışma

TCP konuşmaya başlamadan önce iki taraf "hazır mısın?" diye sözleşir:

::animasyon[tcp-handshake]

## Bilmen gereken portlar

![Bir binanın cephesinde farklı renkli birçok kapı; bazıları ışıklı ve açık, çoğu kapalı ve tuğlayla örülmüş](../../gorseller/m05-04-c.webp)

| Port | Servis | Not |
|---|---|---|
| 22 | SSH | Uzaktan güvenli terminal |
| 53 | DNS | Ad çözümleme (UDP ağırlıklı) |
| 80 | HTTP | Şifresiz web |
| 443 | HTTPS | Şifreli web |
| 25 / 587 | SMTP | E-posta gönderme |
| 3389 | RDP | Windows uzak masaüstü — internete açık olmamalı |
| 3306 / 5432 | MySQL / PostgreSQL | Veritabanı — asla internete açık olmamalı |

Bir portun **açık** olması, orada bir servisin dinlediği anlamına gelir.
Gereksiz her açık port, saldırganın deneyebileceği bir kapıdır.

## Kendi bilgisayarında dinleyen portlar

```bash
ss -tuln          # Linux
netstat -ano      # Windows
```

## 🧪 Dene (3 dk)

`ss -tuln` (veya `netstat -ano`) çalıştır. Hangi portlar `LISTEN` durumunda? Tanıdığın var mı?

## ✅ Akılda kalsın

- TCP güvenilir ve sıralı, UDP hızlı ve yalın.
- TCP her bağlantıyı SYN → SYN-ACK → ACK ile başlatır.
- Gereksiz açık port, gereksiz bir kapıdır.
