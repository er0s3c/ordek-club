---
id: g-06
tur: ders
baslik: ".NET analizi: IL ve decompile edilmiş kod"
sure: 7
hedefler:
  - Bir dosyanın .NET olduğunu tanımak ve decompiler ile okumak
  - Gizleme (obfuscation) ve ikinci aşama yükleme izlerini fark etmek
gorseller:
  - id: g-06-b
    tur: ai
    alt: "Kilitli gibi görünen bir kutunun aslında cam olduğu ve içindeki tarif kartlarının açıkça okunabildiği sahne"
    prompt: "A box that looks like a sturdy locked chest from a distance, but up close it is made of clear glass, and an analyst can easily see the neatly arranged recipe cards and diagrams inside without opening it."
---

# .NET analizi: IL ve decompile edilmiş kod

> Bazı programlar makine koduna değil, ara bir dile derlenir. Onları okumak neredeyse kaynak kodu okumak gibidir.
> ⚙️ **Çark 6:** Böceklerden biri farklı tıkırdıyor: .NET ile yapılmış. Selim Hoca: "Bu kez dişliler cam kabuğun ardında."

::cizgi[g-06-sahne]

## Neden bu kadar okunaklı?

![Kilitli gibi görünen bir kutunun aslında cam olduğu ve içindeki tarif kartlarının açıkça okunabildiği sahne](../../gorseller/g-06-b.webp)

.NET derleyicisi makine kodu yerine **IL** (Intermediate Language) üretir. Sınıf, metot ve alan adları
dosyadaki metadata'da kalır. Decompiler, IL'yi neredeyse orijinal C# koduna geri çevirir.

## .NET olduğunu nasıl anlarsın?

- `file` çıktısında "Mono/.Net assembly" ifadesi
- Import tablosunda tek satır: `mscoree.dll` → `_CorExeMain`
- Detect It Easy: "Library: .NET"

## Araçlar

| Araç | İş |
|---|---|
| **ILSpy** | Açık kaynak decompiler; C# görünümü ve arama |
| **dnSpyEx** | Decompile + C# seviyesinde debug |
| `monodis` / `ildasm` | Ham IL dökümü |

## Analistin aradığı izler

- **Anlamsız adlar:** `a`, `b`, `ʘʘʘ` — gizleme (obfuscation) aracı kullanılmış.
- **Şifreli dize tablosu** ve onları çalışırken çözen tek bir metot.
- `Assembly.Load(byte[])` — diskte görünmeyen ikinci aşamanın bellekten yüklenmesi.
- `WebClient`, `HttpClient`, `Registry.SetValue` çağrıları — ağ ve kalıcılık.

Tespit etmek ve not almak yeter; gizlemeyi çözme araçları yalnızca eğitim örneğinde, eğitmenle kullanılır.

## 🧪 Dene (6 dk)

İzole VM'de eğitmenin .NET eğitim örneğini ILSpy'de aç:

```text
1. Main metodunu bul → programın ilk yaptığı 3 işi yaz
2. Arama kutusunda "http", "Registry" ve "Assembly.Load" ara
3. Gizleme izi var mı? Hangi sınıfta?
```

## ✅ Akılda kalsın

- .NET IL üretir; decompiler neredeyse C# kodunu geri verir.
- `mscoree.dll` import'u bir .NET dosyasının imzasıdır.
- `Assembly.Load(byte[])` ve şifreli dize tablosu, ikinci aşama şüphesidir.
