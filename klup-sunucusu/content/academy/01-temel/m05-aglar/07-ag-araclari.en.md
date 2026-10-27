---
id: m05-07
baslik: Your network diagnosis kit — ping, traceroute, ip, ss
hedefler:
  - Use the basic network diagnostic commands
  - Narrow a connection problem down layer by layer
---

# Your network diagnosis kit — ping, traceroute, ip, ss

> "The internet's down!" A security person doesn't guess at that — they **measure**.
> With four commands you can find which layer the problem is on.

::cizgi[m05-07-sahne]

## Narrow the problem from the bottom up

![A five-step ladder; a technician with a torch starts at the bottom and checks the cable, the router, the globe and the directory on each step](../../gorseller/m05-07-b.webp)

```bash
# 1. Do I have my own address?       (network access + DHCP)
ip a                     # Windows: ipconfig

# 2. Can I reach the router?         (local network)
ping -c 3 192.168.1.1    # Windows: ping 192.168.1.1

# 3. Can I get out to the internet?  (IP routing)
ping -c 3 1.1.1.1

# 4. Is name resolution working?     (DNS)
nslookup example.com

# 5. Where does the path break?
traceroute example.com   # Windows: tracert example.com
```

| Result | Likely problem |
|---|---|
| 1 fails | Cable/Wi-Fi or DHCP |
| 2 fails | Local network, router |
| 3 fails | Internet provider |
| 3 works, 4 fails | **DNS** — the most common one! |

## Seeing the connections

```bash
ss -tunp        # Linux: which program is connected to whom
netstat -ano    # Windows: connections and process numbers
```

For a security person this output is a **story**: if a program you don't recognise keeps connecting to an address you don't recognise,
it's worth investigating.

> Note: a server that doesn't answer `ping` isn't always down;
> many firewalls deliberately block ICMP.

## 🧪 Try it (4 min)

Run the five steps above on your own computer. How many hops did `traceroute example.com` take to reach its target?

## ✅ Remember

- Narrow the problem from the bottom up: address → router → internet → DNS.
- "The internet works but sites won't open" is usually DNS.
- The `ss`/`netstat` output tells you who your computer is talking to.
