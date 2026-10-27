---
id: b-02
baslik: "Traffic analysis: Wireshark and tcpdump"
hedefler:
  - Capture traffic with tcpdump and analyse it in Wireshark
  - Filter out suspicious traffic with filters
---

# Traffic analysis: Wireshark and tcpdump

> Everything that happens on a network leaves a **trace**. To see Tarık, you first need to be able to read the traffic.
> 🕳️ **Tunnel 2:** On the lab network, at 03:00 a server is talking to an address it doesn't recognise.

::cizgi[b-02-sahne]

## Capture: tcpdump

Servers have no interface; you capture traffic from the command line and then open it in Wireshark.

```bash
sudo tcpdump -i eth0 -w yakalama.pcap            # capture, write to a file
sudo tcpdump -i eth0 -nn port 53                  # DNS only, without resolving names
sudo tcpdump -r yakalama.pcap host 10.66.0.20     # read from the file, single host
```

::animasyon[packet-journey]

## Analyse: Wireshark filters

| Filter | What does it show? |
|---|---|
| `ip.addr == 10.66.0.20` | All traffic of a single device |
| `dns` | DNS queries — any strange domain names? |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | Connection attempts (scanning?) |
| `http.request` | Unencrypted web requests |
| `!(ip.addr == 10.66.0.0/24)` | Everything leaving the network |

## The big picture

![A bird's-eye map of city traffic; the thickest flow line leads to a single building](../../gorseller/b-02-c.webp)

![The Wireshark Conversations window](../../gorseller/b-02-b.webp)

*Statistics → Conversations* answers "who talked to whom, and how much?" on a single screen.
*Statistics → Protocol Hierarchy* shows which protocols are circulating on the network. An unexpected protocol is the first clue.

## Rule

Capture only the traffic of **your own** device or of **the lab**. Listening to someone else's traffic is a crime.

## 🧪 Try it (5 min)

On the lab VM, capture for 1 minute with `tcpdump` while visiting a few sites. Open the file in Wireshark:
which conversation transferred the most data? How many different DNS queries were made?

## ✅ Remember

- tcpdump captures, Wireshark explains.
- Filters strip out the noise: a single host, a single protocol, traffic leaving the network.
- Conversations and Protocol Hierarchy give you the big picture.
