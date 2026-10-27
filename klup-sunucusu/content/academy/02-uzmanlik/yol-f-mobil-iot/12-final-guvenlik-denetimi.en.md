---
id: f-12
baslik: "Final: smart device and mobile app security audit"
hedefler:
  - Assess a lab smart device kit or a deliberately vulnerable training app end to end
  - Prioritise findings by risk and recommend actionable fixes
---

# Final: smart device and mobile app security audit

> An audit isn't about finding a single flaw; it's about **mapping every door of the device, proving it and closing it**.
> 🔧 **Final circuit:** The lab bench is yours. Open every eye and ear Leman installed, examine it, close it.

::cizgi[f-12-sahne]

## Mission

Pick **one** target approved by your instructor and assess it **with a written scope**:

- **A — Lab kit:** ESP32 door lock prototype + lab MQTT broker + the accompanying mobile app
- **B — Training app:** DIVA, InsecureBankv2 or an OWASP MASTG test app (in the emulator)
- **C — Your own project:** an app you wrote yourself or your own IoT prototype

Steps:

1. **Threat model** — attack surface map, assets, possible attackers (F11)
2. **Inventory** — components and versions, permissions, open services (F02, F08)
3. **Testing** — static, dynamic, network and (for A) firmware/hardware review (F03–F10)
4. **Findings** — at least 6; mapped to MASVS or the OWASP IoT Top 10, each with evidence
5. **Fixes** — a concrete recommendation and priority for each finding

Hardware work only on lab boards and with the electrical safety rules; radio tests only on your own device.

## Report skeleton

![Inspected devices in labelled trays on a workshop table; an analyst closing a sealed report folder](../../gorseller/f-12-c.webp)

| Section | Content |
|---|---|
| **Executive summary** | The 3 biggest risks, possible impact, first actions |
| **Scope** | Target, version, method, date, permission |
| **Threat model** | Attack surface drawing + threat table |
| **Findings** | Title, risk (high/medium/low), evidence, mapping, recommendation |
| **Remediation plan** | Now · this release · next design |

## Assessment

| Criterion | Score |
|---|---:|
| Scope and ethical rules followed | 2 |
| Threat model and inventory complete | 2 |
| Findings verified, evidenced and mapped | 3 |
| Fixes actionable and prioritised | 2 |
| Report legible and executive summary clear | 1 |

## ✅ Remember

- An audit starts with a map and ends with closed doors.
- Every finding is evidenced, mapped and prioritised.
- The best device is the one whose default is already secure.

> 🔒 **CASE CLOSED: Solderer Leman** · *when you hand in your report*
>
> ::cizgi[leman-kapanis]
>
> ➡️ *Season 2 continues: other case files of the Shadow Network await you on the other specialisation paths.*
