---
id: b-09
tur: ders
baslik: "Linux sunucu güvenliği: SSH, sudo, SUID ve sertleştirme"
sure: 8
hedefler:
  - SSH ve sudo yapılandırmasını güvenli hâle getirmek
  - SUID dosyalarını ve gereksiz servisleri denetlemek
gorseller:
  - id: b-09-b
    tur: ai
    alt: "Sunucu kapısında anahtarla açılan kilit; parolayla açılmaya çalışılan ikinci kapı tuğlayla örülmüş"
    prompt: "A server room door with a precise key lock that opens only for a matching key cut held by an administrator, while a second door next to it that used to accept spoken passwords has been bricked up and a robot outside is shouting guesses at the wall in vain."
---

# Linux sunucu güvenliği: SSH, sudo, SUID ve sertleştirme

> Ön kapı çelik olabilir. Saldırgan yine de **unutulmuş servis kapağını** arar.
> 🕳️ **Tünel 9:** Laboratuvar sunucusunda `find` komutu root yetkisiyle çalışıyor. Neden?

::cizgi[b-09-sahne]

## SSH

![Sunucu kapısında anahtarla açılan kilit; parolayla açılmaya çalışılan ikinci kapı tuğlayla örülmüş](../../gorseller/b-09-b.webp)

`/etc/ssh/sshd_config` içinde:

```text
PermitRootLogin no
PasswordAuthentication no      # yalnızca anahtar
MaxAuthTries 3
AllowUsers deploy yonetici
```

Ek olarak: `fail2ban` ile deneme sınırı, anahtarlara parola (passphrase), SSH'yi yalnızca yönetim ağına açmak.

## sudo

```bash
sudo -l      # bu kullanıcı neyi root olarak çalıştırabilir?
```

`ALL=(ALL) NOPASSWD: ALL` her şeyi verir. Daha sinsi olanı: **görünüşte zararsız** bir programa sudo izni.
`find`, `vim`, `less`, `tar` gibi programlar kendi içinden komut çalıştırabilir → root kabuğu.

## SUID

SUID bitli bir dosya, sahibinin (çoğu zaman root) yetkisiyle çalışır.

```bash
find / -perm -4000 -type f 2>/dev/null
```

Listede `passwd`, `sudo` gibi beklenenler olur. **Beklenmeyen** bir dosya (ör. `find`, `python3`) ciddi bulgudur.

## Sertleştirme kontrol listesi

| Alan | Kontrol |
|---|---|
| Güncelleme | Otomatik güvenlik güncellemeleri açık mı? |
| Servisler | `ss -tulpn` — dinleyen her servis gerekli mi? |
| Kullanıcılar | Kullanılmayan hesaplar kilitli mi, parolasız hesap var mı? |
| Dosyalar | Herkesin yazabildiği (`777`) klasörler, SUID listesi |
| Loglar | `auth.log` merkezi bir yere gidiyor mu? |
| Firewall | `ufw`/`nftables` ile varsayılan reddet |

## 🧪 Dene (5 dk)

Laboratuvar sunucusunda `sudo -l`, `ss -tulpn` ve SUID taramasını çalıştır.
Her biri için "olması gerekiyor mu?" sorusunu cevapla ve bir düzeltme öner.

## ✅ Akılda kalsın

- SSH: root girişi kapalı, yalnızca anahtar, deneme sınırı.
- Zararsız görünen programa sudo ya da SUID vermek root vermektir.
- Dinleyen her servis ve her SUID dosyası bir gerekçe ister.
