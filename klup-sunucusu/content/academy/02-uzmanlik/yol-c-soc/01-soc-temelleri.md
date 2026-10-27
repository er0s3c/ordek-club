---
id: c-01
tur: ders
baslik: "SOC nedir? Olay, alarm ve vaka arasındaki fark"
sure: 8
hedefler:
  - SOC kademelerini (Tier 1–3) ve görevlerini tanımak
  - Olay (event), alarm (alert) ve vaka (incident) kavramlarını ayırt etmek
animasyonlar: [soc-alert]
gorseller:
  - id: c-01-b
    tur: ai
    alt: "Huni şeklinde bir süzgeç: üstte sayısız küçük olay kıvılcımı, ortada birkaç alarm zili, en altta tek bir kalın vaka dosyası"
    prompt: "A large brass funnel on a desk: at the wide top thousands of tiny sparks pour in, in the middle a few small bells ring as some sparks get caught, and at the narrow bottom a single thick case folder drops out into an analyst's hands."
  - id: c-01-c
    tur: ai
    alt: "Yüzlerce zilin aynı anda çaldığı odada kulaklarını tıkayan yorgun analist; gerçek tehlike zili ortada fark edilmiyor"
    prompt: "An exhausted analyst covers their ears in a room where hundreds of alarm bells ring at once on every shelf, while one different bell glowing deep red in the middle goes unnoticed among them."
---

# SOC nedir? Olay, alarm ve vaka arasındaki fark

> Bir kampüs ağı her gün milyonlarca **iz** üretir. Hangisi önemli? Bunu ayıran yer SOC'tur.
> 🧹 **İz 1:** Gece 02:00'de SOC ekranına 23 alarm düştü. Tamer, en önemlisini kalabalığın içine sakladı.

::cizgi[c-01-sahne]

## SOC kimdir, ne yapar?

**SOC (Security Operations Center)**, kurumun güvenliğini 7/24 izleyen ekiptir. Kalkan ekibi kampüsün SOC'udur.

| Kademe | Görev | Örnek soru |
|---|---|---|
| **Tier 1** — triyaj | Alarmları ilk inceler, ayıklar | "Bu gerçek mi, yanlış pozitif mi?" |
| **Tier 2** — inceleme | Derinlemesine analiz, kapsam | "Başka hangi cihazlar etkilendi?" |
| **Tier 3** — av ve uzmanlık | Tehdit avı (threat hunting), adli bilişim | "Kimsenin alarm almadığı ne var?" |

## Olay → alarm → vaka

![Huni şeklinde bir süzgeç: üstte sayısız küçük olay kıvılcımı, ortada birkaç alarm zili, en altta tek bir kalın vaka dosyası](../../gorseller/c-01-b.webp)

- **Olay (event):** Kaydedilen her şey. "deniz.kaya oturum açtı."
- **Alarm (alert):** Bir kuralın şüpheli bulduğu olay. "10 dakikada 12 başarısız giriş."
- **Vaka (incident):** Doğrulanmış, müdahale gerektiren durum. "Hesap ele geçirildi."

Her olay alarm değildir, her alarm vaka değildir. Tier 1'in işi bu süzgeçtir.

::animasyon[soc-alert]

## Alarm yorgunluğu

![Yüzlerce zilin aynı anda çaldığı odada kulaklarını tıkayan yorgun analist; gerçek tehlike zili ortada fark edilmiyor](../../gorseller/c-01-c.webp)

Yüzlerce düşük önemli alarm, analisti yorar ve kritik olanı gözden kaçırtır. Buna **alarm yorgunluğu (alert fatigue)** denir.
Saldırgan bazen bilerek gürültü üretir: tarama yağmuru başlatır, asıl hamlesini arasına gizler.

**Savunma:** önceliklendir (önem + varlık değeri), benzer alarmları grupla, gürültülü kuralı ayarla (tuning).

## 🧪 Dene (5 dk)

Laboratuvar VM'inde alarm kuyruğunu aç ve önem derecesine göre say:

```bash
cut -d, -f3 /opt/akademi/c-alarmlar.csv | sort | uniq -c
grep -E "kritik|yüksek" /opt/akademi/c-alarmlar.csv
```

Kaç alarm "IDS: Port taraması"? Kritik ve yüksek alarmlar hangi tek cihazda toplanıyor? İlk hangisine bakarsın, neden?

## ✅ Akılda kalsın

- SOC'ta Tier 1 ayıklar, Tier 2 inceler, Tier 3 avlanır.
- Olay kayıttır, alarm şüphedir, vaka doğrulanmış sorundur.
- Gürültü bir saldırı tekniği olabilir: önce önceliklendir, sonra incele.
