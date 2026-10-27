---
id: g-00
tur: bilgi
baslik: "Yol G — Zararlı Yazılım Analizi ve Tersine Mühendislik"
sure: 3
gorseller:
  - id: g-00-b
    tur: ai
    alt: "Saatçi atölyesinde mekanik böceklerin parçalarına ayrıldığı cam kubbeli bir çalışma masası"
    prompt: "A watchmaker's workshop bench with a glass dome, under which a mechanical beetle has been carefully taken apart into labeled trays of gears and springs, analysts examining pieces with tweezers and loupes."
---

# Yol G — Zararlı Yazılım Analizi ve Tersine Mühendislik

> Bir program **gerçekte** ne yapıyor? Kaynak kodu olmadan öğrenmenin sanatı.

::cizgi[g-00-sahne]

> 🕴️ **DOSYA: Saatçi Sabri** · *Mekanik Böceklerin Ustası*
>
> ![Saatçi Sabri — Mekanik Böceklerin Ustası](../../gorseller/karakter-sabri.webp)
>
> **Kim o?** Ailenin en yaşlı ustası. Ayna'yı besleyen mekanik böcekleri yapar; yirmi yıl önce genç Eren'in boynundaki altın anahtarı da o yapmıştı.
> [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[sabri-acilis]

**Ön koşul:** Linux (M04), Windows (M03), Python (M07)

## ⚠️ Laboratuvar güvenlik kuralları (pazarlığa kapalı)

1. Örnekler **yalnızca** izole analiz sanal makinesinde açılır: önce temiz **snapshot**, iş bitince geri dönüş.
2. Ağ **kapalı** ya da yalnızca host-only; paylaşılan klasör, ortak pano ve sürükle-bırak **kapalı**.
3. Yalnızca eğitmenin verdiği **zararsız eğitim örnekleri**, EICAR test dosyası ve herkese açık crackme'ler kullanılır.
4. Gerçek zararlı yazılım **indirilmez, paylaşılmaz**; örnekler kişisel bilgisayarda **asla** çalıştırılmaz.
5. Bu yol zararlıyı **tanımayı ve durdurmayı** öğretir; zararlı yazmak, paketlemek ya da tespitten kaçırmak kapsam dışıdır.

## 12 ders

![Saatçi atölyesinde mekanik böceklerin parçalarına ayrıldığı cam kubbeli bir çalışma masası](../../gorseller/g-00-b.webp)

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
