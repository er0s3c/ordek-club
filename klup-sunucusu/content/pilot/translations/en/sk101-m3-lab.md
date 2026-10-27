---
id: sk101-m3-lab
tur: uygulama
baslik: The trail of the wrong order
sure: 20
hedefler:
  - Identify the two authorised test accounts
  - Compare the object owner and the response
  - Report the authorisation flaw with minimal evidence
beceriler:
  - web
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Which interpretation is supported by the evidence?
    options:
      - The authority of the object owner and of the requester must be compared
        on the server.
      - This observation proves that the whole system is secure.
      - No other context affects this conclusion.
    answer: 0
    explanation: The authority of the object owner and of the requester must be
      compared on the server.
  - id: recall
    kind: fill
    prompt: Write the English key term given in the lesson.
    answers:
      - authorization
    caseSensitive: false
    explanation: The key term is authorization.
  - id: sequence
    kind: order
    prompt: Put the investigation steps in order.
    options:
      - Report the authorisation flaw with minimal evidence
      - Identify the two authorised test accounts
      - Compare the object owner and the response
    answer:
      - 1
      - 2
      - 0
    explanation: Identify the two authorised test accounts → Compare the object
      owner and the response → Report the authorisation flaw with minimal
      evidence
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# The trail of the wrong order

> Unpublished case-lab draft; technical and language review required.

## Briefing

Training account A can view a fictional order belonging to account B. Record the evidence without personal data; discuss object-level authorisation and the possible boundary of impact.

## Evidence

```text
GET /orders/42 HTTP/1.1
Training session owner: A
Synthetic order owner: B
HTTP/1.1 200 OK
```

All records and targets are synthetic. No external target is contacted.

## Expected reasoning

1. Identify the two authorised test accounts
2. Compare the object owner and the response
3. Report the authorisation flaw with minimal evidence

Explain which conclusion is directly supported and what additional evidence would change your interpretation.

Key term: **authorization**.

## Further reading

[MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
