---
id: g-07
tur: ders
baslik: "Zararlı yazılım türleri ve kalıcılık göstergeleri"
sure: 7
hedefler:
  - Zararlı yazılım türlerini davranışlarına göre ayırt etmek
  - Windows'ta kalıcılık noktalarını kontrol etmek
gorseller:
  - id: g-07-b
    tur: ai
    alt: "Bir evin zamanlanmış hatırlatıcıları: duvar saatine bağlı yay, kapının açılış zili ve servis girişindeki gizli kapı"
    prompt: "A mansion hallway inspected with a flashlight: a wall clock with a hidden spring mechanism, a doorbell wired to start a music box whenever the door opens, and a small service hatch near the floor with fresh scratches around it."
---

# Zararlı yazılım türleri ve kalıcılık göstergeleri

> Zararlıyı adıyla değil **huyuyla** tanırsın: ne saklıyor, nasıl yayılıyor, nasıl geri geliyor?
> ⚙️ **Çark 7:** Sabri'nin vitrininde her böceğin başka bir huyu var. Selim Hoca: "Bizimki hangisi? Kanıtla söyle."

::cizgi[g-07-sahne]

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

![Bir evin zamanlanmış hatırlatıcıları: duvar saatine bağlı yay, kapının açılış zili ve servis girişindeki gizli kapı](../../gorseller/g-07-b.webp)

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
