---
id: d-07
baslik: "MITRE ATT&CK: put behaviour into a shared language"
hedefler:
  - Map observed behaviour to ATT&CK tactics and techniques
  - Explain why technique overlap alone is not proof of attribution
---

# MITRE ATT&CK: put behaviour into a shared language

> Instead of saying "a macro document opened PowerShell", you say `T1059.001`; analysts anywhere in the world understand the same thing.
> 🚩 **Flag 7:** The blog says "exactly the same as MERCAN-7's techniques". Bedri reads the public reports too.

::cizgi[d-07-sahne]

## Structure

- **Tactic:** the goal — *why?* (Initial Access, Persistence, Command and Control…)
- **Technique:** the way — *how?* (`T1053` Scheduled Task/Job)
- **Sub-technique:** the detail (`T1053.005` Scheduled Task)
- **Procedure:** a specific actor's concrete implementation ("the task named `MercanSync`, at logon")

## Map the case

| Observation (K1) | Tactic | Technique |
|---|---|---|
| Scholarship-themed email with a macro attachment | Initial Access | `T1566.001` Spearphishing Attachment |
| The user opens the document | Execution | `T1204.002` Malicious File |
| `powershell -enc` | Execution | `T1059.001` PowerShell |
| Encoded command | Defense Evasion | `T1027` Obfuscated Files or Information |
| The `MercanSync` task | Persistence | `T1053.005` Scheduled Task |
| Running a DLL with `rundll32` | Defense Evasion | `T1218.011` Rundll32 |
| HTTPS every 15 minutes | Command and Control | `T1071.001` Web Protocols |

## The detection gap

![Some drawers in a wall cabinet are lit green, others are dark; the analyst is marking the dark ones](../../gorseller/d-07-b.webp)

Open a layer in ATT&CK Navigator: colour the campaign's techniques in one colour and **the detection rules you have** in another.
The cells that don't overlap are Fox's to-do list.

## Overlap ≠ attribution

Techniques are publicly documented; reading a group's report is enough to imitate it.
What really distinguishes an actor is **procedure detail** and **more than one independent type of evidence** (infrastructure, timing, tooling, target selection).
According to K5, MERCAN-7 uses WMI for persistence and DNS for command and control. This campaign, however, uses a scheduled task and HTTPS.

## 🧪 Try it (5 min)

Find MERCAN-7's two historical behaviours described in K5 in ATT&CK (hint: `T1546.003`, `T1071.004`).
Compare them with the campaign techniques in the table: how many techniques are shared, how many differ? What does that result say about attribution?

## ✅ Remember

- Tactic is "why", technique is "how", procedure is "exactly how".
- Overlay the campaign and your detections in Navigator; the gaps become visible.
- Technique overlap can be imitated; on its own it isn't enough for attribution.
