---
id: g-02
baslik: "Windows internals: process, DLL and the PE format"
hedefler:
  - Distinguish the concepts of process, thread, DLL and API
  - Read the header, sections and import table of a PE file
---

# Windows internals: process, DLL and the PE format

> A `.exe` file isn't random bytes; it's an orderly **cabinet**. Whoever knows what's in which drawer knows where to look.
> ⚙️ **Cog 2:** The bug on the USB drive is disguised as a campus update. Professor Selim: "You can't open it up without knowing its shell."

::cizgi[g-02-sahne]

## Four concepts

- **Process:** the running program's own memory space.
- **Thread:** the unit that executes code inside a process.
- **DLL** (dynamic link library): a code library shared by programs — `kernel32.dll`, `advapi32.dll`.
- **API:** a program asking Windows to do something — open a file, write to the registry, connect to the internet.

## The PE format

![A program file opened like a book: cover page, table of contents, chapters and appendices](../../gorseller/g-02-b.webp)

PE (Portable Executable) is the structure of `.exe`, `.dll` and `.sys` files.

| Part | What does it say? |
|---|---|
| **DOS header** | The first two bytes `4D 5A` ("MZ"): "I am a Windows executable" |
| **PE header** | Architecture (x86/x64), compile time (timestamp), entry point |
| **Sections** | `.text` code, `.rdata` constants, `.data` data, `.rsrc` icon and version info |
| **Import table** | Which APIs it uses from which DLL |

## Why does the analyst care?

- Imports whisper intent: `RegSetValueExW` → it will write to the registry, `HttpSendRequestA` → it will send data.
- An unfamiliar section name, a section that's both writable **and** executable (RWX), an entry point outside `.text` → suspicious.
- Compile time and version info are easily forged; they aren't evidence on their own.

## 🧪 Try it (5 min)

In the Linux helper VM, open the PE summary of the fictional sample:

```bash
less /opt/akademi/g-saat-bocegi-pe.txt
```

1. What's the architecture, and is there a signature?
2. Which section has an odd name, and what are its permissions? Which section is the entry point (`0xC1A0`) inside?
3. Look at the compile time: do you think it's real?

## ✅ Remember

- A PE file consists of a header, sections and an import table.
- The import table gives away what the program wants to do.
- An odd section and an entry point outside it is a suspicion of packing.
