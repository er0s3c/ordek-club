---
id: b-08
tur: ders
baslik: "Windows Server ve Active Directory: krallığın anahtarları"
sure: 8
hedefler:
  - Domain, Kerberos ve Group Policy kavramlarını açıklamak
  - Active Directory'deki tipik yanlış yapılandırmaları tanımak
gorseller:
  - id: b-08-a
    tur: ai
    karakter: tarik
    alt: "Tünelci Tarık bir şatonun anahtar odasında, her kapıyı açan altın ana anahtarın asılı olduğu panoya uzanıyor"
    prompt: "Inside a castle keep, a grand key room with a huge wall board holding hundreds of small keys for every room of the castle, and at the very top one ornate golden master key glowing softly. The villain climbs a rolling library ladder toward the golden key, his green headlamp reflecting on the brass hooks."
---

# Windows Server ve Active Directory: krallığın anahtarları

> Bir kurumda kim kimdir, kim neye erişir — hepsi **Active Directory**'de yazar. Onu ele geçiren her şeyi ele geçirir.
> 🕳️ **Tünel 8:** Laboratuvar domain'inde 14 kişi "Domain Admins" grubunda. Bunlardan biri bir servis hesabı.

![Tünelci Tarık bir şatonun anahtar odasında, her kapıyı açan altın ana anahtarın asılı olduğu panoya uzanıyor](../../gorseller/b-08-a.webp)

## Temel kavramlar

| Kavram | Ne demek? |
|---|---|
| **Domain** | Merkezden yönetilen kullanıcı ve bilgisayar topluluğu (`kampus.test`) |
| **Domain Controller (DC)** | Kimlikleri doğrulayan sunucu; krallığın kalbi |
| **OU** | Kullanıcı ve bilgisayarları düzenleyen klasörler |
| **Group Policy (GPO)** | Binlerce bilgisayara tek yerden ayar gönderir |
| **Kerberos** | Parolayı ağda göndermeden **bilet** ile kimlik doğrulama |

## Kerberos kısaca

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
