---
id: g-00
tur: bilgi
baslik: "Yol G — Zararlı Yazılım Analizi ve Tersine Mühendislik"
sure: 3
gorseller:
  - id: g-00-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri, açık bir dev cep saatinin içinden sıra sıra çıkan kurmalı böceklerini gururla izliyor; böceklerden biri tezgâhtaki cam fanusun altına alınmış, büyüteçle inceleniyor"
    prompt: "In a dim old watchmaker's workshop, a giant pocket watch lies open on the workbench like a doorway, and a parade of glowing clockwork beetles marches out of it in a neat line toward a faintly glowing server rack in the corner. The villain watches the procession with a proud, patient smile, a tiny screwdriver in hand. At the edge of the bench, one beetle has been separated from the line and sits under a sealed glass bell jar beneath a large magnifying lens on an arm, calmly being examined."
---

# Yol G — Zararlı Yazılım Analizi ve Tersine Mühendislik

> Bir program **gerçekte** ne yapıyor? Kaynak kodu olmadan öğrenmenin sanatı.

![Saatçi Sabri, açık bir dev cep saatinin içinden sıra sıra çıkan kurmalı böceklerini gururla izliyor; böceklerden biri tezgâhtaki cam fanusun altına alınmış, büyüteçle inceleniyor](../../gorseller/g-00-a.webp)

> 🕴️ **DOSYA: Saatçi Sabri** · *Mekanik Böceklerin Ustası*
>
> ![Saatçi Sabri — Mekanik Böceklerin Ustası](../../gorseller/karakter-sabri.webp)
>
> 📼 **Bölüm — Sezon 2: Saat İşliyor.** Kampüs ağında uyuyan bir şey var: belirli bir saatte uyanacak, kendini kopyalayacak ve Ayna'yı besleyecek. Saatçi Sabri'nin mekanik böcekleri. Görevin izole analiz laboratuvarında; böceği güvenle aç, nasıl çalıştığını anla, saati durdur.
>
> **Kim o?** Ailenin en yaşlı ustası. Ayna'yı besleyen mekanik böcekleri yapar; yirmi yıl önce genç Eren'in boynundaki altın anahtarı da o yapmıştı.
> [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

**Ön koşul:** Linux (M04), Windows (M03), Python (M07)

## ⚠️ Laboratuvar güvenlik kuralları (pazarlığa kapalı)

1. Örnekler **yalnızca** izole analiz sanal makinesinde açılır: önce temiz **snapshot**, iş bitince geri dönüş.
2. Ağ **kapalı** ya da yalnızca host-only; paylaşılan klasör, ortak pano ve sürükle-bırak **kapalı**.
3. Yalnızca eğitmenin verdiği **zararsız eğitim örnekleri**, EICAR test dosyası ve herkese açık crackme'ler kullanılır.
4. Gerçek zararlı yazılım **indirilmez, paylaşılmaz**; örnekler kişisel bilgisayarda **asla** çalıştırılmaz.
5. Bu yol zararlıyı **tanımayı ve durdurmayı** öğretir; zararlı yazmak, paketlemek ya da tespitten kaçırmak kapsam dışıdır.

## 12 ders

| # | Ders | Tek cümleyle |
|---|---|---|
| G01 | [Tersine mühendisliğin temelleri](01-temeller-ve-guvenli-lab.md) | Statik ve dinamik analiz, güvenli ortam |
| G02 | [Windows iç yapısı](02-windows-ic-yapisi.md) | Process, DLL, PE biçimi |
| G03 | [Assembly temelleri](03-assembly-temelleri.md) | Register, stack, kontrol akışı |
| G04 | [Statik analiz](04-statik-analiz.md) | Ghidra ile import tabloları ve strings |
| G05 | [Dinamik analiz](05-dinamik-analiz.md) | Debugger, breakpoint, API izleme |
| G06 | [.NET analizi](06-dotnet-analizi.md) | IL ve decompile edilmiş kod |
| G07 | [Zararlı yazılım türleri](07-zararli-turleri.md) | Trojan, ransomware, kalıcılık göstergeleri |
| G08 | [Davranış analizi](08-davranis-analizi.md) | Dosya, registry, ağ izleri ve IOC |
| G09 | [Bellek güvenliği](09-bellek-guvenligi.md) | Buffer overflow mantığı ve güvenli bellek |
| G10 | [Exploit geliştirme temelleri](10-crash-analizi.md) | Crash analizi, ASLR/DEP — yalnız eğitim programlarında |
| G11 | [Tespit](11-yara-tespit.md) | YARA ve davranışsal göstergeler |
| G12 | [Final](12-final-analiz-raporu.md) | Eğitmen örneği için analiz raporu |

## Bitirme çıktısı

**Zararlı yazılım analiz raporu** veya tersine mühendislik teknik dosyası.

## Güvenlik

Analiz edilen tüm örnekler **eğitmen tarafından eğitim için hazırlanır** ve internete bağlı olmayan,
geri alınabilir sanal makinelerde incelenir. Gerçek zararlı yazılım indirmek veya paylaşmak bu yolun parçası değildir.
