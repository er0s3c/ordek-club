---
id: d-08
tur: ders
baslik: "CTI platformları: MISP, OpenCTI ve STIX/TAXII"
sure: 8
hedefler:
  - STIX 2.1 nesnelerini ve ilişkilerini okuyup bir paketi eleştirmek
  - MISP/OpenCTI'de paylaşımı TLP ve kaynak güveniyle yönetmek
gorseller:
  - id: d-08-b
    tur: ai
    alt: "Dört renkli zarf: kırmızı yalnız odadakilere, kehribar kuruma, yeşil topluluğa, beyaz herkese gidiyor"
    prompt: "Four envelopes on a sorting table, each sealed with a different colored wax: a red one handed only to the few people in the room, an amber one going to one building, a green one going to a neighborhood of buildings, and a clear one tossed out of an open window to the whole city."
---

# CTI platformları: MISP, OpenCTI ve STIX/TAXII

> İstihbarat paylaşıldıkça güçlenir. Yanlış istihbarat da.
> 🚩 **Bayrak 8:** Blogun IOC'leri bir paylaşım topluluğuna STIX paketi olarak düştü. Üç kurum onları otomatik engelledi.

::cizgi[d-08-sahne]

## Platformlar

| Araç | Ne işe yarar? |
|---|---|
| **MISP** | Olay (event) ve öznitelik (attribute) paylaşımı; topluluk beslemeleri; yanlış pozitif uyarı listeleri (warninglists) |
| **OpenCTI** | Bilgiyi grafik olarak bağlar: aktör ↔ kampanya ↔ teknik ↔ gösterge |
| **TAXII** | STIX paketlerini sunucudan sunucuya taşıyan protokol (koleksiyonlar, API kökleri) |

## STIX 2.1: ortak dil

STIX (Structured Threat Information Expression) her şeyi **nesne + ilişki** olarak yazar.

```json
{ "type": "indicator",
  "pattern": "[domain-name:value = 'mercan-guncelleme.example']",
  "pattern_type": "stix", "confidence": 90 }

{ "type": "relationship", "relationship_type": "attributed-to",
  "source_ref": "campaign--…", "target_ref": "threat-actor--…", "confidence": 95 }
```

Sık nesneler: `indicator`, `malware`, `threat-actor`, `intrusion-set`, `campaign`, `attack-pattern`, `report`, `sighting`.
Asıl soru her zaman: **`created_by_ref` kim ve bu güven puanını neye dayanarak verdi?**

## TLP: kiminle paylaşılır?

![Dört renkli zarf: kırmızı yalnız odadakilere, kehribar kuruma, yeşil topluluğa, beyaz herkese gidiyor](../../gorseller/d-08-b.webp)

Trafik Işığı Protokolü (Traffic Light Protocol 2.0): **CLEAR** herkese açık · **GREEN** topluluk ·
**AMBER** kurum içi ve müşteriler · **AMBER+STRICT** yalnızca kurum · **RED** yalnızca odadakiler.

## Otomatik engelleme tuzağı

Beslemeyi doğrudan güvenlik duvarına bağlamak hızlıdır, ama paylaşımlı bir CDN adresi tek satırda yüzlerce meşru siteyi keser.
Kaynak puanı düşükse önce **izle**, sonra engelle. MISP uyarı listeleri bilinen paylaşımlı adresleri işaretler.

## 🧪 Dene (5 dk)

`lab/d-stix-paketi.json` dosyasını aç. Atıf ilişkisini (`attributed-to`) bul: güven puanı kaç, kaynağı kim?
Dört göstergeden hangisi `lab/d-altyapi-kayitlari.txt`'ye göre paylaşımlı bir adres? Bu paketi topluluğa hangi notla geri gönderirdin?

## ✅ Akılda kalsın

- STIX nesne ve ilişkilerle konuşur; TAXII onu taşır; MISP ve OpenCTI saklar ve bağlar.
- Güven puanı, onu verenin güvenilirliği kadar değerlidir.
- Düşük güvenli beslemeyi önce izle, sonra engelle.
