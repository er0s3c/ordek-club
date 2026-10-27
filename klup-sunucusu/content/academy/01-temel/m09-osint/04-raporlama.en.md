---
id: m09-04
baslik: Presenting what you find convincingly
hedefler:
  - Report an OSINT finding with its source and level of confidence
---

# Presenting what you find convincingly

> A good researcher doesn't say "I found it"; they say **"from here, on this date, I'm this sure"**.

::cizgi[m09-04-sahne]

## Four things for every finding

| | Example |
|---|---|
| **Finding** | The domain name `kku-burs-onay.example` was registered 3 days ago |
| **Source** | WHOIS query, 4 March 2026, 10:12 |
| **Evidence** | Screenshot (annex 2) |
| **Level of confidence** | High — the registration details were queried directly |

## Level of confidence

![Three bridges at different heights: a bridge on many solid pillars shows high confidence, a single-pillar bridge medium, a rope bridge low](../../gorseller/m09-04-b.webp)

- **High** — Several reliable sources independent of each other, direct observation.
- **Medium** — A single reliable source or indirect evidence.
- **Low** — A single unverifiable source, a guess.

Use the word "certain" **very** rarely. A wrong but confident report is more harmful than an uncertain but honest one.

## A short report skeleton

```text
1. Question:    What was researched and why?
2. Summary:     A 3-sentence result (for someone non-technical)
3. Findings:    Each with source, evidence and level of confidence
4. Conclusion and recommendation
5. Annexes:     Screenshots, query outputs (with date/time)
```

## While collecting evidence

- Include the **date and address** in the screenshot.
- The page may change: save it to a web archive or keep it as a PDF.
- Don't put unnecessary personal data in the report; mask it if you need to.

## 🧪 Try it (4 min)

For the fake scholarship message in M01, write a single finding using the four fields above (finding, source, evidence, confidence).

## ✅ Remember

- Finding + source + evidence + level of confidence.
- The summary is written for someone non-technical.
- Evidence should be dated, personal data kept to a minimum.
