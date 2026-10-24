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
  - id: m05-04-a
    tur: ai
    karakter: nuri
    alt: "Numaralı kapıları olan bir binanın önünde Dinleyici Nuri kulağını bir kapıya dayamış dinliyor"
    prompt: "A long futuristic building facade with dozens of small doors, each with a different abstract symbol, most closed and dark, a few open with warm light. The villain presses his ear and his parabolic dish against one closed door, listening intently."
---

# TCP, UDP ve portlar

> IP adresi seni binaya getirir; **port** hangi kapıyı çalacağını söyler.
> TCP ve UDP ise kapıdan nasıl konuşacağını.

![Numaralı kapıları olan bir binanın önünde Dinleyici Nuri kulağını bir kapıya dayamış dinliyor](../../gorseller/m05-04-a.webp)

## TCP mi, UDP mi?

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
