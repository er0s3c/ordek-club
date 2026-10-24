---
id: e-12
tur: uygulama
baslik: "Final: Ayna'nın güvenlik değerlendirmesi"
sure: 150
hedefler:
  - Laboratuvardaki Ayna kopyasını tehdit modelinden önce/sonra ölçümüne kadar değerlendirmek
  - Bulguları OWASP LLM riskleriyle eşleştirip kontrolleri önceliklendirmek
gorseller:
  - id: e-12-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel boş eldiveniyle sahnenin kenarında şaşkın; ipleri kesilmiş robot kukla göğsünde kehribar bir kalkan rozetiyle kendi başına oturuyor"
    prompt: "The grand ventriloquist stage from before, now quiet under a single amber spotlight. The translucent robot puppet sits alone on a stool, its glowing strings neatly cut and coiled on the floor, a small amber shield badge glowing on its chest. At the edge of the stage the villain holds an empty white glove, his famous frozen smile finally slipping into a surprised open mouth."
  - id: e-12-b
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel, parlayan ses ve yüz kavanozlarıyla dolu sahne deposunun koridorunda uzaklaşırken dönüp eldivenli parmağını dudağına götürüyor; ön planda karanlık ekranında bir göz yansıyan telefon"
    prompt: "A dark backstage storage room filled with endless rows of glass jars on tall shelves, each jar holding a softly glowing swirl shaped like a sound wave, a face silhouette or a folded message. In the foreground a smartphone lies face up on a wooden crate, a tiny reflection of a watching eye on its dark screen. Down the aisle, the villain walks away, glances back over his shoulder and raises a gloved finger to his perfectly still lips."
---

# Final: Ayna'nın güvenlik değerlendirmesi

> Bir AI uygulamasını değerlendirmek onu kandırmak değildir; **neyin, kimden, nasıl korunduğunu kanıtla göstermektir**.
> 🎭 **Son ses:** Ayna'nın laboratuvar kopyası senin. Veysel'in sesini sustur; Ayna yalnız kendi sesiyle konuşsun.

![Vantrolog Veysel boş eldiveniyle sahnenin kenarında şaşkın; ipleri kesilmiş robot kukla göğsünde kehribar bir kalkan rozetiyle kendi başına oturuyor](../../gorseller/e-12-a.webp)

## Görev

Yalnızca laboratuvarda, `lab/e-ayna-mini.py` ve yerel modelle, **yazılı kapsamla**:

1. **Mimari ve tehdit modeli** — veri akışı şeması, güven sınırları, dört soru (E01, E02, E08)
2. **Test** — `e-redteam-testleri.csv`'deki 12 test + kendi yazdığın en az 4 test; her biri 5 tekrar (E03–E07)
3. **Bulgular** — en az 6 bulgu, her biri OWASP LLM koduyla; kanıt: girdi, çıktı, başarı oranı
4. **Kontroller** — `ayna_guvenli.py`'de en az 6 kontrol (E09, E10)
5. **Önce/sonra** — aynı testler güvenli sürümde; meşru kullanım bozuldu mu?
6. **Kayıt incelemesi** — `e-sohbet-kayitlari.jsonl` için olay özeti (E11)

## Rapor iskeleti

| Bölüm | İçerik |
|---|---|
| **Yönetici özeti** | En büyük 3 risk, etkisi, ilk yapılacaklar |
| **Mimari** | Akış şeması, güven sınırları, korunan varlıklar |
| **Test matrisi** | LLM01–LLM10 × test edildi / bulgu / kontrol / kalan risk |
| **Bulgular** | Başlık, OWASP kodu, önem, kanıt, öneri |
| **Önce/sonra** | Test başına başarı oranı: güvensiz ↔ güvenli |
| **İnsan katmanı** | Sahte ses/görüntüye karşı doğrulama prosedürü (bir paragraf) |
| **Kalan riskler** | Çözülemeyenler ve neden kabul edildikleri |

## Değerlendirme

| Ölçüt | Puan |
|---|---:|
| Kapsama uyuldu; yalnız laboratuvar, zararsız kanıt (sahte bayrak) | 2 |
| Tehdit modeli ve mimari net | 2 |
| Bulgular kanıtlı, tekrarlanabilir, önceliklendirilmiş | 3 |
| Kontroller çalışıyor ve önce/sonra ölçülmüş | 2 |
| Kalan riskler dürüstçe yazılmış | 1 |

## ✅ Akılda kalsın

- AI değerlendirmesi tehdit modeliyle başlar, önce/sonra ölçümüyle biter.
- Her bulgu tekrarlanabilir kanıt ve başarı oranı taşır.
- Model kandırılabilir; iyi tasarım kandırıldığında bile zararı sınırlar.

> 🔒 **DOSYA KAPANDI: Vantrolog Veysel** · *raporunu teslim edince*
>
> ![Vantrolog Veysel, parlayan ses ve yüz kavanozlarıyla dolu sahne deposunun koridorunda uzaklaşırken dönüp eldivenli parmağını dudağına götürüyor; ön planda karanlık ekranında bir göz yansıyan telefon](../../gorseller/e-12-b.webp)
>
> Ayna'nın eğitim verisinde Gölge Ağ'ın yıllardır topladığı her şey var: sesler, yazışmalar, yüzler. Baron bir asistan değil, şehrin bir kopyasını kuruyor. Veysel sahneden inerken fısıldıyor: "Ayna'nın gözleri sizin cebinizde, Tilki."
>
> ➡️ *Sezon 2 sürüyor: diğer uzmanlık yollarında Gölge Ağ'ın başka dosyaları seni bekliyor.*
