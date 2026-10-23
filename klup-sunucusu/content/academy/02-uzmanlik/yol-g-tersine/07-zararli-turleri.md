---
id: g-07
tur: ders
baslik: "Zararlı yazılım türleri ve kalıcılık göstergeleri"
sure: 7
hedefler:
  - Zararlı yazılım türlerini davranışlarına göre ayırt etmek
  - Windows'ta kalıcılık noktalarını kontrol etmek
gorseller:
  - id: g-07-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri vitrinindeki böcek koleksiyonunu kuyumcu gibi sunuyor: biri hediye kutusunda saklanıyor, biri sıra sıra kopyalarına bölünüyor, biri bir sandığı zincirle kilitliyor, biri anahtar deliğinden gözetliyor"
    prompt: "In an old watchmaker's shop window at night, a velvet display tray presents a lineup of clockwork beetles, each with its own quirk: one hiding inside an elegant ribboned gift box, one splitting into a line of tiny identical copies marching away, one wrapping a small treasure chest in chains with a padlock, and one peeking through a keyhole with a tiny spyglass. The villain presents them proudly with an open palm, like a jeweler showing his finest collection."
---

# Zararlı yazılım türleri ve kalıcılık göstergeleri

> Zararlıyı adıyla değil **huyuyla** tanırsın: ne saklıyor, nasıl yayılıyor, nasıl geri geliyor?
> ⚙️ **Çark 7:** Sabri'nin vitrininde her böceğin başka bir huyu var. Selim Hoca: "Bizimki hangisi? Kanıtla söyle."

![Saatçi Sabri vitrinindeki böcek koleksiyonunu kuyumcu gibi sunuyor: biri hediye kutusunda saklanıyor, biri sıra sıra kopyalarına bölünüyor, biri bir sandığı zincirle kilitliyor, biri anahtar deliğinden gözetliyor](../../gorseller/g-07-a.webp)

## Davranışa göre türler

| Tür | Davranış | Tipik iz |
|---|---|---|
| **Truva atı** (trojan) | Faydalı görünür, gizli iş yapar | Güncelleme kılığı, beklenmedik bağlantı |
| **Solucan** (worm) | Kendi kendine yayılır | Çok sayıda hosta bağlantı, USB'ye kopyalama |
| **Fidye yazılımı** (ransomware) | Dosyaları şifreleyip para ister | Toplu yeniden adlandırma, gölge kopyaların silinmesi |
| **Bilgi toplayıcı** (infostealer) | Parola, çerez, belge toplar | Tarayıcı profili ve belge klasörüne erişim |
| **RAT** (remote access trojan) | Uzaktan kontrol sağlar | Düzenli aralıklı "beacon" trafiği |
| **Yükleyici** (loader / dropper) | Asıl yükü bırakır ya da indirir | Geçici klasöre yazılıp çalışan ikinci dosya |

Gerçek örnekler çoğunlukla birkaç türün karışımıdır.

## Kalıcılık: nereye bakılır?

Kalıcılık (persistence), yeniden başlatmadan sonra geri gelmektir.

| Yer | Kontrol |
|---|---|
| `Run` / `RunOnce` anahtarları | `reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run` |
| Zamanlanmış görevler | `schtasks /query /fo LIST /v` |
| Servisler | Yeni, imzasız, tuhaf yollu servis |
| Başlangıç klasörü | `shell:startup` |
| WMI abonelikleri | Autoruns → WMI sekmesi |

## Analistin sorusu

"Ne yapıyor?" kadar önemli bir soru daha var: **"Nasıl geri geliyor?"**
Kalıcılık noktası silinmeden yapılan temizlik yarım kalır.

## 🧪 Dene (5 dk)

Kurgusal örneğin strings dökümünde huy ve kalıcılık izlerini ara:

```bash
grep -Ei "run|schtasks|docx|pdf|appdata" /opt/akademi/g-saat-bocegi-strings.txt
```

Örnek hangi türlere benziyor? En az iki kalıcılık yöntemi bul ve her biri için kanıt satırını yaz.

## ✅ Akılda kalsın

- Tür, ada değil davranışa göre belirlenir.
- Kalıcılık noktaları: Run anahtarları, görevler, servisler, başlangıç klasörü, WMI.
- Kalıcılığı temizlenmeyen sistem, yarın yeniden hastalanır.
