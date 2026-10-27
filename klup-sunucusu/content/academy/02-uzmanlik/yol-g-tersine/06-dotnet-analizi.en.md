---
id: g-06
baslik: ".NET analysis: IL and decompiled code"
hedefler:
  - Recognise that a file is .NET and read it with a decompiler
  - Notice the signs of obfuscation and second-stage loading
---

# .NET analysis: IL and decompiled code

> Some programs aren't compiled to machine code but to an intermediate language. Reading them is almost like reading source code.
> ⚙️ **Cog 6:** One of the bugs ticks differently: it's built with .NET. Professor Selim: "This time the gears are behind a glass shell."

::cizgi[g-06-sahne]

## Why is it so readable?

![A box that looks locked but is actually glass, with the recipe cards inside clearly readable](../../gorseller/g-06-b.webp)

The .NET compiler produces **IL** (Intermediate Language) instead of machine code. Class, method and field names
stay in the file's metadata. A decompiler turns the IL back into something close to the original C# code.

## How do you tell it's .NET?

- "Mono/.Net assembly" in the `file` output
- A single line in the import table: `mscoree.dll` → `_CorExeMain`
- Detect It Easy: "Library: .NET"

## Tools

| Tool | Job |
|---|---|
| **ILSpy** | Open-source decompiler; C# view and search |
| **dnSpyEx** | Decompile + debug at C# level |
| `monodis` / `ildasm` | Raw IL dump |

## What the analyst looks for

- **Meaningless names:** `a`, `b`, `ʘʘʘ` — an obfuscation tool has been used.
- **An encrypted string table** and a single method that decrypts it at runtime.
- `Assembly.Load(byte[])` — a second stage that isn't visible on disk being loaded from memory.
- `WebClient`, `HttpClient`, `Registry.SetValue` calls — network and persistence.

Detecting and noting it is enough; obfuscation-unpacking tools are used only on the training sample, with the instructor.

## 🧪 Try it (6 min)

Open the instructor's .NET training sample in ILSpy in the isolated VM:

```text
1. Find the Main method → write the first 3 things the program does
2. Search the search box for "http", "Registry" and "Assembly.Load"
3. Is there a sign of obfuscation? In which class?
```

## ✅ Remember

- .NET produces IL; a decompiler gives back something close to C# code.
- The `mscoree.dll` import is the signature of a .NET file.
- `Assembly.Load(byte[])` and an encrypted string table suggest a second stage.
