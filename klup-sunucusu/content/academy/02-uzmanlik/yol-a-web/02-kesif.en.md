---
id: a-02
baslik: "Reconnaissance: what does the target have?"
hedefler:
  - Tell passive and active reconnaissance apart
  - Build an asset inventory within scope
---

# Reconnaissance: what does the target have?

> Attackers love **forgotten** things most: an old test site, a backup file, an API waiting to be switched off.
> 🗂️ **Drawer 2:** Jasmine is mapping the portal. Your map has to be more complete than hers.

::cizgi[a-02-sahne]

## Two kinds of reconnaissance

![On the left a student circling the building from a distance with binoculars (passive), on the right a student gently probing each door one by one (active)](../../gorseller/a-02-b.webp)

| | Passive | Active |
|---|---|---|
| Does it touch the target? | No | Yes |
| Example | Certificate records, search engines, web archives | Directory scanning, port scanning, trying forms |
| When? | After the scope is set | **Only with written permission**, within scope |

## What do you look at?

- **Subdomains:** `test.`, `eski-portal.`, `dev.` — certificate transparency records give these away.
- **Path clues:** `/robots.txt`, `sitemap.xml`, API addresses inside JavaScript files.
- **Forgotten files:** `.bak`, `.zip`, `.git/`, old backups.
- **API documentation:** `/swagger.json`, `/api-docs` — a list of every door.
- **Technology:** server headers, cookie names, error pages (which framework, which version?).

## Inventory table

Write down everything you find; the report starts with this table.

| Asset | How did you find it? | In scope? | Note |
|---|---|---|---|
| `/ftp` | robots.txt | ✅ | File listing is open |
| `/api/...` | inside app.js | ✅ | No authentication? |

If you find something out of scope, **don't touch it** — just note it and tell the person responsible.

## 🧪 Try it (5 min)

On your local Juice Shop, look at `http://127.0.0.1:3000/robots.txt`. Which path are they trying to hide?
Then in Burp, search the `main.js` response for paths containing `/api/` and `/rest/` (*Ctrl+F*). How many endpoints did you find?

## ✅ Remember

- Passive reconnaissance doesn't touch the target; active reconnaissance is done only with permission.
- robots.txt, JS files and API documentation are the map of the doors.
- The inventory table is the first page of the report.
