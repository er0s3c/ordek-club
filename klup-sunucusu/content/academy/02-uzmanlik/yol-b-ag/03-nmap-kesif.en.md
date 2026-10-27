---
id: b-03
baslik: "Discovery with Nmap: which doors are open?"
hedefler:
  - Tell host, port and service discovery apart
  - Read Nmap output and turn it into an inventory
---

# Discovery with Nmap: which doors are open?

> Defence's first question: **what's on my network, and which doors are open?** The attacker's first question is the same.
> 🕳️ **Tunnel 3:** Tarık knocked on every door on the lab network. Know which ones opened before he does.

::cizgi[b-03-sahne]

## Three steps

| Step | Question | Example |
|---|---|---|
| **Host discovery** | Who's up? | `nmap -sn 10.66.0.0/24` |
| **Port scan** | Which doors are open? | `nmap 10.66.0.20` (the 1000 most common ports) |
| **Service/version** | What's behind the door? | `nmap -sV -p 22,80,443 10.66.0.20` |

::animasyon[tcp-handshake]

## Reading the output

![The three states of a door: light leaks from an open door, a closed door is silent, a guard stands in front of a filtered door](../../gorseller/b-03-b.webp)

```text
PORT     STATE    SERVICE  VERSION
22/tcp   open     ssh      OpenSSH 8.9p1
80/tcp   open     http     nginx 1.18.0
3306/tcp open     mysql    MySQL 5.7.33
8080/tcp filtered http-proxy
```

| State | Meaning |
|---|---|
| `open` | A service is listening |
| `closed` | Reachable, but nothing is listening |
| `filtered` | A firewall is swallowing the answer |

The real finding in this output: **the database (3306) is exposed to the network** and its version is old. It should have stayed in the server zone.

## Turn it into an inventory

```bash
nmap -sV -oA lab-tarama 10.66.0.0/24   # .nmap, .xml, .gnmap files
```

For each host: IP, role, open ports, versions, and a "should this be here?" column.

## Rule

Nmap is a powerful tool; **scanning without permission** is a crime in many countries and strictly forbidden on school networks.
Scan only the lab range.

## 🧪 Try it (5 min)

From the lab VM, first find the hosts that are up with `nmap -sn`, then find the services on one server with `-sV`.
Which service **shouldn't be there**? Why?

## ✅ Remember

- The order of discovery: who's up → which port → which service.
- `filtered` tells you there's a firewall in between.
- The real finding isn't "an open port" — it's "a port that shouldn't be open".
