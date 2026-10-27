---
id: g-12
baslik: "Final: malware analysis report for the training sample"
hedefler:
  - Examine the harmless training sample the instructor provides, from triage to dynamic analysis
  - Report the findings with an IOC list, a YARA rule and actionable recommendations
---

# Final: malware analysis report for the training sample

> Analysis isn't over without a report: everything you find must turn into something another defender can **use within minutes**.
> ⚙️ **Final cog:** The last bug in the clock tower is in the cage. Open it safely, write down how it works and stop the clock.

::cizgi[g-12-sahne]

## Mission

Examine the **harmless training sample** the instructor provides (in a password-protected archive) in the isolated analysis VM:

1. **Triage** — type, MD5 and SHA-256, size, compiler / packer (G02, G04)
2. **Static analysis** — strings, imports, sections, entropy, key functions (G03, G04, G06)
3. **Dynamic analysis** — process tree, files, registry, network (with fake services), anti-analysis traces (G05, G08)
4. **IOC list** — at least 8 indicators: file, host and network (G08)
5. **YARA rule** — catches the sample, stays quiet on clean files (G11)
6. **Recommendations** — detection, clean-up including persistence, prevention and hardening (G07, G10)

**Rules:** network off or host-only; start from the snapshot, return to the snapshot; the sample doesn't leave the VM.
Only hashes, log lines and screenshots go into the report.

## Report skeleton

![File cards showing the findings in order beside the disassembled mechanical bug, and a sealed report](../../gorseller/g-12-c.webp)

| Section | Content |
|---|---|
| **Executive summary** | What it is, what it does, risk level, the first 3 actions (half a page) |
| **Sample identity** | Name, hashes, type, size, signature, packer |
| **Static findings** | Key strings, imports, suspicious functions (address + description) |
| **Dynamic findings** | Process tree, file / registry / network activity, persistence |
| **IOC table** | Type → value → context |
| **Detection** | YARA rule + one behavioural rule idea |
| **Recommendations** | Clean-up steps, blocking, hardening |
| **Sharing** | TLP (Traffic Light Protocol) label: CLEAR, GREEN, AMBER or RED |

## Assessment

| Criterion | Score |
|---|---:|
| Safety rules followed (isolated VM, snapshot, no network) | 2 |
| Triage and static findings correct and evidenced | 2 |
| Dynamic findings backed by logs or screenshots | 2 |
| IOCs usable; YARA rule works, no false positives | 2 |
| Recommendations actionable, report legible, TLP chosen correctly | 2 |

## ✅ Remember

- Analysis ends when it turns into a report someone else can use.
- Every finding is evidenced: hash, address, log line, screenshot.
- The sample doesn't leave the lab; only its information is shared, in line with the TLP.

> 🔒 **CASE CLOSED: Clockmaker Sabri** · *when you hand in your report*
>
> ::cizgi[sabri-kapanis]
>
> ➡️ *Season 2 ends here. Season 3: the Mirror is coming soon.*
