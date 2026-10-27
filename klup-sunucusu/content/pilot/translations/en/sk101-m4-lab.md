---
id: sk101-m4-lab
tur: uygulama
baslik: Forgotten permissions
sure: 20
hedefler:
  - Read the owner and the current mode
  - Apply the least necessary mode
  - Re-verify the result
beceriler:
  - linux
etkinlikler:
  - id: interpret
    kind: choice
    prompt: Which interpretation is supported by the evidence?
    options:
      - No other context affects this conclusion.
      - The base file mode should be 600.
      - This observation proves that the whole system is secure.
    answer: 1
    explanation: The base file mode should be 600.
  - id: recall
    kind: command
    prompt: Write the command that gives read/write permission for incident.txt to
      the owner only.
    answers:
      - chmod 600 incident.txt
    explanation: Mode 600 gives the owner read and write permission.
  - id: sequence
    kind: order
    prompt: Put the investigation steps in order.
    options:
      - Re-verify the result
      - Read the owner and the current mode
      - Apply the least necessary mode
    answer:
      - 1
      - 2
      - 0
    explanation: Read the owner and the current mode → Apply the least necessary
      mode → Re-verify the result
inceleme:
  yazar: Ördek Club taslak
  teknik: ""
  dil: ""
  tarih: 2026-10-24
  onayli: false
---

# Forgotten permissions

> Unpublished case-lab draft; technical and language review required.

## Briefing

The file incident.txt can be read by other users. The file owner is the student. First record the mode, then propose and verify the change that gives read/write permission to the owner only. Once a separate Linux server is set up, you can work on a real file in the Command Line.

## Evidence

```text
Before: -rw-r--r-- student student incident.txt
Required: owner read/write only
```

All records and targets are synthetic. No external target is contacted.

## Expected reasoning

1. Read the owner and the current mode
2. Apply the least necessary mode
3. Re-verify the result

Explain which conclusion is directly supported and what additional evidence would change your interpretation.

Key term: **permissions**.

## Further reading

[GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html)
