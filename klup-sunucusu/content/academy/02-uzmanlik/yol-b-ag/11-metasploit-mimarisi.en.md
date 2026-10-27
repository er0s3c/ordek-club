---
id: b-11
baslik: "Controlled penetration testing tools: Metasploit architecture"
hedefler:
  - Explain the module structure of Metasploit
  - Know how to use a penetration testing tool safely in an isolated lab
---

# Controlled penetration testing tools: Metasploit architecture

> The same toolbox can be in the hands of a locksmith or a burglar. **Permission and scope** make the difference.
> 🕳️ **Tunnel 11:** Most of the tools Tarık uses are publicly available. A defender has to know them to be able to see their traces.

::cizgi[b-11-sahne]

## What is Metasploit?

An open-source **framework** that standardises the testing of known vulnerabilities.
It's used in professional penetration tests, in CTFs, and by defence teams to test their detection rules.

## Module types

![A tool cabinet with drawers: discovery magnifiers, lock-opening tools, small delivery boxes and trace-cleaning brushes in separate compartments](../../gorseller/b-11-b.webp)

| Module | Its job |
|---|---|
| **auxiliary** | Scanning, discovery, information gathering (no exploitation) |
| **exploit** | Code that triggers a specific vulnerability |
| **payload** | The part that runs on the target if exploitation succeeds |
| **post** | Information gathering after access |
| **encoder / evasion** | Transforming the payload (to test defences) |

Every module has a **reliability rank**, a target list and source references.

## Why does a defender learn it?

- It shows which vulnerability is **actually** exploitable → patching priority.
- The traces it leaves (network traffic, processes, logs) test IDS and EDR rules.
- It brings out the difference between "theoretical risk" and "proven risk" in a report.

## Rules (non-negotiable)

1. **Only on the isolated lab network**, against intentionally vulnerable training machines.
2. The lab network's connection to the internet and the campus network is **closed**.
3. Every use is under instructor supervision, with written scope.

## 🧪 Try it (5 min)

Open `msfconsole` on the isolated lab VM and **only** explore:

```text
search type:auxiliary portscan
info auxiliary/scanner/portscan/tcp
```

Which options does the module ask for? Why is `RHOSTS` the most dangerous option?

## ✅ Remember

- Metasploit modules: auxiliary, exploit, payload, post.
- A defender uses it for patching priority and for testing detection.
- `RHOSTS` is the lab address only; nothing else.
