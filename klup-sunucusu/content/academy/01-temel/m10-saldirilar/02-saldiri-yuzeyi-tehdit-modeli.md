---
id: m10-02
tur: ders
baslik: Saldırganın gözüyle bak — saldırı yüzeyi ve tehdit modelleme
sure: 7
hedefler:
  - Bir sistemin saldırı yüzeyini listelemek
  - Basit bir tehdit modeli çıkarmak
animasyonlar: [network-topology]
gorseller:
  - id: m10-02-a
    tur: ai
    karakter: ferhat
    alt: "Fidyeci Ferhat kale maketinin tüm girişlerine kırmızı bayraklar dikiyor"
    prompt: "A detailed tabletop model of a small castle with walls, gates, windows, a drawbridge and a hidden tunnel. The villain leans over the table planting small red flags at every possible entrance, including a tiny forgotten side window, planning his attack."
---

# Saldırganın gözüyle bak

> Savunmayı kurmadan önce sor: **Bir saldırgan buraya nereden girebilir?**
> Bu soruların hepsinin cevabı saldırı yüzeyindir.

![Fidyeci Ferhat kale maketinin tüm girişlerine kırmızı bayraklar dikiyor](../../gorseller/m10-02-a.webp)

## Saldırı yüzeyi

Bir sistemin dışarıyla temas ettiği **her nokta**:

| Tür | Kulüp sunucusu örneği |
|---|---|
| **Dijital** | Web sitesi, giriş sayfası, API, açık SSH portu |
| **İnsan** | Yöneticilerin e-postası, sosyal medya hesabı |
| **Fiziksel** | Sunucunun durduğu oda, USB girişleri |
| **Tedarik zinciri** | Kullanılan kütüphaneler, eklentiler, bulut hesabı |

Kural: **Yüzeyi küçült.** Kullanılmayan servis kapatılır, gereksiz hesap silinir, gereksiz port kapanır.

Bölümlendirilmiş bir ağda yüzeyin nasıl daraltıldığını gör:

::animasyon[network-topology]

## Dört soruluk tehdit modeli

Bir sistemi tasarlarken veya incelerken:

1. **Neyi koruyoruz?** (varlıklar: üye listesi, oturumlar, yönetici hesabı)
2. **Kim saldırabilir?** (dışarıdan bir bot, hevesli bir öğrenci, kötü niyetli eski üye)
3. **Nasıl saldırabilir?** (parola tahmini, phishing, yetkisiz API çağrısı)
4. **Ne yapacağız?** (MFA, hız sınırı, yetki kontrolü, log)

Bunu bir tabloya dökmek bile çoğu tasarım hatasını **kod yazılmadan önce** yakalar.

## 🧪 Dene (5 dk)

Kulübün etkinlik kayıt formu için dört soruluk tehdit modelini doldur. Her soruya en az bir cevap yaz.

## ✅ Akılda kalsın

- Saldırı yüzeyi: dijital, insan, fiziksel, tedarik zinciri.
- Yüzeyi küçült: kullanılmayanı kapat.
- Tehdit modeli: neyi, kimden, nasıl, ne yapacağız?
