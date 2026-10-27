---
id: a-08
tur: ders
baslik: "Sunucu tarafı: komut enjeksiyonu, SSTI, SSRF, XXE"
sure: 8
hedefler:
  - Dört sunucu tarafı açığın ortak nedenini açıklamak
  - Her biri için temel savunmayı söylemek
gorseller:
  - id: a-08-b
    tur: ai
    alt: "Binanın kendi uşağına dışarıdan verilen bir mektup; uşak onu alıp içerideki kasa odasına götürüyor"
    prompt: "A visitor at the gate hands a note to a trusted butler robot of a mansion; the butler, who has keys to every inner door, walks the note deep inside past guards who salute him, straight to an inner vault room the visitor could never reach."
---

# Sunucu tarafı: komut enjeksiyonu, SSTI, SSRF, XXE

> Dördünün ortak noktası: sunucu, kullanıcının verdiği şeyi **kendi yetkisiyle** çalıştırıyor ya da getiriyor.
> 🗂️ **Çekmece 8:** Jasmine artık kapıları zorlamıyor. Binanın kendi uşağına iş yaptırıyor.

::cizgi[a-08-sahne]

## Dört açık, tek tabloda

| Açık | Ne olur? | Laboratuvardaki işaret | Savunma |
|---|---|---|---|
| **Komut enjeksiyonu** | Girdi işletim sistemi komutuna eklenir | `ping` formuna `; id` eklenince fazladan çıktı | Shell kullanma; argümanları liste olarak ver |
| **SSTI** | Girdi şablon motorunda kod olarak işlenir | `{{7*7}}` yazınca sayfada `49` | Kullanıcıya şablon yazdırma; girdiyi değişken olarak ver |
| **SSRF** | Sunucu, kullanıcının verdiği adrese **kendisi** istek atar | "Adresten resim çek" ile iç adreslere erişim | Hedef izin listesi, iç ağ ve bulut meta veri adreslerini engelle |
| **XXE** | XML ayrıştırıcı dış varlıkları yükler | XML'de tanımlı varlık dosya içeriği döndürür | Ayrıştırıcıda DTD/dış varlıkları kapat |

## Kodda fark

```python
# ❌ girdi shell'e metin olarak gidiyor
os.system("ping -c 1 " + adres)

# ✅ shell yok, girdi tek bir argüman
subprocess.run(["ping", "-c", "1", adres], check=True, timeout=5)
```

Yine de `adres`'in gerçekten bir IP ya da alan adı olduğunu **doğrula**.

## SSRF neden bu kadar ciddi?

![Binanın kendi uşağına dışarıdan verilen bir mektup; uşak onu alıp içerideki kasa odasına götürüyor](../../gorseller/a-08-b.webp)

Sunucu güvenlik duvarının **içindedir**. Saldırgan dışarıdan göremediği iç panellere,
veritabanlarına ve bulut ortamlarının kimlik bilgisi veren meta veri servislerine sunucunun gözüyle bakar.

## 🧪 Dene (5 dk) — kod okuma

Aşağıdaki üç satırdan hangileri tehlikeli? Neden? Nasıl düzeltirsin?

```python
subprocess.run(["convert", dosya, "kucuk.png"])
os.system(f"zip yedek.zip {klasor}")
render_template_string("Merhaba " + ad)
```

## ✅ Akılda kalsın

- Ortak neden: girdi, sunucunun kendi yetkisiyle çalışan bir şeye karışıyor.
- Shell yerine argüman listesi, şablona kod yerine değişken.
- SSRF'e karşı hedefleri izin listesiyle sınırla; iç adresleri engelle.
