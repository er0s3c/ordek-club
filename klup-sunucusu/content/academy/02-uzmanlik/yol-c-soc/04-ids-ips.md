---
id: c-04
tur: ders
baslik: "IDS/IPS: ağdaki şüpheli trafiği kuralla yakalamak"
sure: 8
hedefler:
  - Suricata/Snort kural yapısını okumak
  - Laboratuvarda basit bir tespit kuralı yazıp test etmek
gorseller:
  - id: c-04-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer parlayan ağ borularıyla dolu koridorda paspasını denge sopası gibi tutup parmak uçlarında yürüyor; tavandaki sensör lambaları geçtiği yerde tek tek yanıyor"
    prompt: "A long dark corridor lined with glowing network pipes, a row of round motion-sensor lamps along the ceiling. The villain tries to sneak through on tiptoe, holding his glowing mop horizontally like a tightrope balancing pole, but every lamp he passes flips on amber one after another, lighting him up in a comic spotlight with a frozen startled expression."
---

# IDS/IPS: ağdaki şüpheli trafiği kuralla yakalamak

> Uç noktadaki log silinebilir. Ama paket ağdan **geçtiği anda** görülmüştür.
> 🧹 **İz 4:** KLP-WS07 gece `kotu.test` adında bir alan adına tekrar tekrar sordu. Tamer ağ sensörünü unutmuştu.

![Temizlikçi Tamer parlayan ağ borularıyla dolu koridorda paspasını denge sopası gibi tutup parmak uçlarında yürüyor; tavandaki sensör lambaları geçtiği yerde tek tek yanıyor](../../gorseller/c-04-a.webp)

## IDS mi, IPS mi?

- **IDS (Intrusion Detection System):** trafiğin kopyasını izler, alarm üretir. Ağa dokunmaz.
- **IPS (Intrusion Prevention System):** trafiğin yolu üstündedir, kuralla eşleşeni **düşürür**.

**Snort** ve **Suricata** en yaygın açık kaynaklı motorlardır; kural dilleri neredeyse aynıdır.

Sensör nereye konur? İnternet çıkışına (kuzey-güney trafiği) ve kritik sunucu bölgelerinin önüne (doğu-batı trafiği).
IPS yanlış pozitifte meşru trafiği de keser; bu yüzden yeni kurallar önce IDS modunda izlenir.

## Bir kuralın anatomisi

```text
alert dns $HOME_NET any -> any any (msg:"KULUP kotu.test alan adina DNS sorgusu"; dns.query; content:"kotu.test"; nocase; sid:1000001; rev:1;)
```

| Parça | Anlamı |
|---|---|
| `alert` | Eylem: alarm üret (`drop` = IPS modunda engelle) |
| `dns` | Protokol |
| `$HOME_NET any -> any any` | Kaynak → hedef (adres ve port) |
| `msg` | Alarmda görünen açıklama |
| `dns.query; content:` | Sorgu adında aranacak içerik |
| `sid`, `rev` | Kural kimliği ve sürümü (yerel kurallar 1000000+) |

## İyi kural, sessiz kuraldır

- Çok geniş kural (`content:"update"`) alarm yağmuru demektir.
- Çok dar kural (tam bir IP) saldırgan IP değiştirince kör kalır.
- Her kuralı **önce kayıtlı trafikle** dene, yanlış pozitif sayısına bak, sonra canlıya al.

İmza tabanlı tespit bilinen kalıpları yakalar; bilinmeyen için **anomali** (alışılmadık hacim, saat, hedef) izlenir.

## 🧪 Dene (5 dk)

Kulüp laboratuvarındaki Suricata VM'inde kuralı `local.rules`'a ekle, eğitmenin verdiği örnek pcap üzerinde çalıştır:

```bash
sudo suricata -r /opt/akademi/ornek.pcap -S local.rules -l /tmp/sonuc
cat /tmp/sonuc/fast.log
```

Kaç alarm çıktı? Kuralı yalnızca `TXT` sorgularını yakalayacak biçimde nasıl daraltırsın?

## ✅ Akılda kalsın

- IDS görür ve uyarır, IPS görür ve engeller.
- Kural = eylem + protokol + yön + içerik + kimlik.
- Kuralı önce kayıtlı trafikte dene; gürültülü kural kimseyi korumaz.
