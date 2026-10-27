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
  - id: m10-02-b
    tur: ai
    alt: "Masada kale maketi etrafında dört soru nesnesi: değerli taç, gözetleyen dürbün, merdiven ve kalkan"
    prompt: "A planning table with a small castle model in the center and four objects placed at its corners like a board game: a glowing crown for what we protect, binoculars for who might come, a ladder for how they would climb in, and a shield for what we will do. A team leans over the table with pencils."
---

# Saldırganın gözüyle bak

> Savunmayı kurmadan önce sor: **Bir saldırgan buraya nereden girebilir?**
> Bu soruların hepsinin cevabı saldırı yüzeyindir.

::cizgi[m10-02-sahne]

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

![Masada kale maketi etrafında dört soru nesnesi: değerli taç, gözetleyen dürbün, merdiven ve kalkan](../../gorseller/m10-02-b.webp)

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
