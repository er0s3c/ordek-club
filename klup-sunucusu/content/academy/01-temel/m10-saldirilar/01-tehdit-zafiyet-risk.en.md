---
id: m10-01
baslik: Threat, vulnerability, risk — and the CIA triad
hedefler:
  - Distinguish the concepts of threat, vulnerability and risk
  - Explain the principles of confidentiality, integrity and availability
---

# Threat, vulnerability, risk — and the CIA triad

> These three words are often confused. A security person thinks about them
> **separately**, because each one calls for a different measure.

::cizgi[m10-01-sahne]

> 🕴️ **FILE: Ransom Ferhat** · *Ransom Boss*
>
> ![Ransom Ferhat — Ransom Boss](../../gorseller/karakter-ferhat.webp)
>
> **Threat:** Ransomware, malware, kill chain, DDoS. · [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[ferhat-acilis]

## Three concepts, one example

![A laptop in a corridor locker with a broken lock and a crowd passing by; a risk gauge tilted into the red](../../gorseller/m10-01-b.webp)

The door of your dorm room:

| Concept | Definition | Example |
|---|---|---|
| **Asset** | The thing you want to protect | Your laptop |
| **Vulnerability** | The weak point | The door's lock is broken |
| **Threat** | The person/event that could use the weakness | Someone passing in the corridor |
| **Risk** | Probability × impact | Broken lock + busy corridor + expensive laptop = **high** |

Risk cannot be reduced to zero; it is **managed**: fix it (repair the lock), reduce it (lock the laptop in the cupboard), transfer it (insurance), accept it.

## The CIA triad

![A shield on three legs: a closed eye (confidentiality), an unbroken seal (integrity) and a burning lantern (availability)](../../gorseller/m10-01-c.webp)

The three goals of security — if one is missing, the stool tips over:

| Principle | Question | Example of a breach |
|---|---|---|
| **Confidentiality** | Is only the authorised person seeing it? | A grade list leaking |
| **Integrity** | Is the data correct and unaltered? | Grades being changed without permission |
| **Availability** | Is it reachable when it's needed? | The portal crashing during registration week |

You can classify any attack by asking "which part of CIA does it break?"

## 🧪 Try it (3 min)

Match the three incidents with one of the CIA principles:
1. Ransomware encrypted the files.
2. A student could see someone else's assignment.
3. An attacker changed the bank account number on an invoice.

<details><summary>Answer</summary>1 → Availability · 2 → Confidentiality · 3 → Integrity</details>

## ✅ Remember

- A vulnerability is the weak point, a threat is what could use it, risk is the two meeting.
- Risk is managed: fix, reduce, transfer, accept.
- CIA: confidentiality, integrity, availability.
