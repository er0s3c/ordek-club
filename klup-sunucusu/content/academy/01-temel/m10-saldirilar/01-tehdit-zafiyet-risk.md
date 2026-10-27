---
id: m10-01
tur: ders
baslik: Tehdit, zafiyet, risk — ve CIA üçlüsü
sure: 6
hedefler:
  - Tehdit, zafiyet ve risk kavramlarını ayırt etmek
  - Gizlilik, bütünlük ve erişilebilirlik ilkelerini açıklamak
gorseller:
  - id: m10-01-b
    tur: ai
    alt: "Koridorda kilidi bozuk bir dolapta duran laptop ve önünden geçen kalabalık; risk ölçen bir terazi kırmızıya eğik"
    prompt: "A school corridor with a locker whose lock hangs broken, a shiny laptop visible inside, and a busy crowd passing by; above the locker a large brass gauge needle points deep into the red zone."
  - id: m10-01-c
    tur: ai
    alt: "Üç ayaklı bir kalkan: kapalı göz (gizlilik), kırılmamış mühür (bütünlük) ve yanan fener (erişilebilirlik)"
    prompt: "A sturdy triangular shield standing on three legs: one leg shaped like a closed watchful eye, one like an unbroken wax seal, and one like a brightly lit lantern; a student leans on it confidently while a missing piece would tip it over."
---

# Tehdit, zafiyet, risk — ve CIA üçlüsü

> Bu üç kelime çoğu zaman karıştırılır. Bir güvenlikçi ise onları
> **ayrı ayrı** düşünür, çünkü her biri farklı bir önlem ister.

::cizgi[m10-01-sahne]

> 🕴️ **DOSYA: Fidyeci Ferhat** · *Fidye Patronu*
>
> ![Fidyeci Ferhat — Fidye Patronu](../../gorseller/karakter-ferhat.webp)
>
> **Tehdit:** Fidye yazılımı, zararlı yazılım, saldırı zinciri (kill chain), DDoS. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[ferhat-acilis]

## Üç kavram, bir örnek

![Koridorda kilidi bozuk bir dolapta duran laptop ve önünden geçen kalabalık; risk ölçen bir terazi kırmızıya eğik](../../gorseller/m10-01-b.webp)

Yurt odanın kapısı:

| Kavram | Tanım | Örnek |
|---|---|---|
| **Varlık** | Korumak istediğin şey | Laptopun |
| **Zafiyet** (vulnerability) | Zayıf nokta | Kapının kilidi bozuk |
| **Tehdit** (threat) | Zayıflığı kullanabilecek kişi/olay | Koridordan geçen biri |
| **Risk** | Olasılık × etki | Kilit bozuk + kalabalık koridor + pahalı laptop = **yüksek** |

Risk sıfırlanamaz, **yönetilir**: düzelt (kilidi tamir et), azalt (laptopu dolaba kilitle), devret (sigorta), kabul et.

## CIA üçlüsü

![Üç ayaklı bir kalkan: kapalı göz (gizlilik), kırılmamış mühür (bütünlük) ve yanan fener (erişilebilirlik)](../../gorseller/m10-01-c.webp)

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
