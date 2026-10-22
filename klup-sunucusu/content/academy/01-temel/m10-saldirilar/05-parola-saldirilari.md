---
id: m10-05
tur: ders
baslik: Parolalara yönelik saldırılar
sure: 6
hedefler:
  - Brute-force, password spraying ve credential stuffing kavramlarını ayırt etmek
  - Her birine karşı savunmayı eşleştirmek
gorseller:
  - id: m10-05-a
    tur: ai
    karakter: ferhat
    alt: "Fidyeci Ferhat'ın robotu yüzlerce kapıda aynı anahtarı deniyor, kalkanlı kapıda takılıyor"
    prompt: "A long corridor with hundreds of identical doors. A clumsy robot carrying a huge keyring tries the same key on every door while the villain directs it from behind with crossed arms. At the far end, a door with a glowing shield emblem firmly blocks the robot."
---

# Parolalara yönelik saldırılar

> Saldırganların en sevdiği giriş kapısı hâlâ **parola**dır. Üç farklı yöntemle denerler.

![Fidyeci Ferhat'ın robotu yüzlerce kapıda aynı anahtarı deniyor, kalkanlı kapıda takılıyor](../../gorseller/m10-05-a.webp)

## Üç yöntem

| Yöntem | Nasıl? | Logda nasıl görünür? |
|---|---|---|
| **Brute-force** | **Tek hesapta** çok sayıda parola dener | Aynı kullanıcı, çok sayıda başarısız giriş |
| **Password spraying** | **Çok hesapta** birkaç yaygın parola (`Bahar2026!`) | Çok farklı kullanıcı, her birinde az deneme |
| **Credential stuffing** | Başka bir sitede **sızmış** kullanıcı adı/parola çiftlerini dener | Doğru parolalarla şaşırtıcı başarılı girişler |

Üçüncüsü en sinsisidir: senin hiçbir hatan olmadan, **başka bir sitenin** sızıntısı yüzünden hesabın düşer —
eğer aynı parolayı kullandıysan.

## Savunmalar

| Saldırı | En etkili savunma |
|---|---|
| Brute-force | Hız sınırı, geçici kilitleme, MFA |
| Password spraying | Yaygın parolaları yasaklamak, MFA, giriş anomalisi tespiti |
| Credential stuffing | **Her sitede farklı parola** + MFA |

Kullanıcı olarak senin payın: **parola yöneticisi + MFA** (M08). Bu ikisi üç saldırının da çoğunu boşa çıkarır.

Sunucu tarafında: SSH'ta parola girişini kapatıp yalnızca anahtar kabul etmek, kaba kuvveti neredeyse tamamen bitirir.

## Hesabım bir sızıntıda var mı?

Güvenilir sızıntı kontrol servisleri (ör. *Have I Been Pwned*) e-postanın bilinen sızıntılarda geçip geçmediğini gösterir.
Sadece **kendi** e-postanı kontrol et.

## 🧪 Dene (3 dk)

M07'deki `auth.log`'a tekrar bak: Gördüğün saldırı brute-force mu, spraying mi? Neden?

<details><summary>Cevap</summary>Brute-force: tek IP, büyük oranda tek hesap (deploy) üzerinde çok sayıda deneme.</details>

## ✅ Akılda kalsın

- Brute-force tek hesap, spraying çok hesap, stuffing sızmış parolalar.
- Farklı parola + MFA üçüne de karşı en güçlü kullanıcı savunmasıdır.
- Sunucuda hız sınırı ve anahtar tabanlı giriş kaba kuvveti durdurur.
