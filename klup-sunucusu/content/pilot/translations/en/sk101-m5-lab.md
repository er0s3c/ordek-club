---
id: sk101-m5-lab
tur: uygulama
baslik: The account opened at night
sure: 20
hedefler:
  - Verify the source and time information
  - Correlate account events
  - Compare with the change record
beceriler:
  - windows
etkinlikler:
  - id: interpret
    kind: log
    prompt: Select the account creation record.
    options:
      - 02:10 EventID=4625 Account=lab-admin
      - 02:12 EventID=4624 Account=lab-admin
      - 02:13 EventID=4720 Target=lab-temp
    answer: 2
    explanation: The 4720 line is an observation of account creation; the
      authorisation context is verified separately.
  - id: recall
    kind: fill
    prompt: Write the English key concept named in the lesson.
    answers:
      - event
    caseSensitive: false
    explanation: The key concept is event.
  - id: sequence
    kind: order
    prompt: Put the review steps in order.
    options:
      - Compare with the change record
      - Verify the source and time information
      - Correlate account events
    answer:
      - 1
      - 2
      - 0
    explanation: Verify the source and time information → Correlate account events →
      Compare with the change record
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# The account opened at night

> Unpublished case lab draft; technical and language review is required.

## Briefing

Three Windows records contain a failed sign-in, a successful sign-in and the creation of a new account. Select the account creation event; state that you cannot explain the whole incident without the change record and verification from the account owner.

## Evidence

```text
02:10 EventID=4625 Account=lab-admin
02:12 EventID=4624 Account=lab-admin
02:13 EventID=4720 Target=lab-temp
```

All records and targets are synthetic. No external target is contacted.

## Expected thinking

1. Verify the source and time information
2. Correlate account events
3. Compare with the change record

Explain which conclusion is directly supported and which additional evidence would change your interpretation.

Key concept: **event**.

## Additional reading

[Microsoft audit event reference](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4624)
