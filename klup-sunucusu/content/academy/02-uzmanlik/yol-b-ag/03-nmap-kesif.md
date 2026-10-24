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
  - id: b-03-a
    tur: ai
    karakter: tarik
    alt: "Gece bir sokakta Tünelci Tarık her binanın kapısını tek tek yokluyor; açık kapılardan yeşil ışık sızıyor"
    prompt: "A dark street of identical numbered buildings at night. The villain walks along the row knocking lightly on each door with his cable pliers and listening; most doors stay dark and silent, but a few creak open spilling green light, and he marks those on a small map clipped to his parka."
---

# Nmap ile keşif: hangi kapılar açık?

> Savunmanın ilk sorusu: **ağımda ne var ve hangi kapıları açık?** Saldırganın ilk sorusu da aynıdır.
> 🕳️ **Tünel 3:** Tarık laboratuvar ağında her kapıyı çaldı. Hangilerinin açıldığını ondan önce bil.

![Gece bir sokakta Tünelci Tarık her binanın kapısını tek tek yokluyor; açık kapılardan yeşil ışık sızıyor](../../gorseller/b-03-a.webp)

## Üç adım

| Adım | Soru | Örnek |
|---|---|---|
| **Host keşfi** | Kim ayakta? | `nmap -sn 10.66.0.0/24` |
| **Port taraması** | Hangi kapılar açık? | `nmap 10.66.0.20` (en yaygın 1000 port) |
| **Servis/sürüm** | Kapının ardında ne var? | `nmap -sV -p 22,80,443 10.66.0.20` |

::animasyon[tcp-handshake]

## Çıktıyı okumak

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
