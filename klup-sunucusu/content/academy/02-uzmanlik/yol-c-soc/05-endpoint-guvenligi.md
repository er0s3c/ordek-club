---
id: c-05
tur: ders
baslik: "Uç nokta güvenliği: EDR, IOC ve IOA"
sure: 8
hedefler:
  - EDR'ın antivirüsten farkını açıklamak
  - Bir olay kaydından IOC çıkarıp IOA ile karşılaştırmak
gorseller:
  - id: c-05-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer cam fanus altındaki dizüstü bilgisayarın camını paspaslıyor; arkasındaki mekanik kollu büyüteç kaçırdığı parlayan parmak izlerini ve ayak izlerini gösteriyor"
    prompt: "A tidy office desk at night where a laptop sits under a tall glass dome like a museum exhibit. The villain carefully polishes the glass with his glowing mop, looking pleased, but a large magnifying lens on a mechanical brass arm hovers right behind him, revealing a trail of glowing green fingerprints and little footprints across the desk that his mop has completely missed."
---

# Uç nokta güvenliği: EDR, IOC ve IOA

> Saldırgan ağdan girer ama işini **uç noktada** (endpoint) yapar: dizüstü, masaüstü, sunucu.
> 🧹 **İz 5:** Tamer betiğini sildi. Ama betiğin çalıştırdığı her işlem, Sysmon'da bir satır bıraktı.

![Temizlikçi Tamer cam fanus altındaki dizüstü bilgisayarın camını paspaslıyor; arkasındaki mekanik kollu büyüteç kaçırdığı parlayan parmak izlerini ve ayak izlerini gösteriyor](../../gorseller/c-05-a.webp)

## Antivirüs ile EDR farkı

| | Klasik antivirüs | EDR (Endpoint Detection and Response) |
|---|---|---|
| Neye bakar? | Dosya imzası | Davranış: işlem, ağ, kayıt defteri, dosya |
| Ne zaman? | Dosya diske yazılınca | Sürekli, olay olay kaydeder |
| Ne yapar? | Siler, karantinaya alır | Uyarır, cihazı ağdan **yalıtır**, geçmişi gösterir |

Laboratuvarda EDR'ın ücretsiz karşılığı: **Sysmon** (Windows) + Wazuh ajanı.

## IOC ve IOA

- **IOC (Indicator of Compromise):** ele geçirilmenin kalıntısı. IP, alan adı, dosya hash'i, dosya yolu.
  Kolay paylaşılır, kolay değişir.
- **IOA (Indicator of Attack):** saldırının davranışı. "Word belgesi PowerShell başlattı",
  "bir işlem güvenlik logunu temizledi". Saldırgan aracını değiştirse de davranış aynı kalır.

IOC'yi **dün** ne olduğunu aramak için, IOA'yı **yarın** yakalamak için kullan.

## Uç nokta triyajı: dört soru

1. **Ne çalıştı?** İşlem ve ebeveyn işlem (parent). `explorer.exe → powershell.exe` normal mi?
2. **Kime bağlandı?** Dış IP'ler, alışılmadık portlar.
3. **Ne bıraktı?** Yeni dosya, servis, zamanlanmış görev, kayıt defteri anahtarı.
4. **Ne sildi?** Silinen betik, temizlenen log: gizlenme çabası başlı başına bulgudur.

Şüphe varsa cihazı **kapatma**: ağdan yalıt. Bellekteki kanıt kapatınca kaybolur.

## 🧪 Dene (5 dk)

Sysmon kayıtlarından IOC listesi çıkar:

```bash
grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:443" /opt/akademi/c-sysmon.csv | sort | uniq -c
grep -E ",(1|11|13|23)," /opt/akademi/c-sysmon.csv | cut -d, -f4,5,8
```

Dış IP, alan adı, dosya yolu ve SHA256 değerini bir tabloya yaz. Sonra iki IOA cümlesi kur: "… işlemi … yaptı."

## ✅ Akılda kalsın

- EDR imzaya değil davranışa bakar ve cihazı yalıtabilir.
- IOC kalıntıdır (IP, hash); IOA davranıştır (ne yapıldı).
- Şüpheli cihaz kapatılmaz, ağdan yalıtılır.
