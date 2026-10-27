---
id: g-04
baslik: "Static analysis: hash, strings, entropy and Ghidra"
hedefler:
  - Carry out the first 10 minutes of triage on a sample
  - Recognise the signs of packing and move from imports to code in Ghidra
---

# Static analysis: hash, strings, entropy and Ghidra

> You can make the bug talk without running it: the file itself says a lot, if you ask.
> ⚙️ **Cog 4:** Sabri wraps his bugs in layer after layer. Professor Selim: "Count the packaging, then look inside."

::cizgi[g-04-sahne]

## Triage: the first 10 minutes

```bash
file ornek.exe_            # real type (don't trust the extension)
sha256sum ornek.exe_       # identity: for the report and the IOC list
strings -n 6 ornek.exe_    # ASCII strings
strings -n 6 -el ornek.exe_  # UTF-16 strings (common on Windows)
```

Searching a hash is fine; **uploading** the sample itself to public services without the instructor's permission is not.

## What do strings give away?

Domain names, IPs, URLs, registry paths, file names, mutex names, error messages.
If there are almost no readable strings, the file may be **packed**.

## Packing and entropy

![A tightly wrapped parcel with no visible contents beside an open, orderly box; the parcel's texture like random static](../../gorseller/g-04-c.webp)

A packer compresses or encrypts the code and unpacks it in memory when it runs. The analyst's job is to **recognise** it:

| Sign | Normal | Suspicious |
|---|---|---|
| Section entropy | 5–6.5 | 7.2+ (close to 8 = looks random) |
| Number of imports | Dozens | A handful: `LoadLibraryA`, `GetProcAddress`, `VirtualAlloc` |
| Readable strings | Plenty | Almost none |

Detect It Easy (DIE) recognises known packers and compilers.

## A first look at Ghidra

Import into the project → auto analysis → **Symbol Tree › Imports** → right-click an interesting API → **References** →
read the calling function in the **Decompile** window → give it a meaningful name (the `L` key).

![The Decompile window in Ghidra showing the training crackme's import list and password comparison](../../gorseller/g-04-b.webp)

## 🧪 Try it (8 min)

Search the fictional sample's dumps:

```bash
grep -Ei "http|\.test|software|global" /opt/akademi/g-saat-bocegi-strings.txt
grep -A6 "Bölümler" /opt/akademi/g-saat-bocegi-pe.txt
```

1. Write at least 4 IOC candidates: domain name, IP, registry path, mutex.
2. Which section looks like it carries a packed or encrypted payload? What's your evidence?

## ✅ Remember

- Triage order: type → hash → strings → PE structure → imports.
- High entropy + few imports + few strings = suspicion of packing.
- In Ghidra, work backwards from an interesting API to the code that calls it.
