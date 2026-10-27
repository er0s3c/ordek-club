---
id: m08-01
tur: ders
baslik: Bir sırrı herkesin önünde nasıl saklarsın?
sure: 7
hedefler:
  - Kriptografi ve kriptoanalizi ayırt etmek
  - Simetrik ve asimetrik şifrelemeyi karşılaştırmak
gorseller:
  - id: m08-01-b
    tur: ai
    alt: "İki arkadaş aynı anahtarın iki kopyasıyla aynı sandığı kilitleyip açıyor; anahtarı taşıyan kurye yolda gözetleniyor"
    prompt: "Two friends at opposite ends of a long table each hold an identical copy of the same brass key, locking and unlocking the same small chest that slides between them, while in the middle a courier carrying a spare key copy is being watched by shadowy eyes from a dark doorway."
  - id: m08-01-c
    tur: ai
    alt: "Herkese dağıtılan açık asma kilitler ve yalnızca sahibinin boynunda duran tek bir anahtar"
    prompt: "A person stands beside a basket full of open padlocks, handing them out freely to a line of people, each of whom snaps one shut on their own box and sends it back; only the person wears the single key that opens them all on a chain around their neck."
---

# Bir sırrı herkesin önünde nasıl saklarsın?

> İnternetteki her mesaj, onlarca bilgisayarın üzerinden geçer.
> **Şifreleme**, mesajı görenlerin onu okuyamamasını sağlar.

::cizgi[m08-01-sahne]

> 🕴️ **DOSYA: Kasa Kıran Kadir** · *Kasa Hırsızı*
>
> ![Kasa Kıran Kadir — Kasa Hırsızı](../../gorseller/karakter-kadir.webp)
>
> **Tehdit:** Parola kırma, zayıf hash'ler, tuzsuz parolalar, sızmış parola listeleri. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[kadir-acilis]

## İki taraf

- **Kriptografi** — Bilgiyi koruyan yöntemleri tasarlamak.
- **Kriptoanaliz** — Bu yöntemleri kırmaya çalışmak (zayıflıklarını bulmak).

Kural: **Kendi şifreleme algoritmanı icat etme.** Yıllarca analiz edilmiş standartları kullan (AES, RSA, ECC).

## Simetrik şifreleme: tek anahtar

![İki arkadaş aynı anahtarın iki kopyasıyla aynı sandığı kilitleyip açıyor; anahtarı taşıyan kurye yolda gözetleniyor](../../gorseller/m08-01-b.webp)

Kilitleyen ve açan **aynı** anahtar.

```text
"Merhaba" + anahtar K  →  şifreleme  →  "x9#Lq2…"
"x9#Lq2…" + anahtar K  →  çözme      →  "Merhaba"
```

- ✅ Çok hızlı (diskler, dosyalar, büyük veriler)
- ❌ Anahtarı karşı tarafa **güvenle** nasıl ulaştıracaksın?
- Örnek: **AES**

## Asimetrik şifreleme: anahtar çifti

![Herkese dağıtılan açık asma kilitler ve yalnızca sahibinin boynunda duran tek bir anahtar](../../gorseller/m08-01-c.webp)

- **Açık anahtar** (public) — herkese verilir; mesajı **kilitler**.
- **Özel anahtar** (private) — yalnızca sende; kilidi **açar**.

Herkese açık asma kilit dağıtıp anahtarını kendinde tutmak gibi.

- ✅ Anahtar paylaşma sorunu çözülür
- ❌ Yavaş
- Örnek: **RSA**, **ECC**

## Gerçek hayatta ikisi birlikte

HTTPS'te önce asimetrik yöntemle ortak bir anahtarda anlaşılır, sonra veri hızlı simetrik şifreleme ile gider (M05-06).

## 🧪 Dene (3 dk)

Hangisi uygun? (a) laptop diskini şifrelemek, (b) hiç tanışmadığın biriyle internetten ilk kez gizli konuşmaya başlamak.

<details><summary>Cevap</summary>(a) Simetrik — tek kişi, çok veri. (b) Önce asimetrik ile anahtar anlaşması, sonra simetrik.</details>

## ✅ Akılda kalsın

- Kendi algoritmanı icat etme; standartları kullan.
- Simetrik: tek anahtar, hızlı. Asimetrik: anahtar çifti, paylaşımı kolay.
- Gerçek sistemler ikisini birlikte kullanır.
