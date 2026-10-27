---
id: g-05
tur: ders
baslik: "Dinamik analiz: debugger, breakpoint ve API izleme"
sure: 8
hedefler:
  - Debugger'da breakpoint koyup programı adım adım yürütmek
  - Analizden kaçma izlerini bulgu olarak tanımak
gorseller:
  - id: g-05-b
    tur: ai
    alt: "Mekanik bir oyuncağın dişlilerine takılmış küçük durdurma kancaları; analist her durakta parçaları inceliyor"
    prompt: "A clockwork toy running on a lab bench with several small brass hooks attached to its gears, each hook freezing the toy at a specific moment so the analyst can inspect the position of every gear with a loupe."
---

# Dinamik analiz: debugger, breakpoint ve API izleme

> Statik analiz "ne yapabilir?" der; debugger ise "şu an ne yapıyor?" sorusunu yanıtlar.
> ⚙️ **Çark 5:** Sabri'nin böceği kurma kolu çevrilince uyanıyor. Selim Hoca: "Sen onu her dişlide durdurabilirsin, Tilki."

::cizgi[g-05-sahne]

## Debugger nedir?

Debugger (hata ayıklayıcı) programı komut komut yürütür, durdurur, register'ları ve belleği gösterir.
Windows'ta **x64dbg**, Linux'ta **gdb** kullanılır.

| Tuş | İş |
|---|---|
| `F2` | Breakpoint koy / kaldır |
| `F7` | Step into — çağrının içine gir |
| `F8` | Step over — çağrıyı tek adımda geç |
| `F9` | Sonraki breakpoint'e kadar çalıştır |

## Breakpoint türleri

![Mekanik bir oyuncağın dişlilerine takılmış küçük durdurma kancaları; analist her durakta parçaları inceliyor](../../gorseller/g-05-b.webp)

- **Yazılım breakpoint'i:** belirli bir adreste dur.
- **API breakpoint'i:** `bp CreateFileW` — program dosya açmak istediği anda dur, argümanları oku.
- **Donanım / bellek breakpoint'i:** bir adres okunduğunda ya da yazıldığında dur.

Debugger yorucuysa API izleyici (API monitor) ya da Procmon, programın Windows'tan ne istediğini liste hâlinde gösterir.

## Analistin gözü: analizden kaçma

Bazı örnekler izlendiğini anlarsa uslu durur. Rapora **bulgu** olarak yazılacak izler:

- `IsDebuggerPresent`, `CheckRemoteDebuggerPresent` import'ları
- Dakikalarca süren `Sleep` çağrıları (sandbox'ın sabrını tüketmek için)
- Sanal makine sürücüsü ya da analiz aracı süreç adlarını arayan dizeler

## 🧪 Dene (8 dk)

İzole VM'de eğitmenin verdiği eğitim crackme'sini x64dbg'de aç:

```text
1. Symbols sekmesinde strcmp / lstrcmpA bul → F2
2. F9 ile çalıştır, herhangi bir parola gir
3. Durunca RCX ve RDX'in gösterdiği iki dizeyi oku (Dump penceresi)
```

Hangisi senin girdin, hangisi doğru parola? Sonra kurgusal örneğin dökümünde analizden kaçma izlerini ara:

```bash
grep -Ei "debugger|kafes|vbox|vmtools|procmon|x64dbg" /opt/akademi/g-saat-bocegi-strings.txt
```

## ✅ Akılda kalsın

- Debugger zamanı durdurur: breakpoint, step into, step over.
- API breakpoint'i programın niyetini tam o anda yakalar.
- Anti-debug ve uzun Sleep izleri bulgudur; rapora yazılır.
