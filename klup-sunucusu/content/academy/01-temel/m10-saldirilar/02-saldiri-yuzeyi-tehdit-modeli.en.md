---
id: m10-02
baslik: Look through the attacker's eyes — attack surface and threat modelling
hedefler:
  - List a system's attack surface
  - Produce a simple threat model
animasyonlar: [network-topology]
---

# Look through the attacker's eyes

> Before you set up your defence, ask: **where could an attacker get in here?**
> The answer to all these questions is the attack surface.

::cizgi[m10-02-sahne]

## Attack surface

**Every point** where a system touches the outside world:

| Type | Example: the club server |
|---|---|
| **Digital** | Website, login page, API, an open SSH port |
| **Human** | Administrators' email, social media account |
| **Physical** | The room the server stands in, USB ports |
| **Supply chain** | The libraries, plugins and cloud account in use |

Rule: **shrink the surface.** Turn off services you don't use, delete accounts you don't need, close ports you don't need.

See how the surface is narrowed in a segmented network:

::animasyon[network-topology]

## A four-question threat model

![Four question objects around a castle model on a table: a valuable crown, watching binoculars, a ladder and a shield](../../gorseller/m10-02-b.webp)

When designing or reviewing a system:

1. **What are we protecting?** (assets: the member list, sessions, the admin account)
2. **Who could attack?** (a bot from outside, an eager student, a malicious former member)
3. **How could they attack?** (password guessing, phishing, an unauthorised API call)
4. **What will we do?** (MFA, rate limiting, permission checks, logging)

Just putting this into a table catches most design mistakes **before any code is written**.

## 🧪 Try it (5 min)

Fill in the four-question threat model for the club's event registration form. Write at least one answer for each question.

## ✅ Remember

- Attack surface: digital, human, physical, supply chain.
- Shrink the surface: turn off what you don't use.
- Threat model: what, from whom, how, what will we do?
