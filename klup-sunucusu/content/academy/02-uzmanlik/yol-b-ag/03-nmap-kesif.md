---
id: b-03
tur: ders
baslik: "Nmap ile keşif: hangi kapılar açık?"
sure: 8
hedefler:
  - Host, port ve servis keşfini ayırt etmek
  - Nmap çıktısını okuyup envantere dönüştürmek
animasyonlar: [tcp-handshake]
gorseller:
  - id: b-03-b
    tur: ai
    alt: "Kapıların üç hâli: açık kapıdan ışık sızıyor, kapalı kapı sessiz, filtrelenmiş kapının önünde bekçi duruyor"
    prompt: "Three doors side by side in a dark alley: the first door is open with warm light pouring out and someone answering, the second door is shut and silent, the third door has a guard standing in front who simply stares and says nothing."
---

# Nmap ile keşif: hangi kapılar açık?

> Savunmanın ilk sorusu: **ağımda ne var ve hangi kapıları açık?** Saldırganın ilk sorusu da aynıdır.
> 🕳️ **Tünel 3:** Tarık laboratuvar ağında her kapıyı çaldı. Hangilerinin açıldığını ondan önce bil.

::cizgi[b-03-sahne]

## Üç adım

| Adım | Soru | Örnek |
|---|---|---|
| **Host keşfi** | Kim ayakta? | `nmap -sn 10.66.0.0/24` |
| **Port taraması** | Hangi kapılar açık? | `nmap 10.66.0.20` (en yaygın 1000 port) |
| **Servis/sürüm** | Kapının ardında ne var? | `nmap -sV -p 22,80,443 10.66.0.20` |

::animasyon[tcp-handshake]

## Çıktıyı okumak

![Kapıların üç hâli: açık kapıdan ışık sızıyor, kapalı kapı sessiz, filtrelenmiş kapının önünde bekçi duruyor](../../gorseller/b-03-b.webp)

```text
PORT     STATE    SERVICE  VERSION
22/tcp   open     ssh      OpenSSH 8.9p1
80/tcp   open     http     nginx 1.18.0
3306/tcp open     mysql    MySQL 5.7.33
8080/tcp filtered http-proxy
```

| Durum | Anlamı |
|---|---|
| `open` | Bir servis dinliyor |
| `closed` | Erişilebilir ama dinleyen yok |
| `filtered` | Bir güvenlik duvarı cevabı yutuyor |

Bu çıktıdaki asıl bulgu: **veritabanı (3306) ağa açık** ve sürümü eski. Sunucu bölgesinde kalmalıydı.

## Envantere dönüştür

```bash
nmap -sV -oA lab-tarama 10.66.0.0/24   # .nmap, .xml, .gnmap dosyaları
```

Her host için: IP, işlev, açık portlar, sürümler, "olması gerekiyor mu?" sütunu.

## Kural

Nmap güçlü bir araçtır; **izinsiz tarama** birçok ülkede suçtur ve okul ağlarında kesinlikle yasaktır.
Yalnızca laboratuvar aralığını tara.

## 🧪 Dene (5 dk)

Laboratuvar VM'inden önce `nmap -sn` ile ayaktaki hostları, sonra bir sunucuda `-sV` ile servisleri bul.
Hangi servis **orada olmamalı**? Neden?

## ✅ Akılda kalsın

- Keşif sırası: kim ayakta → hangi port → hangi servis.
- `filtered`, arada bir güvenlik duvarı olduğunu söyler.
- Asıl bulgu "açık port" değil, "açık olmaması gereken port"tur.
