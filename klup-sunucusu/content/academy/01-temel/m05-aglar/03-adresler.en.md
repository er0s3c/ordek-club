---
id: m05-03
baslik: "IP, MAC and 192.168: the addresses of devices"
hedefler:
  - Tell IPv4, IPv6 and MAC addresses apart
  - Explain the difference between a private and a public IP
  - Read a simple subnet mask
---

# IP, MAC and 192.168: the addresses of devices

> A packet needs two addresses to reach the right device:
> **which building** (IP) and **which flat** (MAC).

::cizgi[m05-03-sahne]

## Three kinds of address

![Two labels on a parcel: a between-cities address label (IP) and an apartment doorbell inside a building (MAC)](../../gorseller/m05-03-b.webp)

| | Example | What is it for? |
|---|---|---|
| **IPv4** | `192.168.1.24` | Address between networks (4 numbers, 0–255) |
| **IPv6** | `2001:db8::24` | The new generation, a much longer address |
| **MAC** | `3c:22:fb:1a:9e:07` | The network card's local identity; only works on the same network |

See your own addresses:

```bash
ip a          # Linux
ipconfig      # Windows (detail: ipconfig /all)
```

## Private and public IP

All the devices at home use **private** addresses; they go out to the world through a single **public** address (NAT).

| Private ranges | |
|---|---|
| `10.0.0.0 – 10.255.255.255` | Large organisations |
| `172.16.0.0 – 172.31.255.255` | Mid-sized networks |
| `192.168.0.0 – 192.168.255.255` | Homes, dorms |

If you see `192.168.x.x` in a log, the incident is **inside**; if you see another address, it may be a connection coming from outside.

## Subnet: the same neighbourhood?

![Two fenced neighbourhoods; houses in the same neighbourhood walk straight to each other, while crossing to the other one means passing the guard at the gate](../../gorseller/m05-03-c.webp)

`192.168.1.24/24` → the first 24 bits (the first three numbers) are the **network address**, the last number is the device.
So `192.168.1.1` – `192.168.1.254` are on the same network; `192.168.2.5` is on another network and needs a router in between.

| Notation | Mask | Number of devices on the network |
|---|---|---|
| `/24` | 255.255.255.0 | 254 |
| `/16` | 255.255.0.0 | 65.534 |

## 🧪 Try it (4 min)

Run `ipconfig` or `ip a`. Is your IP address private? What is your default gateway (router)?
How would you tell whether your phone is on the same network?

## ✅ Remember

- IP is the address between networks, MAC is the address within the local network.
- 10.x, 172.16–31.x and 192.168.x are private addresses.
- `/24` = the same network if the first three numbers match.
