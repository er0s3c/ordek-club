---
id: g-08
baslik: "Behaviour analysis: file, registry and network traces, and IOCs"
hedefler:
  - Run a sample safely in a sandbox and record process, file, registry and network activity
  - Produce a shareable IOC list from the findings
---

# Behaviour analysis: file, registry and network traces, and IOCs

> You know a bug best by the **traces** it leaves. Behaviour analysis records those traces.
> ⚙️ **Cog 8:** The bug wakes up in the cage. Professor Selim starts the stopwatch: "Record its every step. Find what time it will strike."

::cizgi[g-08-sahne]

## Flow

![Every move of the mechanical bug in the glass box is drawn by a four-pen recorder: file, registry, network and process](../../gorseller/g-08-c.webp)

Take a snapshot → start the monitoring tools → run the sample → wait 3–5 min → stop the recording and export it → **return to the snapshot**.
On the network side, fake services (the INetSim, FakeNet-NG idea) answer every DNS query with a lab address; not a single packet leaves for the internet.

::animasyon[dns-resolution]

## What do we monitor?

| Area | Tool | What we look for |
|---|---|---|
| Process | Process Explorer, Procmon | The process tree; `cmd.exe`, `powershell.exe` child processes |
| File | Procmon (`WriteFile`) | Files dropped in `%APPDATA%` and `%TEMP%` |
| Registry | Procmon, Regshot (before/after) | `Run` keys, new services |
| Network | Wireshark, fake service log | DNS queries, HTTP requests, User-Agent |

![File, registry and process creation events in Process Monitor filtered by the training sample's process name](../../gorseller/g-08-b.webp)

## IOC: so others can find it too

An IOC (indicator of compromise) is an indicator that lets the same malware be hunted on other systems:

- **File:** hash, name, path
- **Host:** registry value, mutex, task name
- **Network:** domain name, IP, URL, User-Agent

The hash is the indicator that changes most easily; behaviour and infrastructure are worth more (the Pyramid of Pain).

## 🧪 Try it (8 min)

Examine the fictional sample's sandbox report:

```bash
jq '.surec_agaci' /opt/akademi/g-saat-bocegi-sandbox.json
jq -r '.ag[] | [.tur, .alan_adi, .hedef] | @tsv' /opt/akademi/g-saat-bocegi-sandbox.json
jq '.registry, .zamanlanmis_gorevler, .mutex' /opt/akademi/g-saat-bocegi-sandbox.json
```

1. Draw the process tree on paper.
2. Write at least 6 IOCs in the table: 2 file, 2 host, 2 network.
3. At what time will the bug wake up again each day?

## ✅ Remember

- Snapshot → monitor → run → record → roll back.
- Fake network services show behaviour without letting a packet escape to the internet.
- IOCs are file, host and network indicators; behaviour is worth more than a hash.
