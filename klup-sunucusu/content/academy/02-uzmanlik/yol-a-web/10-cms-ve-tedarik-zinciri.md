---
id: a-10
tur: ders
baslik: "CMS ve tedarik zinciri: senin yazmadığın kod"
sure: 7
hedefler:
  - CMS sitelerindeki açıkların çoğunun nereden geldiğini açıklamak
  - Bağımlılık riskini ve SBOM'u tanımak
gorseller:
  - id: a-10-b
    tur: ai
    alt: "Bir yazılım kutusunun yanında uzun bir malzeme listesi; her parçanın nereden geldiği iplerle gösteriliyor"
    prompt: "A finished product box on a workbench with its lid open, a long unrolled parts scroll beside it, and thin threads running from each small part inside the box to the distant workshops that made them, one thread glowing red at a suspicious workshop."
---

# CMS ve tedarik zinciri: senin yazmadığın kod

> Modern bir web sitesindeki kodun çoğunu sahibi yazmadı: tema, eklenti, kütüphane, paket.
> 🗂️ **Çekmece 10:** Jasmine portala dokunmadı. Portalın kullandığı bir eklentiye dokundu.

::cizgi[a-10-sahne]

## CMS: açık genelde çekirdekte değil

WordPress, Joomla gibi içerik yönetim sistemlerinde çekirdek düzenli güncellenir.
Bulguların çoğu **eklenti ve temalardan** gelir: terk edilmiş, güncellenmemiş, gereğinden fazla yetkili.

Değerlendirmede bakılanlar (izinle):

- Sürüm bilgisi (sayfa kaynağı, `readme` dosyaları, başlıklar)
- Kurulu eklentiler ve sürümleri → bilinen açık var mı?
- Yönetim paneli herkese açık mı, kullanıcı adları listelenebiliyor mu?
- `WPScan` gibi araçlar bunu otomatikleştirir — yalnızca kapsam içindeki sitede.

## Tedarik zinciri

| Risk | Örnek |
|---|---|
| **Bilinen açıklı bağımlılık** | Eski bir kütüphane sürümü |
| **Typosquatting** | `requests` yerine `reqeusts` paketi |
| **Ele geçirilen paket** | Güvenilir paketin yeni sürümüne zararlı kod eklenmesi |
| **Kurulumda çalışan script** | Paket yüklenirken kendi komutunu çalıştırıyor |

## SBOM: malzeme listesi

![Bir yazılım kutusunun yanında uzun bir malzeme listesi; her parçanın nereden geldiği iplerle gösteriliyor](../../gorseller/a-10-b.webp)

**Software Bill of Materials:** Yazılımın içindeki bütün bileşenlerin ve sürümlerinin listesi.
Yeni bir açık duyurulduğunda "bizde var mı?" sorusunu dakikalar içinde cevaplatır.

## Savunma

Az ve bakımı süren eklenti, düzenli güncelleme, kilit dosyası (`package-lock.json`, `poetry.lock`),
CI'da bağımlılık taraması, SBOM üretimi, yeni bağımlılık eklemeden önce kısa bir inceleme.

## 🧪 Dene (5 dk)

Kendi bir projende (ya da örnek bir Node/Python projesinde) şunu çalıştır:

```bash
npm audit          # Node projesi
pip-audit          # Python projesi (pip install pip-audit)
```

Kaç doğrudan, kaç dolaylı bağımlılık var? Bulunan açıkların kaçı gerçekten senin kullandığın kodda?

## ✅ Akılda kalsın

- CMS açıklarının çoğu eklenti ve temalardan gelir.
- Bağımlılık eklemek, başkasının kodunu evine almak demektir.
- SBOM, "bizde bu bileşen var mı?" sorusunu hızla cevaplar.
