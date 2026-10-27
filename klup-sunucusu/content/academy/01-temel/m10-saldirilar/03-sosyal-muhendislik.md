---
id: m10-03
tur: ders
baslik: İnsanı hacklemek — sosyal mühendislik ve phishing
sure: 7
hedefler:
  - Sosyal mühendisliğin kullandığı psikolojik tetikleyicileri tanımak
  - Phishing türlerini ve savunmalarını açıklamak
animasyonlar: [phishing]
gorseller:
  - id: m10-03-b
    tur: ai
    alt: "Altı kukla ipiyle yönetilen bir insan; her ip ayrı bir duyguya bağlı: rozet, kum saati, korku gölgesi, gizemli kutu, yardım eli ve altın kese"
    prompt: "A person drawn as a marionette with six glowing strings attached, each string ending at a different object above: an official badge, a racing hourglass, a looming scary shadow, a mysterious half-open box, a hand asking for help, and a bag of gold coins. The person breaks free by cutting the strings with small scissors."
  - id: m10-03-c
    tur: ai
    alt: "Üç adım: avucunu kaldırıp duran öğrenci, ayrı bir telefondan arayarak doğrulayan öğrenci ve uyarı zilini çalan öğrenci"
    prompt: "Three panels in a row: a student raising a hand to stop in front of a suspicious envelope, the same student calling the real office from a separate desk phone to check, and the student ringing a small brass warning bell to alert classmates."
---

# İnsanı hacklemek

> Bir sistemi kırmak zor olabilir; **birini ikna etmek** çoğu zaman daha kolaydır.
> Sosyal mühendislik teknolojiyi değil, insan psikolojisini hedefler.

::cizgi[m10-03-sahne]

## Altı tetikleyici

![Altı kukla ipiyle yönetilen bir insan; her ip ayrı bir duyguya bağlı: rozet, kum saati, korku gölgesi, gizemli kutu, yardım eli ve altın kese](../../gorseller/m10-03-b.webp)

| Tetikleyici | Örnek cümle |
|---|---|
| **Otorite** | "Rektörlükten arıyorum." |
| **Aciliyet** | "10 dakika içinde onaylamazsanız hesabınız silinir." |
| **Korku** | "Hesabınızdan şüpheli giriş yapıldı!" |
| **Merak** | "Sınav sorularının sızdığı dosya ekte." |
| **Yardımseverlik** | "Kartımı unuttum, kapıyı tutar mısın?" |
| **Açgözlülük** | "Hediye çeki kazandınız." |

## Phishing ailesi

- **Phishing** — Toplu, sahte e-posta.
- **Spear phishing** — Hedefe özel hazırlanmış (adını, bölümünü bilir).
- **Smishing / vishing** — SMS / telefonla.
- **Quishing** — Sahte QR kod (afişin üstüne yapıştırılmış).

Bir phishing saldırısının baştan sona yaşam döngüsü:

::animasyon[phishing]

## Savunma: "dur, doğrula, bildir"

![Üç adım: avucunu kaldırıp duran öğrenci, ayrı bir telefondan arayarak doğrulayan öğrenci ve uyarı zilini çalan öğrenci](../../gorseller/m10-03-c.webp)

1. **Dur** — Aciliyet hissediyorsan bu bir işarettir.
2. **Doğrula** — Bildiğin bir kanaldan (resmî site, bilinen telefon) teyit et; mesajdaki bağlantıyı/numarayı kullanma.
3. **Bildir** — Tıkladıysan bile utanma, hemen bildir; erken bildirim zararı küçültür.

## 🧪 Dene (3 dk)

Son bir haftada aldığın bir reklam ya da bildirimde bu altı tetikleyiciden hangilerini görebiliyorsun?

## ✅ Akılda kalsın

- Sosyal mühendislik teknolojiyi değil insanı hedefler.
- Otorite, aciliyet, korku, merak, yardımseverlik, açgözlülük.
- Dur, bağımsız kanaldan doğrula, bildir.
