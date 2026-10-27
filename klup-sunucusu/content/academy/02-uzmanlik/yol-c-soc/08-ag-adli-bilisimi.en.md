---
id: c-08
baslik: "Network forensics: DNS anomalies and a regular pulse"
hedefler:
  - Recognise the signs of beaconing and tunnelling in DNS records
  - Compare the network sensor's clock with the endpoint clock
---

# Network forensics: DNS anomalies and a regular pulse

> A device's clock can lie. The network sensor records the event **on its own clock**.
> 🧹 **Trace 8:** All night long, KLP-WS07 asked for the same domain every 30 minutes. Tamer shifted the clock; the sensor's clock did not shift.

::cizgi[c-08-sahne]

## Why DNS?

Almost every connection starts with a **DNS query**, and on most networks DNS goes out freely.
That is why it is both the channel malware loves and the defender's most productive log source.

::animasyon[dns-resolution]

## Three anomalies

![A perfectly regular pulse line on a heart monitor; the analyst points out that this is a machine, not a human](../../gorseller/c-08-b.webp)

| Sign | What does it look like? | What could it be? |
|---|---|---|
| **Regular pulse (beaconing)** | The same domain exactly every 30 min | A command-and-control (C2) connection |
| **A long, meaningless subdomain** | `4b4c502d57533037.v.example.test` | DNS tunnelling: data is carried inside the query |
| **A lookalike name** | `guncelleme.kampus.test` ↔ `guncelleme.kotu.test` | A domain imitating a legitimate service |

People browse irregularly; machines run **like clockwork**. If the interval is regular, a program is talking.
Careful: update and clock-sync (NTP) services also talk regularly. First remove the **legitimate** ones from the list, then investigate the rest.

## What do you look for in a PCAP?

The equivalents of the same questions in Wireshark:

```text
dns.qry.name contains "kotu.test"
dns.qry.type == 16                      # TXT queries
ip.addr == 198.51.100.200 && tcp.flags.syn == 1
```

With *Statistics → Conversations* you can see the external addresses that talk the most, and with *I/O Graph* the regular intervals.

## The time anchor

The network sensor is a clock independent of the endpoint. If the clock on the endpoint has been shifted, the time in the DNS
record of the same connection **is the real time**. Build the timeline on the sensor's clock.

## 🧪 Try it (5 min)

```bash
grep kotu.test /opt/akademi/c-dns.log | cut -f1,4,5
for h in $(grep TXT /opt/akademi/c-dns.log | cut -f4 | cut -d. -f1); do echo "$h" | xxd -r -p; echo; done
```

How many minutes is the pulse interval, and when were the first and last queries? What comes out when the subdomains of the TXT queries are decoded?

## ✅ Remember

- A machine talks like clockwork: a regular interval is a sign of beaconing.
- A long, meaningless subdomain is a suspicion of DNS tunnelling.
- The network sensor's clock is the time anchor against a shifted endpoint clock.
