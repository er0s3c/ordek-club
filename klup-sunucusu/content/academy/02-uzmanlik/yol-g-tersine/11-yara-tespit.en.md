---
id: g-11
baslik: "Detection: YARA rules and behavioural indicators"
hedefler:
  - Write a YARA rule for a sample that doesn't produce false positives
  - Complement file indicators with behavioural indicators
animasyonlar:
  - soc-alert
---

# Detection: YARA rules and behavioural indicators

> You analyse a bug once; if you write a good rule you catch **all its siblings** everywhere.
> ⚙️ **Cog 11:** Sabri's bugs resemble each other. Professor Selim: "Write a single fingerprint that knows them all; let the clock never strike again."

::cizgi[g-11-sahne]

## What is YARA?

YARA is a rule language that scans files and memory against **patterns** — "grep for malware".

```yara
rule Ornek_Kural
{
    meta:
        yazar = "Tilki"
        tlp   = "CLEAR"
    strings:
        $mutex = "Global\\OrnekMutex" ascii wide
        $ua    = "OrnekAjan/2.0"
        $hex   = { 4F 52 4E 45 4B }   // "ORNEK"
    condition:
        uint16(0) == 0x5A4D and 2 of them
}
```

## Three features of a good rule

![A key pattern: a single key that fits only the right lock, neither too general nor too narrow](../../gorseller/g-11-b.webp)

- **Target what doesn't change:** a unique string, a mutex, a distinctive code fragment. IPs and version numbers change easily.
- **Not too general:** `"http"` is in almost every program → a false positive.
- **Tested:** first against the sample, then against a large collection of clean files.

## Behavioural indicators

YARA catches the file; behaviour is visible in the system:

- A `winword.exe` → `powershell.exe` child process
- Hundreds of files renamed within minutes
- An unsigned task running from `%APPDATA%`, triggered at the same hour every night

These indicators turn into SIEM and EDR rules (e.g. Sigma) and arrive at the SOC as alerts.

::animasyon[soc-alert]

## 🧪 Try it (8 min)

Complete the exercise rule in the Linux helper VM:

```bash
cp /opt/akademi/g-yara-alistirma.yar ~/kural.yar
nano ~/kural.yar                                   # fill in the "____" blanks
yara -s ~/kural.yar /opt/akademi/g-saat-bocegi-strings.txt
yara -r ~/kural.yar /usr/bin/                      # clean files: there should be no match
```

Why is the second rule in the file bad? Write its two problems and fix them.

## ✅ Remember

- YARA = pattern + condition; target the things that don't change.
- Test every rule against clean files for false positives.
- Complement a file indicator with a behavioural indicator.
