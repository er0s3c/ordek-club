---
id: c-07
tur: ders
baslik: "Linux adli bilişim: auth.log, journald, auditd ve kalıcılık"
sure: 8
hedefler:
  - Linux'ta oturum ve yetki loglarını incelemek
  - Yaygın kalıcılık noktalarını kontrol etmek
gorseller:
  - id: c-07-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer bodrum sunucu koridorunda yere serilmiş kâğıt şerit defteri paspaslıyor; yüksek raftaki gizli ikinci defter adımlarını yeniden yazmaya devam ediyor"
    prompt: "A long dim basement server hallway where a paper-tape logbook unrolls along the floor like a carpet, covered in tiny glowing abstract symbols. The villain mops the tape clean behind him step by step, looking satisfied, but on a high shelf above, a second hidden brass journal machine with a little spinning reel keeps printing fresh glowing marks of his every footstep."
---

# Linux adli bilişim: auth.log, journald, auditd ve kalıcılık

> Linux sunucular sessizdir ama unutkan değildir. Doğru dosyayı açan, kimin **ne zaman** girdiğini görür.
> 🧹 **İz 7:** Kulüp sunucusunda `deploy` hesabı bir gün parolayla girdi. Oysa o hesap hep anahtar kullanır.

![Temizlikçi Tamer bodrum sunucu koridorunda yere serilmiş kâğıt şerit defteri paspaslıyor; yüksek raftaki gizli ikinci defter adımlarını yeniden yazmaya devam ediyor](../../gorseller/c-07-a.webp)

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
