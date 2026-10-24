---
id: b-11
tur: ders
baslik: "Kontrollü sızma testi araçları: Metasploit mimarisi"
sure: 7
hedefler:
  - Metasploit'in modül yapısını açıklamak
  - Sızma testi aracının izole laboratuvarda nasıl güvenle kullanılacağını bilmek
gorseller:
  - id: b-11-a
    tur: ai
    karakter: tarik
    alt: "Tünelci Tarık eski bir alet çantasını açmış; çekmecelerde etiketli anahtarlar, maymuncuklar ve dişliler duruyor, ama çanta cam bir laboratuvar kafesinin içinde"
    prompt: "A large vintage multi-drawer toolbox opened on a workbench, its drawers neatly sorted: lockpicks, keys of many shapes, small glowing payload capsules and tiny gears. The whole workbench sits inside a sealed glass laboratory enclosure. The villain studies the tools with expert respect, his green headlamp lighting the drawers, his gloved hands resting on the glass from inside."
---

# Kontrollü sızma testi araçları: Metasploit mimarisi

> Aynı alet çantası bir çilingirin de, bir hırsızın da elinde olabilir. Farkı **izin ve kapsam** belirler.
> 🕳️ **Tünel 11:** Tarık'ın kullandığı araçların çoğu herkese açık. Savunmacı onları tanımalı ki izlerini görebilsin.

![Tünelci Tarık eski bir alet çantasını açmış; çekmecelerde etiketli anahtarlar, maymuncuklar ve dişliler duruyor, ama çanta cam bir laboratuvar kafesinin içinde](../../gorseller/b-11-a.webp)

## Metasploit nedir?

Bilinen zafiyetlerin test edilmesini standartlaştıran açık kaynak bir **çerçeve**.
Profesyonel sızma testlerinde, CTF'lerde ve savunma ekiplerinin tespit kurallarını sınamasında kullanılır.

## Modül türleri

| Modül | Görevi |
|---|---|
| **auxiliary** | Tarama, keşif, bilgi toplama (sömürü yok) |
| **exploit** | Belirli bir zafiyeti tetikleyen kod |
| **payload** | Sömürü başarılı olursa hedefte çalışacak kısım |
| **post** | Erişim sonrası bilgi toplama |
| **encoder / evasion** | Yükü dönüştürme (savunmayı test etmek için) |

Her modülün bir **güvenilirlik derecesi** (rank), hedef listesi ve kaynak referansları vardır.

## Neden savunmacı öğrenir?

- Hangi zafiyetin **gerçekten** sömürülebilir olduğunu gösterir → yama önceliği.
- Bıraktığı izler (ağ trafiği, süreçler, loglar) IDS ve EDR kurallarını test eder.
- Rapordaki "teorik risk" ile "kanıtlanmış risk" farkını ortaya koyar.

## Kurallar (pazarlığa kapalı)

1. **Yalnızca izole laboratuvar ağında**, kasıtlı olarak zafiyetli eğitim makinelerine karşı.
2. Laboratuvar ağının internete ve kampüs ağına çıkışı **kapalı**.
3. Her kullanım eğitmen gözetiminde, yazılı kapsamla.

## 🧪 Dene (5 dk)

İzole laboratuvar VM'inde `msfconsole` aç ve **yalnızca** keşfet:

```text
search type:auxiliary portscan
info auxiliary/scanner/portscan/tcp
```

Modül hangi seçenekleri istiyor? `RHOSTS` neden en tehlikeli seçenektir?

## ✅ Akılda kalsın

- Metasploit modülleri: auxiliary, exploit, payload, post.
- Savunmacı onu yama önceliği ve tespit testi için kullanır.
- `RHOSTS` yalnızca laboratuvar adresidir; başka hiçbir şey değil.
