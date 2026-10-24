---
id: m07-06
tur: ders
baslik: Kendi kodunda açık bırakmamak
sure: 8
hedefler:
  - Python'daki yaygın güvenlik hatalarını tanımak
  - API anahtarlarını ve dış istekleri güvenle kullanmak
animasyonlar: [sql-injection]
gorseller:
  - id: m07-06-a
    tur: ai
    karakter: orhan
    alt: "Kod bloklarından yapılmış duvarın çatlaklarından Kuklacı Orhan'ın parlayan ipleri içeri sızıyor"
    prompt: "A wall built from glowing translucent code-like tiles (no characters) with a few thin red cracks. Through the cracks, the villain threads his glowing marionette strings, trying to pull tiles loose from the other side."
---

# Kendi kodunda açık bırakmamak

> Güvenlikçinin yazdığı araç da bir yazılımdır — ve açık barındırabilir.
> En yaygın hatalar hep aynı yerden çıkar: **girdiye güvenmek**.

![Kod bloklarından yapılmış duvarın çatlaklarından Kuklacı Orhan'ın parlayan ipleri içeri sızıyor](../../gorseller/m07-06-a.webp)

## Dört klasik hata

| ❌ Yapma | ✅ Yap | Neden? |
|---|---|---|
| `eval(girdi)` | `int(girdi)`, `json.loads(girdi)` | `eval` girdiyi **kod olarak** çalıştırır |
| `os.system("ping " + host)` | `subprocess.run(["ping", "-c", "1", host])` | Liste biçimi, `; rm -rf ~` gibi eklemeleri komut yapmaz |
| `"SELECT … WHERE ad='" + ad + "'"` | `cur.execute("SELECT … WHERE ad = ?", (ad,))` | Parametreli sorgu, girdiyi veri olarak tutar |
| `API_KEY = "sk-abc123"` koda gömülü | `os.environ["API_KEY"]` | Kod GitHub'a gider, anahtar da gider |

SQL'de girdiyi metne yapıştırmanın neden tehlikeli olduğunu gör:

::animasyon[sql-injection]

## Dış API'leri güvenle çağırmak

```python
import os
import requests

anahtar = os.environ.get("HAVA_API_KEY")
if not anahtar:
    raise SystemExit("HAVA_API_KEY tanımlı değil")

yanit = requests.get(
    "https://api.example.com/hava",
    params={"sehir": "Girne"},
    headers={"Authorization": f"Bearer {anahtar}"},
    timeout=10,            # sonsuza kadar bekleme
)                          # verify=False KULLANMA: sertifika kontrolünü kapatır
yanit.raise_for_status()
print(yanit.json())
```

- Anahtarı loglara ve hata mesajlarına **yazdırma**.
- `.env` dosyasını `.gitignore`'a ekle.
- Yanıta da güvenme: beklediğin alanlar gerçekten var mı kontrol et.

## 🧪 Dene (4 dk)

Aşağıdaki satırda ne yanlış? Düzelt.

```python
dosya = input("Hangi log? ")
os.system("cat /var/log/" + dosya)
```

<details><summary>Cevap</summary>Kullanıcı <code>x; rm -rf ~</code> yazarsa ikinci komut da çalışır. Ayrıca <code>../../etc/shadow</code> gibi yol geçişi mümkün. Çözüm: izinli dosya adlarından oluşan bir listeyle karşılaştır ve dosyayı <code>open()</code> ile oku.</details>

## ✅ Akılda kalsın

- Girdiyi asla kod, komut veya sorgu metnine yapıştırma.
- Anahtarlar ortam değişkeninde, kodda değil.
- Dış isteklerde zaman aşımı koy, sertifika kontrolünü kapatma.
