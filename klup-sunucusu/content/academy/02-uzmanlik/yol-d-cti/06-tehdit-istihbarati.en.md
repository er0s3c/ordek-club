---
id: d-06
baslik: "Threat intelligence: when does data become intelligence?"
hedefler:
  - Explain the intelligence cycle and priority intelligence requirements (PIR)
  - Separate IOC from TTP and place them on the Pyramid of Pain
---

# Threat intelligence: when does data become intelligence?

> A thousand IP addresses are not intelligence. Intelligence is information with context that can be used for a decision.
> 🚩 **Flag 6:** The blog published a list of IOCs saying "block them immediately". Bedri spends five minutes changing that list; you spend a day blocking it.

::cizgi[d-06-sahne]

## The intelligence cycle

![A six-step cycle from requirement to feedback, turning like a mill wheel](../../gorseller/d-06-c.webp)

1. **Direction** — the decision-maker's question
2. **Collection** — logs, reports, open sources
3. **Processing** — filter, normalise
4. **Analysis** — meaning and confidence level
5. **Dissemination** — to the right person, in the right form
6. **Feedback** — did it help?

## PIR: requirement first

A **Priority Intelligence Requirement** = the question the decision-maker is waiting to have answered.
Example: "Is there a group targeting the campus portal, and which techniques does it use?" Without a PIR, everything collected is noise.

## Three levels

| Level | Reader | Example output |
|---|---|---|
| **Strategic** | Management | "Educational institutions are being targeted with phishing" |
| **Operational** | SOC lead | "The campaign uses a scholarship-themed document with macros" |
| **Tactical** | Analyst, tools | Domain names, hashes, detection rules |

## IOC and TTP

- **IOC (Indicator of Compromise):** IP, domain name, hash. Concrete and fast, but short-lived.
- **TTP (Tactics, Techniques and Procedures):** **how** the attacker works. Hard to change.

## Pyramid of Pain

![A stepped stone pyramid: small pebbles that are easily changed at the bottom, a heavy stone at the top showing the habits an attacker finds hardest to give up](../../gorseller/d-06-b.webp)

```text
          ▲  TTPs                 ← the most painful for the attacker
         ▲▲  Tools
        ▲▲▲  Network/host artefacts
       ▲▲▲▲  Domain names
      ▲▲▲▲▲  IP addresses
     ▲▲▲▲▲▲  Hash values          ← the easiest to change
```

The higher up the defence sits, the more expensive it becomes for the attacker to plant a "new flag".

## 🧪 Try it (5 min)

Put each row of the `lab/d-ioc-listesi.csv` file onto one step of the pyramid.
Then write **two behaviours** (TTPs) from the incident chain in K1: which of them will still work in the next campaign?

## ✅ Remember

- Intelligence starts with a question (PIR) and ends with a decision.
- IOCs are fast but short-lived; TTPs are slow but lasting.
- Climb the pyramid: catch what is hard for the attacker to change.
