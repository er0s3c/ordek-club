---
id: b-04
tur: ders
baslik: "İleri tarama: türler, hız ve yanlış pozitifler"
sure: 7
hedefler:
  - SYN, connect ve UDP taramalarını karşılaştırmak
  - Tarama sonuçlarını doğrulayıp yanlış pozitifleri ayıklamak
gorseller:
  - id: b-04-a
    tur: ai
    karakter: tarik
    alt: "Tünelci Tarık bir binanın kapılarına aceleyle vurup cevap beklemeden kaçıyor; kapı görevlisi robot alarm düğmesine uzanıyor"
    prompt: "A long building facade with many doors at night. The villain races along it rapping on every door in quick succession without waiting for answers, a blur of motion lines behind him, while a sleepy doorman robot at the end of the street wakes up and reaches for a glowing alarm button."
---

# İleri tarama: türler, hız ve yanlış pozitifler

> Hızlı tarama gürültülüdür; yavaş tarama sabır ister. Ve tarayıcının söylediği her şey **doğru değildir**.
> 🕳️ **Tünel 4:** Laboratuvar IDS'i dün gece kısa bir tarama yakaladı. Ama Tarık bu kadar acemi mi?

![Tünelci Tarık bir binanın kapılarına aceleyle vurup cevap beklemeden kaçıyor; kapı görevlisi robot alarm düğmesine uzanıyor](../../gorseller/b-04-a.webp)

## Tarama türleri

| Tür | Komut | Nasıl çalışır? | Not |
|---|---|---|---|
| **SYN** | `-sS` | SYN gönderir, SYN/ACK gelirse bağlantıyı tamamlamaz | Varsayılan (root ile) |
| **Connect** | `-sT` | Tam TCP bağlantısı kurar | Yetkisiz kullanıcıda; loglarda daha görünür |
| **UDP** | `-sU` | UDP paketi gönderir, cevabı yorumlar | Yavaş ama DNS, SNMP gibi servisleri bulur |
| **Tüm portlar** | `-p-` | 65535 portun hepsi | Standart dışı portlarda saklananları bulur |

## Hız ve iz

- `-T4` hızlı, `-T2` yavaş ve sessiz. Hızlı tarama ağı yorar ve IDS'i tetikler.
- Laboratuvarda **IDS'in hangi taramayı gördüğünü** izlemek, savunmayı anlamanın en iyi yoludur.

## Yanlış pozitifler

Tarayıcı bir **tahminde** bulunur; bulgu değildir.

- Sürüm, servisin kendi ilan ettiği afiştir; yamalanmış sistem eski sürüm numarası gösterebilir.
- `filtered` her zaman "kapalı" demek değildir.
- Zafiyet tarayıcısı "olası" diyorsa elle doğrula: yapılandırmaya, paket sürümüne, yama notlarına bak.

Rapora **doğrulanmamış** bulgu yazılmaz.

## 🧪 Dene (6 dk)

Laboratuvarda aynı sunucuyu `-sS` ve `-sT` ile tara. Sunucunun loglarında (`/var/log/auth.log`, web logu) ya da IDS'te
iki tarama arasında ne fark görüyorsun? Sonra `-sU --top-ports 20` dene: hangi UDP servisleri çıktı?

## ✅ Akılda kalsın

- SYN taraması yarım el sıkışma, connect taraması tam bağlantıdır.
- Hız iz bırakır; IDS'in ne gördüğünü laboratuvarda gözle.
- Tarayıcı tahmin eder, analist doğrular.
