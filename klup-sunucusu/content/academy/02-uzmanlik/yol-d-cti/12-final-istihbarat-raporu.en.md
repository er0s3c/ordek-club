---
id: d-12
baslik: "Final: Fog Whistle intelligence report"
hedefler:
  - Write an evidence-based intelligence report with stated confidence levels for a fictional campaign
  - Separate false flags and give actionable defence recommendations
---

# Final: Fog Whistle intelligence report

> A good report doesn't shout who did it; it says what you know, what you don't know and how sure you are.
> 🚩 **The last flag:** All the files are on your desk. The Rector's Office will ask tomorrow morning: "Did MERCAN-7 carry out the attack, and what should we do?"

::cizgi[d-12-sahne]

## Mission

Using the case files in the lab (`lab/d-tehdit-raporlari.md`, `d-altyapi-kayitlari.txt`, `d-ioc-listesi.csv`,
`d-stix-paketi.json`, `d-av-olaylari.jsonl`):

1. **PIR** — turn the Rector's Office's question into one or two PIRs (D06)
2. **Source assessment** — an Admiralty code for each source (D02)
3. **Incident and infrastructure** — timeline, ATT&CK mapping, infrastructure relationships (D03, D07, D10)
4. **Hypotheses** — an ACH table with at least three hypotheses (D11)
5. **Assessment** — a conclusion in confidence level and probability language
6. **Recommendations** — detection rules (Sigma/YARA), a block list (cleaned), awareness

Use only the lab files; do not investigate a real group or person, and do not put real names in the report.

## The language of confidence

![Three lighthouses in a foggy harbour: one bright, one dim, one flickering; each showing a different confidence level](../../gorseller/d-12-c.webp)

| Phrase | Probability |
|---|---|
| Almost certain | 95–99% |
| Very likely | 80–95% |
| Likely | 55–80% |
| Roughly even chance | 45–55% |
| Unlikely | 20–45% |
| Very unlikely | 5–20% |

**Confidence level** (low / moderate / high) is separate: it measures not the probability but **the quality of the evidence**.
Example: "It is *very unlikely* that the campaign was carried out by MERCAN-7 (*moderate confidence*)."

## Report skeleton

| Section | Content |
|---|---|
| **Executive summary** | Three sentences: what happened, who (with confidence level), what should be done |
| **Key judgements** | Each one with probability + confidence level + the evidence it rests on |
| **Evidence table** | Evidence, source, Admiralty code, which hypothesis it supports |
| **ACH table** | Hypotheses × evidence, contradiction counts |
| **ATT&CK mapping** | Tactic, technique, observation, is there an existing detection? |
| **Recommendations** | Short term (block, clean), medium term (rules), long term (training, updating the PIR) |
| **Appendices** | Cleaned IOC list, Sigma/YARA rules, TLP label |

## Assessment

| Criterion | Score |
|---|---:|
| PIR and scope are clear; only lab data was used | 1 |
| Sources assessed with an Admiralty code and justification | 2 |
| Timeline and ATT&CK mapping are correct | 2 |
| ACH table and false-flag analysis are convincing | 3 |
| Confidence language is consistent; unknowns are stated clearly | 1 |
| Recommendations are actionable; the IOC list is cleaned of false positives | 1 |

## ✅ Remember

- A report exists for a decision: the executive summary must be readable on its own.
- Probability and confidence are stated separately; an unknown is also a finding.
- Cheap traces plant flags; infrastructure and behaviour point to the owner.

> 🔒 **CASE CLOSED: Flag-Bearer Bedri** · *when you hand in your report*
>
> ::cizgi[bedri-kapanis]
>
> ➡️ *Season 2 is still running: other files of the Shadow Network are waiting for you on the other specialisation paths.*
