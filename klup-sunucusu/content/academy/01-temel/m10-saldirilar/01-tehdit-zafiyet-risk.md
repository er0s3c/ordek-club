---
id: m10-01
tur: ders
baslik: Tehdit, zafiyet, risk — ve CIA üçlüsü
sure: 6
hedefler:
  - Tehdit, zafiyet ve risk kavramlarını ayırt etmek
  - Gizlilik, bütünlük ve erişilebilirlik ilkelerini açıklamak
gorseller:
  - id: m10-01-a
    tur: ai
    karakter: ferhat
    alt: "Fidyeci Ferhat üzerinde mücevher duran üç ayaklı taburenin bir ayağını testereyle kesiyor"
    prompt: "A sturdy three-legged wooden stool on a stage under a spotlight, a precious glowing gem on its seat, each leg carved with a glowing symbol: a padlock, a balance scale, an open door. The villain kneels and saws at the leg with the open door symbol, chains rattling on his shoulders."
---

# Tehdit, zafiyet, risk — ve CIA üçlüsü

> Bu üç kelime çoğu zaman karıştırılır. Bir güvenlikçi ise onları
> **ayrı ayrı** düşünür, çünkü her biri farklı bir önlem ister.

![Fidyeci Ferhat üzerinde mücevher duran üç ayaklı taburenin bir ayağını testereyle kesiyor](../../gorseller/m10-01-a.webp)

> 🕴️ **DOSYA: Fidyeci Ferhat** · *Fidye Patronu*
>
> ![Fidyeci Ferhat — Fidye Patronu](../../gorseller/karakter-ferhat.webp)
>
> 📼 **Bölüm 10 — Fidye.** Şehrin hastanesi sabaha karşı kilitlendi; bütün ekranlarda tek bir asma kilit. Fidyeci Ferhat'ın zinciri yedi halkalı: keşiften sızmaya, sızmadan şifrelemeye. Senin işin tek bir halkayı kırmak.
>
> **Tehdit:** Fidye yazılımı, zararlı yazılım, saldırı zinciri (kill chain), DDoS. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

## Üç kavram, bir örnek

Yurt odanın kapısı:

| Kavram | Tanım | Örnek |
|---|---|---|
| **Varlık** | Korumak istediğin şey | Laptopun |
| **Zafiyet** (vulnerability) | Zayıf nokta | Kapının kilidi bozuk |
| **Tehdit** (threat) | Zayıflığı kullanabilecek kişi/olay | Koridordan geçen biri |
| **Risk** | Olasılık × etki | Kilit bozuk + kalabalık koridor + pahalı laptop = **yüksek** |

Risk sıfırlanamaz, **yönetilir**: düzelt (kilidi tamir et), azalt (laptopu dolaba kilitle), devret (sigorta), kabul et.

## CIA üçlüsü

Güvenliğin üç hedefi — biri eksilirse tabure devrilir:

| İlke | Soru | İhlal örneği |
|---|---|---|
| **Gizlilik** (Confidentiality) | Sadece yetkili kişi mi görüyor? | Not listesinin sızması |
| **Bütünlük** (Integrity) | Veri doğru ve değiştirilmemiş mi? | Notların izinsiz değiştirilmesi |
| **Erişilebilirlik** (Availability) | İhtiyaç anında ulaşılabiliyor mu? | Kayıt haftasında portalın çökmesi |

Her saldırıyı "CIA'nın hangisini bozuyor?" diye sınıflandırabilirsin.

## 🧪 Dene (3 dk)

Üç olayı CIA ilkelerinden biriyle eşle:
1. Fidye yazılımı dosyaları şifreledi.
2. Bir öğrenci başkasının ödevini görebildi.
3. Bir saldırgan banka hesap numarasını faturada değiştirdi.

<details><summary>Cevap</summary>1 → Erişilebilirlik · 2 → Gizlilik · 3 → Bütünlük</details>

## ✅ Akılda kalsın

- Zafiyet zayıf nokta, tehdit onu kullanabilecek olan, risk ikisinin buluşması.
- Risk yönetilir: düzelt, azalt, devret, kabul et.
- CIA: gizlilik, bütünlük, erişilebilirlik.
