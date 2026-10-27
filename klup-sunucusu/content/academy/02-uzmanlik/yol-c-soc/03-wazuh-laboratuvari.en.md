---
id: c-03
baslik: "The Wazuh lab: agent, rule and alert"
hedefler:
  - Explain how a Wazuh agent and manager work together
  - Write a simple custom rule and test it in the lab
---

# The Wazuh lab: agent, rule and alert

> Theory is over; it's time to run your own SIEM. **Wazuh** is an open-source SIEM/XDR platform that is easy to set up in a lab.
> 🧹 **Trace 3:** Tamer turned down the volume on an agent. But a silent agent is an alert too.

::cizgi[c-03-sahne]

## Architecture

![A tiny reporter robot beside every computer; they all send their reports to the manager at the centre through pneumatic tubes](../../gorseller/c-03-c.webp)

| Part | Duty |
|---|---|
| **Agent** | Watches logs, file integrity and configuration on the endpoint |
| **Manager** | Decodes logs, matches them against rules, produces alerts |
| **Indexer + dashboard** | Stores alerts and makes them searchable and visualisable |

Rules carry a **level** from 0 to 15. Level 10 and above are generally the ones that need looking at straight away.

## Write your own rule

In the lab manager's `/var/ossec/etc/rules/local_rules.xml` file:

```xml
<group name="kulup,">
  <rule id="100100" level="12">
    <if_sid>5716</if_sid>
    <srcip>203.0.113.66</srcip>
    <description>Club: SSH authentication failure from a monitored IP</description>
  </rule>
</group>
```

After loading the rule, restart the manager; then try a sample log line with the test tool:

```bash
sudo systemctl restart wazuh-manager
sudo /var/ossec/bin/wazuh-logtest
```

## Reading an alert

In every alert, look at these fields first:

- `rule.level` and `rule.description` — how serious is it, what does it say?
- `agent.name` — which device?
- `data.srcip`, `data.dstuser` — who, to whom?
- `rule.mitre.id` — which attack technique (MITRE ATT&CK) is it mapped to?
- `full_log` — the raw line; this is the evidence, not a comment.

## The silent agent

If an agent's connection drops, Wazuh records that too (*agent disconnected*). **No logs arriving** from an endpoint
is a finding in itself: the agent may have been stopped, the service shut down, or the device's clock moved.

![The Threat Hunting screen in the Wazuh dashboard](../../gorseller/c-03-b.webp)

## 🧪 Try it (5 min)

Only on the Wazuh in the club lab: paste a "Failed password" line from `/opt/akademi/auth.log` into the `wazuh-logtest` tool.
Which rule ID and level match? Then try to match your own rule by changing the IP in the line.

## ✅ Remember

- The agent collects, the manager decodes and matches, the dashboard displays.
- Custom rules are written in `local_rules.xml` and tested with `wazuh-logtest`.
- An agent that goes quiet is an alert as well.
