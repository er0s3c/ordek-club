---
id: m07-07
tur: uygulama
baslik: "Uygulama: Güvenlik Günlüğü Dedektifi"
sure: 40
hedefler:
  - Örnek log dosyasındaki başarısız oturum açma kayıtlarını sayan bir program yazmak
  - Bulguyu bir saldırı hikâyesine dönüştürmek
gorseller:
  - id: m07-07-b
    tur: ai
    alt: "Duvara asılmış uzun bir zaman şeridi; sayısız kırmızı başarısız deneme işaretinin ardından tek bir yeşil başarılı giriş işareti"
    prompt: "A detective pins a long horizontal paper timeline across an office wall: a dense cluster of many small red cross marks all coming from the same arrow, followed at the very end by a single green tick mark circled in chalk, the detective pointing at it with a pencil."
---

# Uygulama: Güvenlik Günlüğü Dedektifi

> Kurgusal **kulup-srv** sunucusunun yöneticisi bir sabah şunu soruyor:
> *"Dün bir şey oldu mu? Loglara bakar mısın?"* Elinde `/opt/akademi/auth.log` var.

::cizgi[m07-07-sahne]

## Görev 1 — Program (zorunlu)

`dedektif.py` adında bir program yaz. Şunları yazdırsın:

1. Toplam başarısız giriş sayısı
2. IP başına başarısız giriş sayısı, en çoktan aza (ilk 5)
3. **Var olmayan** kullanıcı adlarıyla yapılan denemeler (`invalid user`)

## Görev 2 — Hikâye (zorunlu)

![Duvara asılmış uzun bir zaman şeridi; sayısız kırmızı başarısız deneme işaretinin ardından tek bir yeşil başarılı giriş işareti](../../gorseller/m07-07-b.webp)

Programının çıktısına bakarak şu soruları cevapla:

- Hangi IP diğerlerinden **farklı** davranıyor? Nasıl farklı?
- Bu IP'nin denemeleri ne kadar sürede yapıldı?
- O IP'den sonra **başarılı** bir giriş var mı? Hangi hesapla, hangi yöntemle?
- Yöneticiye ne önerirsin? (en az 3 madde)

## Görev 3 — Bonus

Aynı IP'den **1 dakika içinde 10'dan fazla** başarısız deneme varsa "ALARM" yazdıran bir kural ekle.

## Teslim

`dedektif.py` + programın çıktısı + Görev 2 cevapları (en fazla 200 kelime).

<details><summary>İpucu: başarılı girişleri bulmak</summary>Başarılı girişler <code>Accepted</code> ile başlar. <code>Accepted publickey</code> ile <code>Accepted password</code> arasındaki fark da bir ipucudur.</details>

<details><summary>Eğitmen notu: beklenen bulgular</summary>135 başarısız giriş. 203.0.113.66 yaklaşık 2–3 dakikada 58 deneme yapıyor (deploy ve invalid user admin), ardından <code>Accepted password for deploy</code> geliyor: kaba kuvvet başarıya ulaşmış. Diğer kullanıcılar normalde publickey ile giriyor. Beklenen öneriler: deploy parolasını değiştir ve oturumlarını kapat, SSH'ta parola girişini kapat (yalnız anahtar), fail2ban/hız sınırı, 203.0.113.66'yı engelle, deploy hesabıyla sonrasında ne yapıldığını incele.</details>

## ✅ Akılda kalsın

- Sayılar "ne oldu?" sorusuna, zaman "nasıl oldu?" sorusuna cevap verir.
- Çok sayıda başarısızlıktan sonra gelen tek başarı en önemli satırdır.
- İyi bir bulgu öneriyle biter.
