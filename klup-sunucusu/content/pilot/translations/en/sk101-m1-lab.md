---
id: sk101-m1-lab
tur: uygulama
baslik: Your first shift's incident card
sure: 20
hedefler:
  - Identify the original record
  - Compare the records
  - Describe the change's impact
beceriler:
  - ethics
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Which interpretation is supported?
    options:
      - This observation proves the entire system is secure.
      - No other context can affect this conclusion.
      - The observed change concerns integrity.
    answer: 2
    explanation: The observed change concerns integrity.
  - id: recall
    kind: fill
    prompt: Write the English key term given in the lesson.
    answers:
      - integrity
    caseSensitive: false
    explanation: The key term is integrity.
  - id: sequence
    kind: order
    prompt: Put the investigation steps in order.
    options:
      - Describe the change's impact
      - Identify the original record
      - Compare the records
    answer:
      - 1
      - 2
      - 0
    explanation: Identify the original record → Compare the records → Describe the
      change's impact
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# Your first shift's incident card

> Unpublished case-lab draft; technical and language review are required.

## Briefing

The destination on a shipment record has changed, but the portal has stayed reachable. Compare the source record with the copy; describe the security goal that was affected and what remains unknown.

## Evidence

```text
Original: container=MF-14 destination=North
Observed: container=MF-14 destination=South
File remains readable.
```

All records and targets are synthetic. No external target is contacted.

## Expected reasoning

1. Identify the original record
2. Compare the records
3. Describe the change's impact

Explain which conclusion is directly supported and what further evidence would change your interpretation.

Key term: **integrity**.

## Further reading

[NIST Incident Response](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
