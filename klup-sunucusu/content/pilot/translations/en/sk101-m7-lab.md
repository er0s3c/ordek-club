---
id: sk101-m7-lab
tur: uygulama
baslik: The records of the first half hour
sure: 20
hedefler:
  - Identify the authorised incident owner
  - Limit impact and preserve evidence
  - Record actions on a timeline
beceriler:
  - incident
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Which interpretation is supported by the evidence?
    options:
      - Containment and evidence preservation should be planned together.
      - This observation proves that the whole system is secure.
      - No other context affects this conclusion.
    answer: 0
    explanation: Containment and evidence preservation should be planned together.
  - id: recall
    kind: fill
    prompt: Write the English key term given in the lesson.
    answers:
      - containment
    caseSensitive: false
    explanation: The key term is containment.
  - id: sequence
    kind: order
    prompt: Put the investigation steps in order.
    options:
      - Record actions on a timeline
      - Identify the authorised incident owner
      - Limit impact and preserve evidence
    answer:
      - 1
      - 2
      - 0
    explanation: Identify the authorised incident owner → Limit impact and preserve
      evidence → Record actions on a timeline
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# The records of the first half hour

> Unpublished case-lab draft; technical and language review required.

## Briefing

A suspicious attachment opening and an unauthorised share have been confirmed. Justify the order of restricting the relevant session, preserving the original logs, and reporting to the authorised incident owner with the minimum data.

## Evidence

```text
09:10 attachment opened
09:12 unexpected login confirmed
09:14 incident owner notified
```

All records and targets are synthetic. No external target is contacted.

## Expected reasoning

1. Identify the authorised incident owner
2. Limit impact and preserve evidence
3. Record actions on a timeline

Explain which conclusion is directly supported and what additional evidence would change it.

Key term: **containment**.

## Further reading

[NIST Incident Response](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
