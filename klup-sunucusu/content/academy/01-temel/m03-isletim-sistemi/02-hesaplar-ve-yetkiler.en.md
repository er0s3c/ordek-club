---
id: m03-02
baslik: Why shouldn't you browse with an administrator account?
hedefler:
  - Explain the difference between a standard and an administrator account
  - Apply the principle of least privilege to everyday use
---

# Why shouldn't you browse with an administrator account?

> Browsing the internet with an administrator account is like carrying every key in the house in your pocket.
> A malicious program uses whatever it finds in that pocket.

::cizgi[m03-02-sahne]

## Two kinds of account

| | Standard account | Administrator account |
|---|---|---|
| Everyday tasks | ✅ | ✅ |
| Installing programs, changing system settings | Asks for a password | Confirmed with one click |
| If malware gets in | Damages only its own files | Can settle into **the whole system** |

## UAC: your last line of defence

When a program asks for administrator rights, Windows shows this window:

![The User Account Control window](../../gorseller/m03-02-b.webp)

This window is a **question**: "Shall I give this program all the keys?"
For a program whose job you don't know, the answer is **No**.

## The principle of least privilege

![At a hotel reception every guest is given only the key to their own room; the master key stays in a locked box](../../gorseller/m03-02-c.webp)

Every user and every program should have **just enough** permission to do its job — not more.
This principle will meet you at every layer of security: `sudo` on Linux, authorization on the web, IAM in the cloud.

Recommended setup:
- A **standard** account for everyday use.
- A separate **administrator** account with a strong password — only when needed.

## 🧪 Try it (2 min)

Go to Settings → Accounts → Other users (or Family) and check your account type.
Does it say "Administrator"?

## ✅ Remember

- Administrator account = all the keys; don't use it for everyday work.
- The UAC window is a question, not a routine click.
- Least privilege: as much permission as your job needs, no more.
