---
id: b-11
tur: ders
baslik: "Kontrollü sızma testi araçları: Metasploit mimarisi"
sure: 7
hedefler:
  - Metasploit'in modül yapısını açıklamak
  - Sızma testi aracının izole laboratuvarda nasıl güvenle kullanılacağını bilmek
gorseller:
  - id: b-11-b
    tur: ai
    alt: "Çekmeceli bir alet dolabı: keşif büyüteçleri, kilit açma aletleri, küçük teslim kutuları ve iz temizleme fırçaları ayrı bölmelerde"
    prompt: "A large wooden tool cabinet opened like a museum display, with separate drawers holding magnifying glasses and stethoscopes, lock-opening tools, small sealed delivery boxes, and cleaning brushes, each drawer lit by a small lamp, a small green lab tag hanging from one handle."
---

# Kontrollü sızma testi araçları: Metasploit mimarisi

> Aynı alet çantası bir çilingirin de, bir hırsızın da elinde olabilir. Farkı **izin ve kapsam** belirler.
> 🕳️ **Tünel 11:** Tarık'ın kullandığı araçların çoğu herkese açık. Savunmacı onları tanımalı ki izlerini görebilsin.

::cizgi[b-11-sahne]

## Metasploit nedir?

Bilinen zafiyetlerin test edilmesini standartlaştıran açık kaynak bir **çerçeve**.
Profesyonel sızma testlerinde, CTF'lerde ve savunma ekiplerinin tespit kurallarını sınamasında kullanılır.

## Modül türleri

![Çekmeceli bir alet dolabı: keşif büyüteçleri, kilit açma aletleri, küçük teslim kutuları ve iz temizleme fırçaları ayrı bölmelerde](../../gorseller/b-11-b.webp)

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
