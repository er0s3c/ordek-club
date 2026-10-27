---
id: d-11
baslik: "Correlation and attribution: how do you separate a false flag?"
hedefler:
  - Combine evidence with the Diamond Model and analysis of competing hypotheses (ACH)
  - Recognise cognitive biases and the signs of a false flag
---

# Correlation and attribution: how do you separate a false flag?

> Collecting evidence is easy; tying it to the right hypothesis is hard. Bedri tries to tie the threads for you.
> 🚩 **Flag 11:** You have a report, infrastructure records, malware analysis and hunt results. Do they all lead to the same place?

::cizgi[d-11-sahne]

## The Diamond Model

![A four-cornered diamond: a masked figure, a toolbox, a network cable and a target building at the corners; the corners joined by threads](../../gorseller/d-11-b.webp)

Every attack event has four corners: **Adversary · Capability · Infrastructure · Victim**.
An empty corner is where information is still to be collected. A false flag usually paints the capability corner; the infrastructure corner is harder to imitate.

For events on a timeline, order them with the **Cyber Kill Chain**: reconnaissance → weaponisation → delivery → exploitation → installation → command and control → actions.

## Traps of the mind

| Bias | Symptom |
|---|---|
| **Confirmation bias** | Looking only for evidence that supports the first hypothesis |
| **Anchoring** | Getting stuck on the first name you heard |
| **Mirror imaging** | "I'd do it this way, so they must have done it this way too" |
| **Availability** | Assuming the most talked-about group is the most likely |

## Analysis of Competing Hypotheses (ACH)

![Three different flags standing side by side on a table; each evidence stone is placed in front of a flag or removed](../../gorseller/d-11-c.webp)

Analysis of Competing Hypotheses: put the hypotheses **side by side** and mark how each piece of evidence fits each hypothesis (✔ consistent · ✘ inconsistent · – neutral).
The winner is not the hypothesis with the most ✔ but the one with the **fewest ✘**. Evidence that fits every hypothesis is not discriminating.

| Evidence | H1: MERCAN-7 | H2: Someone else, with a false flag | H3: An independent actor using the builder |
|---|---|---|---|
| `MERCAN-7 was here` in the DLL | ✔ | ✔ | ✔ |
| Techniques differ from MERCAN-7's past | ✘ | ✔ | ✔ |
| … | | | |

## Signs of a false flag

- The attribution evidence is **too clean and too early**: a claim of responsibility right after the incident.
- Cheap traces point to one group, expensive traces (infrastructure, registration pattern) to another.
- The sources spreading the claim are new, coordinated and circular.

## 🧪 Try it (6 min)

Complete the table: add at least **six** pieces of evidence from all the `lab/d-*` files (infrastructure, certificate, EXIF, social accounts, imphash, hunt results).
Which hypothesis collects the fewest contradictions? Which piece of evidence doesn't separate any hypothesis?

## ✅ Remember

- The Diamond Model shows you the empty corner, ACH shows you the weak hypothesis.
- The winner is the hypothesis that meets the fewest contradictions; evidence that fits everything is not discriminating.
- If cheap and expensive traces point to different places, trust the expensive trace.
