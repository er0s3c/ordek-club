---
id: d-08
baslik: "CTI platforms: MISP, OpenCTI and STIX/TAXII"
hedefler:
  - Read STIX 2.1 objects and relationships and critique a bundle
  - Manage sharing in MISP/OpenCTI with TLP and source confidence
---

# CTI platforms: MISP, OpenCTI and STIX/TAXII

> Intelligence gets stronger as it is shared. So does wrong intelligence.
> 🚩 **Flag 8:** The blog's IOCs landed in a sharing community as a STIX bundle. Three organisations blocked them automatically.

::cizgi[d-08-sahne]

## Platforms

| Tool | What is it for? |
|---|---|
| **MISP** | Event and attribute sharing; community feeds; false-positive warning lists (warninglists) |
| **OpenCTI** | Connects information as a graph: actor ↔ campaign ↔ technique ↔ indicator |
| **TAXII** | The protocol that carries STIX bundles from server to server (collections, API roots) |

## STIX 2.1: a shared language

STIX (Structured Threat Information Expression) writes everything as **objects + relationships**.

```json
{ "type": "indicator",
  "pattern": "[domain-name:value = 'mercan-guncelleme.example']",
  "pattern_type": "stix", "confidence": 90 }

{ "type": "relationship", "relationship_type": "attributed-to",
  "source_ref": "campaign--…", "target_ref": "threat-actor--…", "confidence": 95 }
```

Common objects: `indicator`, `malware`, `threat-actor`, `intrusion-set`, `campaign`, `attack-pattern`, `report`, `sighting`.
The real question is always: **who is `created_by_ref`, and what did they base that confidence score on?**

## TLP: who do you share with?

![Four coloured envelopes: red only to those in the room, amber to the organisation, green to the community, white to everyone](../../gorseller/d-08-b.webp)

Traffic Light Protocol 2.0: **CLEAR** public · **GREEN** community ·
**AMBER** organisation and clients · **AMBER+STRICT** organisation only · **RED** only those in the room.

## The automatic-blocking trap

Connecting a feed straight to the firewall is fast, but a shared CDN address cuts off hundreds of legitimate sites in one line.
If the source score is low, **monitor** first, then block. MISP warning lists flag known shared addresses.

## 🧪 Try it (5 min)

Open the `lab/d-stix-paketi.json` file. Find the attribution relationship (`attributed-to`): what is the confidence score, and who is the source?
Which of the four indicators is a shared address according to `lab/d-altyapi-kayitlari.txt`? With what note would you send this bundle back to the community?

## ✅ Remember

- STIX speaks in objects and relationships; TAXII carries them; MISP and OpenCTI store and connect them.
- A confidence score is only as valuable as the reliability of whoever gave it.
- Monitor a low-confidence feed first, then block.
