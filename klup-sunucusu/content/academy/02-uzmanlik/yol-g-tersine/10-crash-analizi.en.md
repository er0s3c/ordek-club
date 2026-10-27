---
id: g-10
baslik: "Exploit development fundamentals: crash analysis, ASLR and DEP"
hedefler:
  - Assess how serious a crash is from the debugger output
  - Verify that memory protections (canary, DEP, ASLR, CFG) are enabled
---

# Exploit development fundamentals: crash analysis, ASLR and DEP

> Every crash is a bug, but some crashes are **a door left ajar**. Telling which is which sets the patch priority.
> ⚙️ **Cog 10:** One of Sabri's bugs is crashing an old program in the lab. Professor Selim: "Accident or door? Read the crash."

::cizgi[g-10-sahne]

## Rules first

This topic is studied **only** on deliberately vulnerable programs written for training, in an isolated VM and under the instructor's supervision.
If you find a flaw in real software: don't use it, make a **responsible disclosure**.

## Reading a crash

![A detective tracing backwards from the last tile of a fallen line of dominoes](../../gorseller/g-10-b.webp)

| Indicator | Question |
|---|---|
| Exception code | `0xC0000005` (access violation): while reading or while writing? |
| `RIP` value | A meaningful address, or `0x4141414141414141` as if it came from the input? |
| Stack | Have the return addresses been corrupted? |

If `RIP` is filled with input data, the crash is **controllable**: a critical finding, top patch priority.

## Protections

| Protection | What does it do? |
|---|---|
| **Stack canary** | Places a secret value in front of the return address; if it's corrupted the program stops |
| **DEP / NX** | Bytes in data regions can't be executed as code |
| **ASLR** | Modules load at a different address each time; guessing addresses becomes harder |
| **CFG / CET** | Validates the target of indirect calls and returns |

Protections come layer by layer. The defender's job is to make sure they're **all** enabled and that no old, unprotected module is left.
The line `DYNAMIC_BASE yok` in the fictional sample's PE summary is exactly such a finding.

## 🧪 Try it (5 min)

In the analysis VM, check the protections at system and single-program level:

```powershell
Get-ProcessMitigation -System
Get-ProcessMitigation -Name notepad.exe
```

In the Linux helper VM, compare three programs:

```bash
checksec --file=/usr/bin/ls
```

Are DEP, ASLR and CFG on? Which program is missing PIE or a canary?

## ✅ Remember

- This work is done only on training programs; a real flaw is disclosed responsibly.
- If `RIP` is filled with input data, the crash is a critical finding.
- Canary, DEP, ASLR and CFG work together; verify that they're all enabled.
