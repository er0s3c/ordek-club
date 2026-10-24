---
id: g-06
tur: ders
baslik: ".NET analizi: IL ve decompile edilmiş kod"
sure: 7
hedefler:
  - Bir dosyanın .NET olduğunu tanımak ve decompiler ile okumak
  - Gizleme (obfuscation) ve ikinci aşama yükleme izlerini fark etmek
gorseller:
  - id: g-06-a
    tur: ai
    karakter: sabri
    alt: "Saatçi Sabri cam kabuklu böceğinin bütün dişlilerinin dışarıdan görünmesine bozuluyor ve üstünü minik bir bezle örtmeye çalışıyor; arkadaki perdeye böceğin düzgün montaj şeması yansıyor"
    prompt: "On the workbench stands a clockwork beetle with a fully transparent glass shell, every gear and spring inside clearly visible. Behind it a projector casts a neat, perfectly readable assembly diagram of the same beetle onto a hanging screen, drawn with abstract symbols and arrows. The villain, dismayed, hurriedly tries to cover the glass shell with a tiny embroidered cloth that is far too small."
---

# .NET analizi: IL ve decompile edilmiş kod

> Bazı programlar makine koduna değil, ara bir dile derlenir. Onları okumak neredeyse kaynak kodu okumak gibidir.
> ⚙️ **Çark 6:** Böceklerden biri farklı tıkırdıyor: .NET ile yapılmış. Selim Hoca: "Bu kez dişliler cam kabuğun ardında."

![Saatçi Sabri cam kabuklu böceğinin bütün dişlilerinin dışarıdan görünmesine bozuluyor ve üstünü minik bir bezle örtmeye çalışıyor; arkadaki perdeye böceğin düzgün montaj şeması yansıyor](../../gorseller/g-06-a.webp)

## Neden bu kadar okunaklı?

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
