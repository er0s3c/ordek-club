---
id: g-12
tur: uygulama
baslik: "Final: eğitim örneği için zararlı yazılım analiz raporu"
sure: 150
hedefler:
  - Eğitmenin verdiği zararsız eğitim örneğini triage'dan dinamik analize kadar incelemek
  - Bulguları IOC listesi, YARA kuralı ve uygulanabilir önerilerle raporlamak
gorseller:
  - id: g-12-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri durdurulmuş saat kulesinin önünde tabureye çökmüş; her dişli kehribar bir kıskaçla sabitlenmiş, böcekleri cam kavanozlarda sıra sıra dizilmiş"
    prompt: "Inside a towering clockwork mechanism, every great gear has been gently held still by a small glowing amber clamp, and the giant clock hands are frozen just before the hour. Rows of glass jars on a shelf hold the clockwork beetles, neatly sorted and resting. The villain sits on a low stool at the foot of the mechanism, his loupe in his lap, nodding slowly as if quietly impressed."
  - id: g-12-b
    tur: ai
    karakter: sabri
    alt: "Kadife bir örtü üzerinde açılmış mekanik bir böceğin içinde parlayan eski bir altın anahtar; yanındaki küçük aynada uzaktan uyanan belirsiz bir ışık var"
    prompt: "On a velvet cloth lies an opened clockwork beetle, its shell hinged back. Inside, among the tiny gears, rests a small old golden key glowing faintly. Next to it a little hand mirror reflects a dim, distant glow, as if something were slowly waking up inside the glass. In the shadows of the workshop behind, the villain's silhouette with his loupe turns away while the pendulum of a tall clock keeps swinging."
---

# Final: eğitim örneği için zararlı yazılım analiz raporu

> Analiz, rapor olmadan bitmez: bulduğun her şey, başka bir savunmacının **dakikalar içinde kullanabileceği** bir şeye dönüşmeli.
> ⚙️ **Son çark:** Saat kulesindeki son böcek kafeste. Onu güvenle aç, nasıl çalıştığını yaz ve saati durdur.

![Saatçi Sabri durdurulmuş saat kulesinin önünde tabureye çökmüş; her dişli kehribar bir kıskaçla sabitlenmiş, böcekleri cam kavanozlarda sıra sıra dizilmiş](../../gorseller/g-12-a.webp)

## Görev

Eğitmenin verdiği **zararsız eğitim örneğini** (parola korumalı arşivde) izole analiz VM'inde incele:

1. **Triage** — tür, MD5 ve SHA-256, boyut, derleyici / paketleyici (G02, G04)
2. **Statik analiz** — strings, import'lar, bölümler, entropi, önemli fonksiyonlar (G03, G04, G06)
3. **Dinamik analiz** — süreç ağacı, dosya, registry, ağ (sahte servislerle), analizden kaçma izleri (G05, G08)
4. **IOC listesi** — en az 8 gösterge: dosya, host ve ağ (G08)
5. **YARA kuralı** — örneği yakalayan, temiz dosyalarda sessiz kalan (G11)
6. **Öneriler** — tespit, kalıcılık dahil temizlik, önleme ve sertleştirme (G07, G10)

**Kurallar:** ağ kapalı ya da host-only; snapshot'tan başla, snapshot'a dön; örnek VM dışına çıkmaz.
Rapora yalnızca hash'ler, log satırları ve ekran görüntüleri girer.

## Rapor iskeleti

| Bölüm | İçerik |
|---|---|
| **Yönetici özeti** | Ne bu, ne yapıyor, risk düzeyi, ilk 3 eylem (yarım sayfa) |
| **Örnek kimliği** | Ad, hash'ler, tür, boyut, imza, paketleyici |
| **Statik bulgular** | Önemli dizeler, import'lar, şüpheli fonksiyonlar (adres + açıklama) |
| **Dinamik bulgular** | Süreç ağacı, dosya / registry / ağ etkinliği, kalıcılık |
| **IOC tablosu** | Tür → değer → bağlam |
| **Tespit** | YARA kuralı + bir davranış kuralı fikri |
| **Öneriler** | Temizlik adımları, engelleme, sertleştirme |
| **Paylaşım** | TLP (Traffic Light Protocol) etiketi: CLEAR, GREEN, AMBER ya da RED |

## Değerlendirme

| Ölçüt | Puan |
|---|---:|
| Güvenlik kurallarına uyuldu (izole VM, snapshot, ağ yok) | 2 |
| Triage ve statik bulgular doğru ve kanıtlı | 2 |
| Dinamik bulgular log ya da ekran görüntüsüyle destekli | 2 |
| IOC'ler kullanılabilir; YARA kuralı çalışıyor, yanlış pozitif yok | 2 |
| Öneriler uygulanabilir, rapor okunaklı, TLP doğru seçilmiş | 2 |

## ✅ Akılda kalsın

- Analiz, başkasının kullanabileceği bir rapora dönüşünce biter.
- Her bulgu kanıtlıdır: hash, adres, log satırı, ekran görüntüsü.
- Örnek laboratuvardan çıkmaz; yalnızca bilgisi, TLP'ye uygun paylaşılır.

> 🔒 **DOSYA KAPANDI: Saatçi Sabri** · *raporunu teslim edince*
>
> ![Kadife bir örtü üzerinde açılmış mekanik bir böceğin içinde parlayan eski bir altın anahtar; yanındaki küçük aynada uzaktan uyanan belirsiz bir ışık var](../../gorseller/g-12-b.webp)
>
> Saat durdu. Böceğin içindeki imza anahtarı yirmi yıl öncesine gidiyor: o gece liman bankasında kullanılan anahtar. Ve son satır yeni bir geri sayım başlatıyor; bitişi, Ayna'nın uyanacağı gece. Sezon 3: Ayna.
>
> ➡️ *Sezon 2 burada bitiyor. Sezon 3: Ayna yakında.*
