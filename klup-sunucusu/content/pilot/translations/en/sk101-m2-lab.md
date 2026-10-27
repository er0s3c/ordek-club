---
id: sk101-m2-lab
tur: uygulama
baslik: Why won't the portal open?
sure: 20
hedefler:
  - Record the status code
  - Inspect the request and account context
  - Test the cause with additional evidence before writing it down
beceriler:
  - network
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Which interpretation is supported?
    options:
      - No other context can affect this conclusion.
      - An HTTP response was received from the server, and access was refused.
      - This observation proves the entire system is secure.
    answer: 1
    explanation: An HTTP response was received from the server, and access was refused.
  - id: recall
    kind: fill
    prompt: Write the English key term given in the lesson.
    answers:
      - status
    caseSensitive: false
    explanation: The key term is status.
  - id: sequence
    kind: order
    prompt: Put the investigation steps in order.
    options:
      - Test the cause with additional evidence before writing it down
      - Record the status code
      - Inspect the request and account context
    answer:
      - 1
      - 2
      - 0
    explanation: Record the status code → Inspect the request and account context →
      Test the cause with additional evidence before writing it down
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# Why won't the portal open?

> Unpublished case-lab draft; technical and language review are required.

## Briefing

The DNS answer exists, the TCP connection is made and HTTP returns 403. Classify these three observations separately; do not present the stage that failed as a confirmed root cause.

## Evidence

```text
DNS: portal.mavifener.example -> 192.0.2.40
TCP: connected to port 443
HTTP/1.1 403 Forbidden
```

All records and targets are synthetic. No external target is contacted.

## Expected reasoning

1. Record the status code
2. Inspect the request and account context
3. Test the cause with additional evidence before writing it down

Explain which conclusion is directly supported and what further evidence would change your interpretation.

Key term: **status**.

## Further reading

[RFC 1034](https://www.rfc-editor.org/rfc/rfc1034)
