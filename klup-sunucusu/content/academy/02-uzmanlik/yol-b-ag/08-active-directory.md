---
id: b-08
tur: ders
baslik: "Windows Server ve Active Directory: krallığın anahtarları"
sure: 8
hedefler:
  - Domain, Kerberos ve Group Policy kavramlarını açıklamak
  - Active Directory'deki tipik yanlış yapılandırmaları tanımak
gorseller:
  - id: b-08-b
    tur: ai
    alt: "Şatoda bilet sistemi: muhafız önce genel giriş bileti veriyor, sonra her oda için ayrı oda bileti alınıyor"
    prompt: "A castle ticket office with a three-headed guard dog statue at the gate: a visitor first receives a general entry pass from a clerk, then exchanges it at a second window for small room-specific tickets, and finally shows a room ticket at a single door to enter."
---

# Windows Server ve Active Directory: krallığın anahtarları

> Bir kurumda kim kimdir, kim neye erişir — hepsi **Active Directory**'de yazar. Onu ele geçiren her şeyi ele geçirir.
> 🕳️ **Tünel 8:** Laboratuvar domain'inde 14 kişi "Domain Admins" grubunda. Bunlardan biri bir servis hesabı.

::cizgi[b-08-sahne]

## Temel kavramlar

| Kavram | Ne demek? |
|---|---|
| **Domain** | Merkezden yönetilen kullanıcı ve bilgisayar topluluğu (`kampus.test`) |
| **Domain Controller (DC)** | Kimlikleri doğrulayan sunucu; krallığın kalbi |
| **OU** | Kullanıcı ve bilgisayarları düzenleyen klasörler |
| **Group Policy (GPO)** | Binlerce bilgisayara tek yerden ayar gönderir |
| **Kerberos** | Parolayı ağda göndermeden **bilet** ile kimlik doğrulama |

## Kerberos kısaca

![Şatoda bilet sistemi: muhafız önce genel giriş bileti veriyor, sonra her oda için ayrı oda bileti alınıyor](../../gorseller/b-08-b.webp)

Kullanıcı giriş yapınca DC'den bir **bilet çıkaran bilet** (TGT) alır. Bir servise erişmek isteyince
TGT'yi gösterip o servise özel bilet alır. Parola ağda dolaşmaz — ama biletler ve servis hesapları **değerli hedeflerdir**.

## Tipik yanlış yapılandırmalar

- **Fazla yönetici:** Domain Admins grubunda gereğinden çok kişi ve servis hesabı.
- **Zayıf servis hesabı parolaları:** servis biletleri çevrimdışı kırılmaya açıktır.
- **Eski kimlik doğrulama:** NTLMv1, SMB imzalamanın kapalı olması.
- **Her yerde aynı yerel yönetici parolası:** bir makine düşerse hepsi düşer.
- Paylaşımlarda ve betiklerde **açık parolalar**.

## Savunma

Katmanlı yönetim (yöneticiler günlük işte yönetici hesabı kullanmaz), yönetilen servis hesapları (gMSA),
LAPS ile her makineye farklı yerel yönetici parolası, NTLM'i kısıtlama, SMB imzalama, DC olay loglarının izlenmesi.

## 🧪 Dene (5 dk)

Laboratuvar domain'ine bağlı bir makinede (yalnızca laboratuvarda):

```powershell
net group "Domain Admins" /domain
gpresult /r
```

Kaç yönetici var? Hangi GPO'lar uygulanıyor? Bir yönetici hesabı neden günlük işler için kullanılmamalı?

## ✅ Akılda kalsın

- AD kurumun kimlik haritasıdır; DC krallığın kalbidir.
- Kerberos parolayı değil bileti dolaştırır; servis hesapları güçlü parola ister.
- Az yönetici, farklı yerel parolalar, izlenen DC logları.
