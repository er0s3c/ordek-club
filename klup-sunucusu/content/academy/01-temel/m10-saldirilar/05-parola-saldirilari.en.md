---
id: m10-05
baslik: Attacks on passwords
hedefler:
  - Distinguish brute-force, password spraying and credential stuffing
  - Match each one with its defence
---

# Attacks on passwords

> The attackers' favourite front door is still the **password**. They try it in three different ways.

::cizgi[m10-05-sahne]

## Three methods

![Three door scenes: a robot trying hundreds of keys on one door, a robot trying the same single key on many doors, and a robot going door to door with a bunch of stolen keys](../../gorseller/m10-05-b.webp)

| Method | How? | How does it look in the log? |
|---|---|---|
| **Brute-force** | Tries many passwords on **a single account** | The same user, many failed sign-ins |
| **Password spraying** | Tries a few common passwords (`Bahar2026!`) on **many accounts** | Many different users, few attempts on each |
| **Credential stuffing** | Tries username/password pairs **leaked** from another site | Surprisingly successful sign-ins with correct passwords |

The third is the most insidious: with no mistake on your part, your account falls because of **another site's** leak —
if you used the same password.

## Defences

| Attack | The most effective defence |
|---|---|
| Brute-force | Rate limiting, temporary lockout, MFA |
| Password spraying | Banning common passwords, MFA, sign-in anomaly detection |
| Credential stuffing | **A different password on every site** + MFA |

Your share as a user: **a password manager + MFA** (M08). These two defeat most of all three attacks.

On the server side: turning off password sign-in on SSH and accepting only keys almost entirely ends brute force.

## Is my account in a leak?

Reliable breach-check services (e.g. *Have I Been Pwned*) show whether your email appears in known leaks.
Check **only your own** email.

## 🧪 Try it (3 min)

Look at the `auth.log` from M07 again: is the attack you see brute-force or spraying? Why?

<details><summary>Answer</summary>Brute-force: a single IP, a large number of attempts mostly on a single account (deploy).</details>

## ✅ Remember

- Brute-force one account, spraying many accounts, stuffing leaked passwords.
- A different password + MFA is the strongest user defence against all three.
- On the server, rate limiting and key-based sign-in stop brute force.
