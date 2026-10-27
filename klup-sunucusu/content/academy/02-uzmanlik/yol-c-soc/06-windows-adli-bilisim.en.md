---
id: c-06
baslik: "Windows forensics: event logs, Sysmon, registry, prefetch"
hedefler:
  - Recognise critical Windows event IDs
  - Detect the traces of log clearing and clock changes
---

# Windows forensics: event logs, Sysmon, registry, prefetch

> Windows writes everything somewhere. A forensic analyst is the person who knows **where**.
> 🧹 **Trace 6:** The security log was cleared on KLP-WS07. The clearing itself carries an event ID too.

::cizgi[c-06-sahne]

## Event IDs worth memorising

| ID | Channel | Meaning |
|---|---|---|
| 4624 / 4625 | Security | Successful / failed logon (type 10 = RDP, 2 = console, 3 = network) |
| 4720 / 4732 | Security | Account created / member added to a local group |
| 7045 | System | A new service was installed (persistence!) |
| 4719 | Security | Audit policy changed |
| **1102** | Security | **The security log was cleared** |
| **4616** | Security | **The system clock was changed** |

Sysmon adds extra detail: 1 = process creation, 3 = network connection, 11 = file creation,
13 = registry, **2 = file creation time changed**, 23 = file deleted.

## The trace of what was deleted

![On the page behind a removed notebook page, the pressed marks of the pen become visible under a torch](../../gorseller/c-06-b.webp)

Attacker → defender pairings:

- **Log clearing** → event 1102 and a Sysmon 1 record showing the `wevtutil cl` command. The copy in the central SIEM survives.
- **Clock shifting** → the previous and new time in 4616; the gap that opens between event time and SIEM ingestion time.
- **Changing a file's time (timestomping)** → Sysmon 2; the file looks "old" but is new in other records.

## Registry and prefetch

- **Registry Run key** (`HKLM\...\CurrentVersion\Run`): programs that run at every startup. The classic place for persistence.
- **Prefetch** (`C:\Windows\Prefetch\*.pf`): shows that a program **ran**, how many times and when it last ran.
  Even if the file is deleted, the prefetch trace can remain.

## 🧪 Try it (5 min)

```bash
jq -c 'select(.olay_id==1102 or .olay_id==4616 or .olay_id==4719)' /opt/akademi/c-windows-olaylar.jsonl
grep -E ",2,|,23," /opt/akademi/c-sysmon.csv
```

Who cleared the log, and at what time? By how many hours was the clock shifted, and who corrected it afterwards? Why is `bakim.exe`'s "new" creation date suspicious?

## ✅ Remember

- 4624/4625, 4720/4732, 7045, 1102 and 4616 are the backbone of a Windows investigation.
- The attempt to hide leaves traces too: 1102, 4616, Sysmon 2 and 23.
- The Run key shows persistence, prefetch shows execution.
