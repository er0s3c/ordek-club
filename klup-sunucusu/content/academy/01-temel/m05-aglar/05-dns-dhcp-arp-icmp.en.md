---
id: m05-05
baslik: The network's invisible helpers — DNS, DHCP, ARP, ICMP
hedefler:
  - Explain what DNS, DHCP, ARP and ICMP do
  - Recognise one attack idea against each of them
animasyonlar: [dns-resolution]
---

# The network's invisible helpers — DNS, DHCP, ARP, ICMP

> The moment you join a Wi-Fi network, four helpers start working in the background.
> All you see is the word "connected".

::cizgi[m05-05-sahne]

## Four helpers

![The network's four invisible helpers: a receptionist handing out room keys (DHCP), a librarian keeping the directory (DNS), a doorman calling down the corridor (ARP) and a watchman listening for the echo (ICMP)](../../gorseller/m05-05-b.webp)

| Protocol | Job | Analogy | How it's abused |
|---|---|---|---|
| **DHCP** | Gives the connecting device an IP address | A hotel reception gives you a room | A fake DHCP server redirects traffic to itself |
| **DNS** | Turns a domain name into an IP | A phone book | A fake DNS answer sends you to a fake site |
| **ARP** | Finds the MAC of an IP on the local network | Shouting "who is 192.168.1.1?" | ARP spoofing, man-in-the-middle (M10) |
| **ICMP** | Error and diagnostic messages | The echo of "are you there?" | Scanning, mapping out the network |

## DNS step by step

When you type `ornek.edu.tr` into your browser, how is the IP address found?

::animasyon[dns-resolution]

```bash
nslookup example.com       # the IP of the domain name
ping -c 4 example.com      # "are you there?" over ICMP (Windows: ping example.com)
arp -a                     # your computer's ARP table
```

## The key idea for the security person

Most of these protocols were designed **without authentication** — "answer anyone who asks, believe the answer you get".
That's why giving a fake answer on a shared network is possible.
Defences: DNSSEC, encrypted DNS (DoH/DoT), DHCP snooping and Dynamic ARP Inspection on switches.

## 🧪 Try it (3 min)

Run `nslookup example.com` and `arp -a`. Does your ARP table contain your router's (default gateway's) MAC address?

## ✅ Remember

- DHCP hands out addresses, DNS resolves names, ARP finds the local MAC, ICMP diagnoses.
- These protocols mostly trust the answer they receive blindly.
- Fake answers are possible on shared networks; an encrypted connection protects you.
