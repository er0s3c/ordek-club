---
id: g-07
baslik: "Malware types and persistence indicators"
hedefler:
  - Distinguish malware types by their behaviour
  - Check the persistence points on Windows
---

# Malware types and persistence indicators

> You know malware not by its name but by its **habits**: what does it hide, how does it spread, how does it come back?
> ⚙️ **Cog 7:** Every bug in Sabri's window has a different habit. Professor Selim: "Which one is ours? Prove it."

::cizgi[g-07-sahne]

## Types by behaviour

| Type | Behaviour | Typical trace |
|---|---|---|
| **Trojan** | Looks useful, does hidden work | Disguised as an update, unexpected connection |
| **Worm** | Spreads by itself | Connections to many hosts, copying to USB drives |
| **Ransomware** | Encrypts files and demands money | Mass renaming, deletion of shadow copies |
| **Infostealer** | Collects passwords, cookies, documents | Access to the browser profile and the documents folder |
| **RAT** (remote access trojan) | Provides remote control | Regular "beacon" traffic at intervals |
| **Loader / dropper** | Drops or downloads the real payload | A second file written to a temporary folder and run |

Real samples are usually a mixture of several types.

## Persistence: where do you look?

![A house's scheduled reminders: a spring attached to the wall clock, a doorbell wired to the door, and a hidden hatch at the service entrance](../../gorseller/g-07-b.webp)

Persistence means coming back after a reboot.

| Place | Check |
|---|---|
| `Run` / `RunOnce` keys | `reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run` |
| Scheduled tasks | `schtasks /query /fo LIST /v` |
| Services | A new, unsigned service with an odd path |
| Startup folder | `shell:startup` |
| WMI subscriptions | Autoruns → WMI tab |

## The analyst's question

There's another question as important as "What does it do?": **"How does it come back?"**
Clean-up done without removing the persistence point is half a job.

## 🧪 Try it (5 min)

Search the fictional sample's strings dump for habit and persistence traces:

```bash
grep -Ei "run|schtasks|docx|pdf|appdata" /opt/akademi/g-saat-bocegi-strings.txt
```

Which types does the sample resemble? Find at least two persistence methods and write the evidence line for each.

## ✅ Remember

- The type is determined by behaviour, not by name.
- Persistence points: Run keys, tasks, services, the startup folder, WMI.
- A system whose persistence isn't cleaned will fall ill again tomorrow.
