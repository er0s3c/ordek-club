---
id: c-04
baslik: "IDS/IPS: catching suspicious network traffic with a rule"
hedefler:
  - Read the structure of a Suricata/Snort rule
  - Write a simple detection rule in the lab and test it
---

# IDS/IPS: catching suspicious network traffic with a rule

> A log on an endpoint can be deleted. But a packet was seen **the moment it crossed the network**.
> 🧹 **Trace 4:** At night, KLP-WS07 asked over and over for a domain called `kotu.test`. Tamer had forgotten the network sensor.

::cizgi[c-04-sahne]

## IDS or IPS?

- **IDS (Intrusion Detection System):** watches a copy of the traffic and raises alerts. It doesn't touch the network.
- **IPS (Intrusion Prevention System):** sits in the path of the traffic and **drops** whatever matches a rule.

**Snort** and **Suricata** are the most common open-source engines; their rule languages are almost identical.

Where does the sensor go? At the internet egress (north-south traffic) and in front of critical server zones (east-west traffic).
On a false positive, an IPS cuts legitimate traffic too; that is why new rules are first watched in IDS mode.

## The anatomy of a rule

![The layers of a sieve: direction, protocol, content and threshold; only the stone that fits all of them is caught at the bottom](../../gorseller/c-04-b.webp)

```text
alert dns $HOME_NET any -> any any (msg:"CLUB DNS query for the kotu.test domain"; dns.query; content:"kotu.test"; nocase; sid:1000001; rev:1;)
```

| Part | Meaning |
|---|---|
| `alert` | Action: raise an alert (`drop` = block in IPS mode) |
| `dns` | Protocol |
| `$HOME_NET any -> any any` | Source → destination (address and port) |
| `msg` | The description shown in the alert |
| `dns.query; content:` | The content to look for in the query name |
| `sid`, `rev` | Rule ID and revision (local rules 1000000+) |

## A good rule is a quiet rule

- A very broad rule (`content:"update"`) means an alert storm.
- A very narrow rule (a single exact IP) goes blind as soon as the attacker changes IP.
- Test every rule **against recorded traffic first**, check the false-positive count, then put it into production.

Signature-based detection catches known patterns; for the unknown, you watch for **anomalies** (unusual volume, time of day, destination).

## 🧪 Try it (5 min)

On the Suricata VM in the club lab, add the rule to `local.rules` and run it against the sample pcap the instructor gives you:

```bash
sudo suricata -r /opt/akademi/ornek.pcap -S local.rules -l /tmp/sonuc
cat /tmp/sonuc/fast.log
```

How many alerts came out? How would you narrow the rule so that it only catches `TXT` queries?

## ✅ Remember

- IDS sees and alerts, IPS sees and blocks.
- Rule = action + protocol + direction + content + ID.
- Test the rule against recorded traffic first; a noisy rule protects nobody.
