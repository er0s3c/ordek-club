---
id: f-11
baslik: "IoT security testing: threat model and firmware inventory"
hedefler:
  - Produce an attack surface map and threat model for an IoT device
  - Map findings to the OWASP IoT Top 10 and prepare a firmware component inventory
---

# IoT security testing: threat model and firmware inventory

> Testing isn't hunting for random flaws. First you draw the **map**, then you inspect each door one by one.
> 🔧 **Circuit 11:** Leman has marked every device's doors on a plan. Draw the same plan for defence.

::cizgi[f-11-sahne]

## Attack surface map

![Entry points marked around a smart device: mobile app, cloud, wireless connection and physical pins](../../gorseller/f-11-b.webp)

Think of a device in seven layers: **hardware** (UART, flash) · **firmware** · **local network services** · **radio** (Wi-Fi, BLE) ·
**mobile app** · **cloud API** · **update channel**. For each layer ask: who accesses it, what protects it, and if it fails what do we lose?

## OWASP IoT Top 10

| # | Heading |
|---|---|
| I1 | Weak, guessable or hardcoded passwords |
| I2 | Insecure network services |
| I3 | Insecure ecosystem interfaces (cloud, API, mobile) |
| I4 | Lack of a secure update mechanism |
| I5 | Insecure or outdated components |
| I6 | Insufficient privacy protection |
| I7 | Insecure data transfer and storage |
| I8 | Lack of device management |
| I9 | Insecure default settings |
| I10 | Lack of physical hardening |

## Firmware inventory

An inventory (SBOM, Software Bill of Materials): every component in the firmware and its version.

```text
component   version   release   known flaw?
BusyBox     1.24.1    2016      search the CVE database
OpenSSL     1.0.2k    2017      end of support reached
```

An old library makes the whole device old.

## Test flow

1. **Scope and written permission** — which device, which method, which hours.
2. Map → threat list → test plan.
3. Collect evidence: command, output, screenshot.
4. Map the finding to the Top 10, write its risk, recommend a fix.

## 🧪 Try it (6 min)

Examine the door controller in `content/academy/lab/f-cihaz-config.txt`. Find at least **seven** problems and
map each one to an OWASP IoT Top 10 heading. Pick the three most critical and write why in one sentence each.

## ✅ Remember

- Map first, test second; scope and permission always in writing.
- The OWASP IoT Top 10 reports findings in a common language.
- A firmware inventory makes outdated components visible.
