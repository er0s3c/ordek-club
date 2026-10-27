---
id: m10-06
baslik: Attacks on the network and the web — MITM, web flaws, DDoS
hedefler:
  - Explain the concepts of MITM and spoofing
  - See the common root of web application flaws
  - Understand the impact of DDoS and how to defend against it
animasyonlar: [mitm, xss]
---

# Attacks on the network and the web

> Attackers lie in wait in two places: **on the road** (the network) and **at the door** (the web application).
> And they also block the door with a crowd (DDoS).

::cizgi[m10-06-sahne]

## On the road: MITM and spoofing

A **man-in-the-middle** (MITM) gets between two parties and reads or changes the traffic.
**Spoofing** is impersonation: a fake ARP, a fake DNS, a fake email sender, a fake Wi-Fi network.

::animasyon[mitm]

Defence: **HTTPS + HSTS** everywhere, never bypassing certificate warnings, not doing sensitive transactions on public Wi-Fi, or a VPN.

## At the door: web application flaws

Most web flaws come from a single root: **trusting user input**.

![Single-Quote Jasmine slipping a glowing apostrophe into a card catalogue cabinet; every drawer bursts open at once](../../gorseller/m10-06-b.webp)

| Flaw | Root cause | Defence in brief |
|---|---|---|
| **SQL Injection** | Input is added into the query string | Parameterised query |
| **XSS** | Input is printed into the page without escaping | Escaping on output + CSP |
| **IDOR / authorization error** | The server doesn't ask "is this yours?" | A permission check on every request |
| **Information disclosure** | Detailed error messages | A generic error, details in the logs |

See how XSS travels from one user to another:

::animasyon[xss]

You will try each of these safely in **Ördek Lab** (Path A).

## Blocking with a crowd: DDoS

![Thousands of cardboard figures jamming the door of a small shop; real customers can't get in](../../gorseller/m10-06-c.webp)

**Distributed denial of service**: traffic arriving at the same time from thousands of compromised devices (a botnet) makes the service unusable.
It targets the **availability** leg of CIA.

Defence: CDN and DDoS protection services, rate limiting, capacity planning.

> ⚠️ Even "just to try it", carrying out a DDoS on a site is a crime and harms others too.

## 🧪 Try it (3 min)

Match the four web flaws in the table with the CIA principles. Could some of them break more than one principle?

## ✅ Remember

- MITM listens in/changes things on the road; HTTPS and certificate checks protect you.
- The common root of web flaws: trusting user input.
- DDoS targets availability; even trying it is a crime.
