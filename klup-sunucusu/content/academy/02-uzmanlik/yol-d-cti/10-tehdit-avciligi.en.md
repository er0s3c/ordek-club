---
id: d-10
baslik: "Threat hunting: find the trace before the alarm goes off"
hedefler:
  - Build a testable hunting hypothesis and test it on lab data
  - Turn the finding into a Sigma and a YARA rule
animasyonlar: [soc-alert]
---

# Threat hunting: find the trace before the alarm goes off

> An alarm catches what you already know. A hunt looks for what you don't.
> 🚩 **Flag 10:** The block list is ready, but Professor Selim asks: "On whose other computer was the same document opened? The ones the alarm didn't catch?"

::cizgi[d-10-sahne]

## Hypothesis: the hunter's compass

![A tracker in the forest following a specific trail with a compass; not wandering at random](../../gorseller/d-10-b.webp)

Threat hunting starts with a **hypothesis**, not an IOC list:

```text
If the attacker gets in with an Office document (T1566.001 → T1059.001),
then PowerShell must have run as a child process of Word.
Data: process creation events (Sysmon event 1) · Time span: last 7 days
```

The outcome can be "we found it" or "we didn't". Both are valuable: if you didn't find it, write down whether your data source was sufficient.

::animasyon[soc-alert]

## Test it

```bash
jq -c 'select(.event_id==1 and (.parent_image|test("WINWORD";"i")) and (.image|test("powershell";"i")))' \
  /opt/akademi/d-av-olaylari.jsonl
jq -r 'select(.image|test("schtasks";"i")) | [.ts,.host,.user,.command_line] | @tsv' /opt/akademi/d-av-olaylari.jsonl
```

Interpret every result with context: an administrator's nightly backup job is also a `schtasks` line.

## Sigma: turn the hunt into a lasting rule

![The trace the hunter found is poured into a mould and handed to the guard at the gate](../../gorseller/d-10-c.webp)

```yaml
title: PowerShell launched from an Office document
status: experimental
logsource: { category: process_creation, product: windows }
detection:
  selection:
    ParentImage|endswith: '\WINWORD.EXE'
    Image|endswith: '\powershell.exe'
    CommandLine|contains: ' -enc'
  condition: selection
level: high
tags: [attack.execution, attack.t1059.001]
```

Sigma is a rule language independent of any SIEM; tools translate it into Splunk, Elastic and similar queries.

## YARA: search inside the file

```text
rule Kampanya_svc_update {
  strings:
    $a = "MercanSync" ascii wide
    $b = "\\mrcn\\" ascii wide
  condition:
    uint16(0) == 0x5A4D and all of them
}
```

Careful: this rule finds **this campaign's** files, not MERCAN-7's. Name the rule after what you see, not after the flag.

## 🧪 Try it (6 min)

Run the two queries above in the lab VM. How many computers were affected? Which `schtasks` line is innocent?
Look at the times of the `rundll32` connections: what is the interval in minutes? Is there a target IP the campaign never mentions?

## ✅ Remember

- A hunt starts with a hypothesis: behaviour, data source, time window.
- "We didn't find it" is also a result; write it together with whether the data source was sufficient.
- Turn what you find into a lasting rule with Sigma and YARA, and name the rule after what you saw.
