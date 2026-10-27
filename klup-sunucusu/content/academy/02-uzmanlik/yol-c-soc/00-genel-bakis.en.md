---
id: c-00
baslik: "Path C — SOC, Incident Response and Digital Forensics"
---

# Path C — SOC, Incident Response and Digital Forensics

> The alarm went off. Is it real? What happened, when, and how do we stop it? **Blue Team** and **DFIR**.

::cizgi[c-00-sahne]

> 🕴️ **FILE: Cleaner Tamer** · *Trace Eraser*
>
> ![Cleaner Tamer — Trace Eraser](../../gorseller/karakter-tamer.webp)
>
> **Who is he?** The family's cleaner; after every operation, he wipes the traces. One of Don's oldest men, but he reports straight to the Baron.
> [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[tamer-acilis]

**Prerequisite:** Operating systems (M03), networks (M05), reading logs (M07)

## 12 lessons

![A night-shift monitoring room: analysts moving between wall screens, an evidence table and an incident board](../../gorseller/c-00-b.webp)

| # | Lesson | In one sentence |
|---|---|---|
| C01 | [SOC and defensive operations](01-soc-temelleri.md) | Tier 1–3, alert/event/incident |
| C02 | [SIEM fundamentals](02-siem-temelleri.md) | Log collection, normalisation, correlation |
| C03 | [The Wazuh lab](03-wazuh-laboratuvari.md) | Agent, rule, alert analysis |
| C04 | [IDS/IPS](04-ids-ips.md) | Snort, Suricata, writing a simple rule |
| C05 | [Endpoint security](05-endpoint-guvenligi.md) | EDR, IOC/IOA, endpoint triage |
| C06 | [Windows forensics](06-windows-adli-bilisim.md) | Event log, Sysmon, registry, prefetch |
| C07 | [Linux forensics](07-linux-adli-bilisim.md) | auth.log, journald, auditd, persistence |
| C08 | [Network forensics](08-ag-adli-bilisimi.md) | DNS anomalies and suspicious connections in a PCAP |
| C09 | [Malware triage](09-zararli-yazilim-triyaji.md) | Hash, strings, YARA, sandbox report |
| C10 | [Disk and memory analysis](10-disk-bellek-analizi.md) | Autopsy, MFT, Volatility 3, evidence integrity |
| C11 | [Incident response](11-olay-mudahalesi.md) | From preparation to post-incident review, chain of custody |
| C12 | [Final simulation](12-final-simulasyonu.md) | Alert → analysis → timeline → incident report |

## Capstone output

A completed **incident case file** and an **incident response report**.

All logs, disk images and PCAPs are **synthetic**; no data belonging to real people is used.
