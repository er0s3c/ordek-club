---
id: b-05
baslik: "Local network threats: ARP, DNS and DHCP spoofing"
hedefler:
  - Explain the logic of ARP, DNS and DHCP spoofing
  - List the switch-side and client-side defences for each
---

# Local network threats: ARP, DNS and DHCP spoofing

> The local network **runs on trust**: if someone says "I'm the gateway", devices usually believe it.
> 🕳️ **Tunnel 5:** In the ARP table of two lab computers, the same MAC address shows up for two different IPs.

::cizgi[b-05-sahne]

## Three lies

![Three liars in the neighbourhood: a fake doorman, a fake directory clerk and a fake receptionist; each sends arrivals to their own door](../../gorseller/b-05-b.webp)

| Attack | The lie | The result |
|---|---|---|
| **ARP spoofing** | "The gateway's MAC address is mine" | Traffic passes through the attacker |
| **DNS spoofing** | "portal.kampus.test is at this IP" | The victim goes to the fake site |
| **Rogue DHCP** | "I'm your gateway and your DNS" | Everyone who newly connects is redirected to the attacker |

::animasyon[mitm]

## Symptoms

- **The same MAC, two IPs** in the ARP table (one of them the gateway).
- More than one DHCP server answering on the local network.
- Certificate warnings suddenly multiplying.

```bash
ip neigh          # Linux ARP tablosu   (Windows: arp -a)
```

## Defence

| Layer | Measure |
|---|---|
| **Switch** | DHCP Snooping (DHCP only from trusted ports), Dynamic ARP Inspection, port security |
| **Network design** | Small VLANs, client isolation on the guest network |
| **Client / application** | HTTPS and HSTS, never clicking past a certificate warning, DNS over HTTPS/TLS |
| **Monitoring** | ARP change and rogue DHCP alerts (IDS) |

Encryption is still the strongest shield: even if traffic passes through the attacker, it **can't be read or altered**.

## 🧪 Try it (5 min)

Look at the ARP table on your own computer. Note the gateway's MAC address.
In the lab, while the instructor demonstrates spoofing, look at the table again: what changed?

## ✅ Remember

- Local network protocols don't authenticate; that's why lies work.
- DHCP Snooping and Dynamic ARP Inspection stop the lies at the switch.
- Encrypted traffic looks meaningless to someone in the middle too.
