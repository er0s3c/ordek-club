---
id: c-07
tur: ders
baslik: "Linux adli bilişim: auth.log, journald, auditd ve kalıcılık"
sure: 8
hedefler:
  - Linux'ta oturum ve yetki loglarını incelemek
  - Yaygın kalıcılık noktalarını kontrol etmek
gorseller:
  - id: c-07-b
    tur: ai
    alt: "Bir evin dört gizli köşesi: kapıya asılmış yedek anahtar, takvime eklenmiş tekrar eden randevu, açılışta çalan müzik kutusu ve misafir defterine eklenmiş yabancı isim"
    prompt: "A cozy house interior inspected by a detective with a flashlight, revealing four hidden spots: a spare key taped under the doormat, a wall calendar with the same small mark on every day, a music box that plays whenever the front door opens, and a guest book with an extra stranger's signature glowing green."
---

# Linux adli bilişim: auth.log, journald, auditd ve kalıcılık

> Linux sunucular sessizdir ama unutkan değildir. Doğru dosyayı açan, kimin **ne zaman** girdiğini görür.
> 🧹 **İz 7:** Kulüp sunucusunda `deploy` hesabı bir gün parolayla girdi. Oysa o hesap hep anahtar kullanır.

::cizgi[c-07-sahne]

## Nereye bakılır?

| Kaynak | Ne anlatır? |
|---|---|
| `/var/log/auth.log` (Debian/Ubuntu) | SSH girişleri, `sudo` kullanımı |
| `journalctl` (journald) | Servislerin ve sistemin ikili (binary) günlüğü |
| `last`, `lastb` | Başarılı ve başarısız oturum geçmişi |
| auditd (`/var/log/audit/audit.log`) | Kurala göre dosya erişimi, komut çalıştırma |
| `~/.bash_history` | Komut geçmişi; kolay silinir, tek başına güvenilmez |

```bash
grep "Accepted password" /var/log/auth.log
journalctl -u ssh --since "2026-03-03 15:00" --until "2026-03-03 16:00"
sudo ausearch -k kulup-izle -i
```

Canlı bir sunucuda inceleme yaparken önce logların **kopyasını** al ve hash'le; analizi kopyada yap.
Komutlarını ve saatini not et: senin yaptığın her şey de bir iz bırakır.

## Kalıcılık (persistence) noktaları

![Bir evin dört gizli köşesi: kapıya asılmış yedek anahtar, takvime eklenmiş tekrar eden randevu, açılışta çalan müzik kutusu ve misafir defterine eklenmiş yabancı isim](../../gorseller/c-07-b.webp)

Saldırgan geri dönmek ister. Kontrol listesi:

- `~/.ssh/authorized_keys` — tanımadığın bir anahtar var mı?
- `crontab -l`, `/etc/cron.*` — yeni zamanlanmış iş?
- `systemctl list-unit-files --state=enabled` — tanımadığın servis?
- `/etc/passwd` — UID 0 olan ikinci bir hesap?

## Silinen logun izi

Saldırgan `auth.log`'u kırpabilir, `history -c` çalıştırabilir. Savunucu ne görür?

- Log dosyasında **zaman boşluğu** ya da beklenmedik küçülme
- journald'daki kayıtla `auth.log` arasında **uyuşmazlık**
- auditd kuralı varsa log dosyasına yazma girişimi
- Merkezî SIEM'e syslog ile gönderilmiş **kopya**

## 🧪 Dene (5 dk)

Sentetik log ile:

```bash
grep -c "Failed password" /opt/akademi/auth.log
grep "Failed password" /opt/akademi/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -rn | head -3
grep "Accepted password" /opt/akademi/auth.log
```

En çok deneme yapan IP hangisi? Başarılı parola girişi aynı IP'den mi? Bu IP'yi Windows kayıtlarında (`c-windows-olaylar.jsonl`) da görüyor musun?

## ✅ Akılda kalsın

- auth.log, journald ve auditd birbirini doğrular; biri silinse diğeri konuşur.
- Kalıcılık için anahtarlara, cron'a, servislere ve UID 0 hesaplara bak.
- Log boşluğu ve uyuşmazlık, silme girişiminin kendisidir.
