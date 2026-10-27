---
id: g-01
tur: ders
baslik: "Tersine mühendislik nedir? Güvenli analiz laboratuvarı"
sure: 7
hedefler:
  - Statik ve dinamik analiz farkını açıklamak
  - İzole analiz sanal makinesini güvenle hazırlamak
gorseller:
  - id: g-01-b
    tur: ai
    alt: "Kablolarla dış dünyaya bağlı olmayan, kalın camlı ve kilitli bir analiz odası; içinde bir bilgisayar ve geri alma düğmesi"
    prompt: "A thick-walled glass analysis room in a basement lab, no cables leading outside, a single computer inside next to a big rewind lever that resets the room to a clean state, an analyst observing through the glass."
---

# Tersine mühendislik nedir? Güvenli analiz laboratuvarı

> Kaynak kodu yok, elinde yalnızca bir dosya var. Tersine mühendislik (reverse engineering), o dosyanın **gerçekte** ne yaptığını ortaya çıkarır.
> ⚙️ **Çark 1:** Selim Hoca masana mühürlü bir USB bırakıyor: "Kampüs ağında Sabri'nin böceklerinden birini yakaladık. Açmadan önce kafesini kur, Tilki."

::cizgi[g-01-sahne]

## İki bakış

| Yöntem | Ne yapar? | Örnek araç |
|---|---|---|
| **Statik analiz** (static analysis) | Dosyayı **çalıştırmadan** inceler | `file`, strings, PE görüntüleyici, Ghidra |
| **Dinamik analiz** (dynamic analysis) | İzole ortamda çalıştırıp **davranışı** izler | Procmon, x64dbg, sahte ağ servisleri |

İyi analist ikisini birlikte kullanır: statik analiz ipucu verir, dinamik analiz doğrular.

## Analiz laboratuvarı

![Kablolarla dış dünyaya bağlı olmayan, kalın camlı ve kilitli bir analiz odası; içinde bir bilgisayar ve geri alma düğmesi](../../gorseller/g-01-b.webp)

- **Windows analiz VM'i** — FLARE-VM fikri: analiz araçlarıyla donatılmış bir Windows. Örnek burada açılır.
- **Linux yardımcı VM** — REMnux fikri: strings, YARA, sahte DNS/HTTP servisleri.
- İkisi yalnızca **host-only** ağda birbirini görür; internete ve kampüs ağına çıkış yoktur.

## Pazarlığa kapalı kurallar

1. Örneği açmadan önce **temiz snapshot** al; iş bitince ona geri dön.
2. Ağ **kapalı** ya da host-only; paylaşılan klasör, ortak pano (clipboard) ve sürükle-bırak **kapalı**.
3. Yalnızca eğitmenin verdiği **eğitim örnekleri**, EICAR test dosyası ve herkese açık crackme'ler. Canlı zararlı yazılım **indirilmez**.
4. Örnek **asla** kişisel bilgisayarında açılmaz; parola korumalı arşivde ve uzantısı bozulmuş (`.exe_`) hâlde taşınır.

## 🧪 Dene (5 dk)

Analiz VM'inin ayarlarını aç ve bu listeyi doldur:

```text
[ ] Ağ bağdaştırıcısı : host-only ya da bağlı değil
[ ] Paylaşılan klasör : kapalı
[ ] Pano / sürükle-bırak: kapalı
[ ] Snapshot adı      : temiz-baslangic
```

Sonra VM içinde, eğitmenin laboratuvar imajında hazır gelen EICAR test dosyasının özetini al.
EICAR zararsızdır; antivirüslerin tanıdığı bir deneme dosyasıdır.

```powershell
Get-FileHash .\eicar.com.txt -Algorithm SHA256
```

## ✅ Akılda kalsın

- Statik analiz ipucu verir, dinamik analiz doğrular.
- Örnek yalnızca snapshot'lı, ağsız, paylaşımı kapalı VM'de açılır.
- Canlı zararlı indirilmez; yalnızca eğitim örnekleri kullanılır.
