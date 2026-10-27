---
id: m05-02
baslik: An envelope inside an envelope — OSI and TCP/IP
hedefler:
  - Explain the logic of a layered network model
  - Match the OSI and TCP/IP layers
animasyonlar: [packet-journey]
---

# An envelope inside an envelope — OSI and TCP/IP

> Before a message sets off on its journey across a network, it's **packed in layers**.
> Each layer adds its own envelope; on the other side, the same layer opens that envelope.

::cizgi[m05-02-sahne]

## Why layers?

![Five nested envelopes opened up: each envelope wraps the previous one, with a small message card at the very centre](../../gorseller/m05-02-b.webp)

Each layer focuses on a single job. When you move from Wi-Fi to Ethernet, your web browser doesn't need to change —
the lower layer changes, the one above it stays the same.

## The two models side by side

| OSI (7 layers) | TCP/IP (4 layers) | Example | Data unit |
|---|---|---|---|
| 7 Application · 6 Presentation · 5 Session | **Application** | HTTP, DNS, SSH | Message |
| 4 Transport | **Transport** | TCP, UDP | Segment |
| 3 Network | **Internet** | IP, ICMP | Packet |
| 2 Data link · 1 Physical | **Network access** | Ethernet, Wi-Fi | Frame, bit |

OSI is used for teaching and for describing problems ("a layer 2 problem"), while TCP/IP is the model that actually runs.

## The packet's journey

Watch how a packet is packed as it travels from a laptop to a server, and which stops it passes through:

::animasyon[packet-journey]

## For the security person

Attacks are also discussed by layer:
- **Layer 2:** ARP spoofing (people on the same network)
- **Layer 3–4:** IP spoofing, port scanning, SYN flood
- **Layer 7:** SQL injection, XSS, phishing

## 🧪 Try it (3 min)

Place every technology in the sentence "I'm signing in to a website on café Wi-Fi" into a layer:
Wi-Fi, IP address, TCP, HTTPS.

## ✅ Remember

- Each layer adds its own envelope; the same layer opens it on the other side.
- TCP/IP is the model that actually runs; OSI is the shared language.
- Attacks and defences are also discussed by layer.
