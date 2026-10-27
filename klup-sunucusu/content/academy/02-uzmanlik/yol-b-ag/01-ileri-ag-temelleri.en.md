---
id: b-01
baslik: "Advanced network fundamentals: VLAN, routing, segmentation"
hedefler:
  - Explain how VLANs and routing divide a network
  - Show why a flat network is dangerous
---

# Advanced network fundamentals: VLAN, routing, segmentation

> A flat network is a house without doors: whoever comes in the front door walks into every room.
> 🕳️ **Tunnel 1:** In the copy of the campus network in the lab, the student Wi-Fi, the cameras and the grades server are all on the same network. Tarık's favourite view.

::cizgi[b-01-sahne]

## VLAN: separate networks on one cable

![Separate liquids of different colours flowing inside a single pipe; each colour splits off to its own building](../../gorseller/b-01-b.webp)

You split a switch logically: VLAN 10 students, VLAN 20 staff, VLAN 30 servers.
They're on the same physical device, but they can't see each other **directly**.

- **Access port:** belongs to a single VLAN (one computer).
- **Trunk port:** carries several VLANs with tags (802.1Q) (switch–switch, switch–router).

## Routing: the gate between zones

Traffic between VLANs passes through a **router or an L3 switch**. That's where you can set rules:
"Students may reach only the web port of the grades server, never the database."

::animasyon[network-topology]

## Segmentation design

![A ship's hull divided into watertight compartments; even if one floods, the others stay dry](../../gorseller/b-01-c.webp)

| Zone | Contains | Open to whom? |
|---|---|---|
| **Guest / student** | Phones, laptops | The internet and the portal only |
| **Staff** | Office computers | Internal applications |
| **Server** | Portal, database | Only the required ports |
| **Management** | Switch/firewall interfaces | Administrators only |
| **IoT** | Camera, printer, smart lock | Nowhere (only its own server) |

## Typical mistakes

Everything on a single VLAN, management interfaces reachable from the student network,
an **any-any** rule opened "temporarily" and then forgotten, unused switch ports left open.

## 🧪 Try it (5 min)

Inspect your network settings on your own computer:

```bash
ip route        # Linux / macOS: netstat -rn
ipconfig        # Windows
```

Which is your default gateway? How many devices could be on the same network given your netmask? If this were a school network, how would you divide it?

## ✅ Remember

- A VLAN divides the network logically; traffic between zones passes through a gate.
- The point of segmentation: if one device falls, the fire stays in one room.
- Management and IoT devices stay in their own zones, closed off from the outside.
