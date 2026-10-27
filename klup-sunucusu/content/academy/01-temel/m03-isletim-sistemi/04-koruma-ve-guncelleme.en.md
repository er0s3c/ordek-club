---
id: m03-04
baslik: Defender, the firewall and updates
hedefler:
  - Check Windows' built-in protections
  - Explain why updates should not be postponed
animasyonlar: [firewall-decision]
---

# Defender, the firewall and updates

> Windows already has a free protection team inside it. Most of the time all you have to do is
> **not turn it off** and **keep it up to date**.

::cizgi[m03-04-sahne]

![The Windows Security home screen](../../gorseller/m03-04-a.webp)

## Three protections

![Three defenders guarding a castle: a guard at the gate, a gatekeeper at the wall gate with a rulebook, and a mason patching cracks in the wall](../../gorseller/m03-04-c.webp)

| Protection | What does it do? |
|---|---|
| **Microsoft Defender** | Scans files and behaviour, stops known malware |
| **Firewall** | Allows or blocks connections coming in and out of the network according to rules |
| **Updates** | Installs patches that close known flaws |

How does the firewall decide? Rules are checked in order, and the first matching rule is applied:

::animasyon[firewall-decision]

## Why are updates so important?

When a vulnerability is announced, attackers learn about it too. Every day you delay the patch
means walking around with **a flaw everyone knows about**. Most big attacks exploit flaws
whose patch came out months earlier.

- Keep automatic updates on.
- Don't postpone the "Restart" warning for days.
- Not just Windows: the browser, the PDF reader and applications are updated too.

## Bad ideas

- Turning off Defender to install a game or a "crack"
- Turning off the firewall because "the internet is slow"
- Using an operating system that is no longer supported (patches no longer arrive)

## 🧪 Try it (3 min)

Open Windows Security. Is there a yellow or red warning? If so, read what it is and fix it.
Then look in Settings → Windows Update for any pending update.

## ✅ Remember

- The built-in protections are good enough; don't turn them off.
- The firewall decides with rules, by the first matching rule.
- Whoever delays a patch walks around with a known flaw.
