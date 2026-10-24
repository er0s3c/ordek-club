---
id: g-11
tur: ders
baslik: "Tespit: YARA kuralları ve davranışsal göstergeler"
sure: 9
hedefler:
  - Bir örnek için yanlış pozitif üretmeyen YARA kuralı yazmak
  - Dosya göstergelerini davranışsal göstergelerle tamamlamak
gorseller:
  - id: g-11-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri birbirinin aynısı böceklerini pirinç bir ayıklama makinesinin önünden geçirmeye çalışıyor; makinenin mercekli kolu her birini kabuğundaki desenden tanıyıp cam kavanoza bırakıyor"
    prompt: "At a workshop gate, the villain tiptoes a neat row of identical-looking clockwork beetles past a large brass sorting machine. The machine's jointed mechanical arm, fitted with a pattern-matching magnifying lens, recognizes the distinctive swirl pattern on each beetle's shell and plucks them one by one into a big glass jar. The villain stares open-mouthed, his loupe popping off his eye."
animasyonlar:
  - soc-alert
---

# Tespit: YARA kuralları ve davranışsal göstergeler

> Bir böceği bir kez analiz edersin; iyi bir kural yazarsan **bütün kardeşlerini** her yerde yakalarsın.
> ⚙️ **Çark 11:** Sabri'nin böcekleri birbirine benziyor. Selim Hoca: "Hepsini tanıyan tek bir parmak izi yaz; saat bir daha işlemesin."

![Saatçi Sabri birbirinin aynısı böceklerini pirinç bir ayıklama makinesinin önünden geçirmeye çalışıyor; makinenin mercekli kolu her birini kabuğundaki desenden tanıyıp cam kavanoza bırakıyor](../../gorseller/g-11-a.webp)

## YARA nedir?

YARA, dosyaları ve belleği **desenlere** göre tarayan bir kural dilidir — "zararlı yazılım için grep".

```yara
rule Ornek_Kural
{
    meta:
        yazar = "Tilki"
        tlp   = "CLEAR"
    strings:
        $mutex = "Global\\OrnekMutex" ascii wide
        $ua    = "OrnekAjan/2.0"
        $hex   = { 4F 52 4E 45 4B }   // "ORNEK"
    condition:
        uint16(0) == 0x5A4D and 2 of them
}
```

## İyi kuralın üç özelliği

- **Değişmeyeni hedefler:** benzersiz dize, mutex, özgün kod parçası. IP ve sürüm numarası kolay değişir.
- **Fazla genel değildir:** `"http"` neredeyse her programda var → yanlış pozitif (false positive).
- **Test edilir:** önce örneğe, sonra büyük bir temiz dosya koleksiyonuna karşı.

## Davranışsal göstergeler

YARA dosyayı yakalar; davranış ise sistemde görünür:

- `winword.exe` → `powershell.exe` alt süreci
- Dakikalar içinde yüzlerce dosyanın yeniden adlandırılması
- `%APPDATA%` altından çalışan, imzasız ve her gece aynı saatte tetiklenen görev

Bu göstergeler SIEM ve EDR kurallarına (ör. Sigma) dönüşür ve SOC'a alarm olarak düşer.

::animasyon[soc-alert]

## 🧪 Dene (8 dk)

Linux yardımcı VM'inde alıştırma kuralını tamamla:

```bash
cp /opt/akademi/g-yara-alistirma.yar ~/kural.yar
nano ~/kural.yar                                   # "____" boşluklarını doldur
yara -s ~/kural.yar /opt/akademi/g-saat-bocegi-strings.txt
yara -r ~/kural.yar /usr/bin/                      # temiz dosyalar: eşleşme olmamalı
```

Dosyadaki ikinci kural neden kötü? İki sorununu yaz ve düzelt.

## ✅ Akılda kalsın

- YARA = desen + koşul; değişmeyen şeyleri hedefle.
- Her kuralı temiz dosyalara karşı yanlış pozitif için test et.
- Dosya göstergesini davranış göstergesiyle tamamla.
