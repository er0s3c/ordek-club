---
id: g-08
tur: ders
baslik: "Davranış analizi: dosya, registry, ağ izleri ve IOC"
sure: 9
hedefler:
  - Bir örneği sandbox'ta güvenle çalıştırıp süreç, dosya, registry ve ağ etkinliğini kaydetmek
  - Bulgulardan paylaşılabilir IOC listesi çıkarmak
gorseller:
  - id: g-08-b
    tur: ekran
    alt: "Process Monitor'de eğitim örneğinin süreç adına göre filtrelenmiş dosya, registry ve süreç oluşturma olayları"
    nasil: "Ağı kapalı analiz VM'inde, eğitmenin zararsız eğitim örneğini çalıştırırken Process Monitor kaydı al. Filtre: Process Name is <örnek adı>; Operation is WriteFile, RegSetValue, Process Create. Run anahtarına yazılan RegSetValue satırını kehribar (#C9953B) dikdörtgenle işaretle. Yalnızca Procmon penceresini kırp; kullanıcı adını bulanıklaştır. 1600×900, koyu tema."
  - id: g-08-c
    tur: ai
    alt: "Cam kutudaki mekanik böceğin her hareketi dört kalemli bir kayıt cihazına çiziliyor: dosya, kayıt defteri, ağ ve süreç"
    prompt: "A mechanical beetle moves inside a glass box while a seismograph-like recorder with four pens draws its every action on a long paper roll, four colored lines for files, ledgers, network and helpers, an analyst annotating the peaks."
animasyonlar:
  - dns-resolution
---

# Davranış analizi: dosya, registry, ağ izleri ve IOC

> Bir böceği en iyi, bıraktığı **izlerden** tanırsın. Davranış analizi o izleri kayda geçirir.
> ⚙️ **Çark 8:** Böcek kafeste uyanıyor. Selim Hoca kronometreyi başlatıyor: "Her adımını kaydet. Saat kaçta işleyecek, onu bul."

::cizgi[g-08-sahne]

## Akış

![Cam kutudaki mekanik böceğin her hareketi dört kalemli bir kayıt cihazına çiziliyor: dosya, kayıt defteri, ağ ve süreç](../../gorseller/g-08-c.webp)

Snapshot al → izleme araçlarını başlat → örneği çalıştır → 3–5 dk bekle → kaydı durdur ve dışa aktar → **snapshot'a dön**.
Ağ tarafında sahte servisler (INetSim, FakeNet-NG fikri) her DNS sorusuna laboratuvar adresiyle yanıt verir; internete tek paket çıkmaz.

::animasyon[dns-resolution]

## Neyi izleriz?

| Alan | Araç | Aranan |
|---|---|---|
| Süreç | Process Explorer, Procmon | Süreç ağacı; `cmd.exe`, `powershell.exe` alt süreçleri |
| Dosya | Procmon (`WriteFile`) | `%APPDATA%` ve `%TEMP%`'e bırakılan dosyalar |
| Registry | Procmon, Regshot (önce/sonra) | `Run` anahtarları, yeni servisler |
| Ağ | Wireshark, sahte servis logu | DNS sorguları, HTTP istekleri, User-Agent |

![Process Monitor'de eğitim örneğinin süreç adına göre filtrelenmiş dosya, registry ve süreç oluşturma olayları](../../gorseller/g-08-b.webp)

## IOC: başkaları da bulabilsin

IOC (indicator of compromise), aynı zararlının başka sistemlerde aranmasını sağlayan göstergedir:

- **Dosya:** hash, ad, yol
- **Host:** registry değeri, mutex, görev adı
- **Ağ:** alan adı, IP, URL, User-Agent

Hash en kolay değişen göstergedir; davranış ve altyapı daha değerlidir (Acı Piramidi — Pyramid of Pain).

## 🧪 Dene (8 dk)

Kurgusal örneğin sandbox raporunu incele:

```bash
jq '.surec_agaci' /opt/akademi/g-saat-bocegi-sandbox.json
jq -r '.ag[] | [.tur, .alan_adi, .hedef] | @tsv' /opt/akademi/g-saat-bocegi-sandbox.json
jq '.registry, .zamanlanmis_gorevler, .mutex' /opt/akademi/g-saat-bocegi-sandbox.json
```

1. Süreç ağacını kâğıda çiz.
2. En az 6 IOC'yi tabloya yaz: 2 dosya, 2 host, 2 ağ.
3. Böcek her gün saat kaçta yeniden uyanacak?

## ✅ Akılda kalsın

- Snapshot → izle → çalıştır → kaydet → geri dön.
- Sahte ağ servisleri davranışı gösterir, internete paket kaçırmaz.
- IOC'ler dosya, host ve ağ göstergeleridir; davranış hash'ten değerlidir.
