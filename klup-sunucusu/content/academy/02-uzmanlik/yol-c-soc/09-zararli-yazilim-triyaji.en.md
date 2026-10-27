---
id: c-09
baslik: "Malware triage: hash, strings, YARA and sandbox"
hedefler:
  - Do a first examination of a suspicious file without running it
  - Write a simple YARA rule
---

# Malware triage: hash, strings, YARA and sandbox

> You can learn a lot before **running** a suspicious file. Triage is the quick answer to "what is this, and how dangerous is it?"
> 🧹 **Trace 9:** `bakim.exe` calls itself "Windows Maintenance Service". The strings inside it say something else.

::cizgi[c-09-sahne]

## Rule one: an isolated environment only

![A mechanical beetle being examined inside a thick glass box; gloved hands control it with arms from outside](../../gorseller/c-09-b.webp)

Samples are opened **only** in the club's offline analysis VM. A malicious sample is not opened on your own computer,
in a shared folder or in email. Files are carried in a password-protected archive.

## Static triage steps

| Step | Tool | What do you learn? |
|---|---|---|
| **Hash** | `sha256sum` | The file's fingerprint; searched in threat intelligence |
| **Type** | `file` | The extension lies, the file header doesn't |
| **Strings** | `strings -n 6` | Domains, paths, registry keys, API names |
| **Rule** | `yara` | Does it match known patterns? |

```bash
sha256sum ornek.bin
file ornek.bin
strings -n 6 ornek.bin | less
```

**Searching** a hash on threat intelligence platforms is safe; uploading the file itself is not.
A file that may contain internal documents or personal data is not sent to an external service without permission.

## YARA: recognising by pattern

```text
rule Kulup_BakimAjan
{
    meta:
        aciklama = "Shield: bakim.exe family"
    strings:
        $a = "guncelleme.kotu.test" ascii
        $b = "WinBakimSvc" ascii
        $c = "BakimAjan" ascii
    condition:
        2 of them
}
```

`2 of them` reduces false positives on files where a single string happens to appear.

## How do you read a sandbox report?

A sandbox runs the file in an isolated VM and reports its behaviour. Look at the report with three questions:
**Which processes did it launch? Where did it connect? What did it leave behind (file, service, registry)?**
These answers are the IOAs from C05.

## 🧪 Try it (5 min)

With the synthetic `strings` output (plain text, not a real file):

```bash
grep -E "\.test|Run|Svc|/k/" /opt/akademi/c-bakim-strings.txt
yara kulup.yar /opt/akademi/c-bakim-strings.txt
```

Save the rule as `kulup.yar`. Does it match? From the strings, which persistence method and which beacon interval (in seconds) can you work out?

## ✅ Remember

- Hash, type and strings first; running it last, and only in an isolated environment.
- YARA recognises a family by combining several strings with a condition.
- A sandbox report answers three questions: what ran, where it connected, what it left behind.
