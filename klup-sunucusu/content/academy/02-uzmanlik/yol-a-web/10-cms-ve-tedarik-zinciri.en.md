---
id: a-10
baslik: "CMS and the supply chain: code you didn't write"
hedefler:
  - Explain where most flaws on CMS sites come from
  - Recognise dependency risk and the SBOM
---

# CMS and the supply chain: code you didn't write

> Most of the code on a modern website wasn't written by its owner: the theme, the plugin, the library, the package.
> 🗂️ **Drawer 10:** Jasmine didn't touch the portal. She touched a plugin the portal uses.

::cizgi[a-10-sahne]

## CMS: the flaw usually isn't in the core

In content management systems such as WordPress and Joomla, the core is updated regularly.
Most findings come from **plugins and themes**: abandoned, not updated, more privileged than they need to be.

What you look at during an assessment (with permission):

- Version information (page source, `readme` files, headers)
- Installed plugins and their versions → is there a known flaw?
- Is the admin panel open to everyone, can usernames be listed?
- Tools such as `WPScan` automate this — only on the site within scope.

## Supply chain

| Risk | Example |
|---|---|
| **A dependency with a known flaw** | An old library version |
| **Typosquatting** | A `reqeusts` package instead of `requests` |
| **A hijacked package** | Malicious code added to a new version of a trusted package |
| **A script that runs on install** | The package runs its own command while being installed |

## SBOM: the parts list

![A long parts list beside a software box; threads show where each part came from](../../gorseller/a-10-b.webp)

**Software Bill of Materials:** a list of every component inside the software and its version.
When a new flaw is announced, it answers the question "do we have it?" within minutes.

## Defence

Few plugins that are still maintained, regular updates, a lock file (`package-lock.json`, `poetry.lock`),
dependency scanning in CI, SBOM generation, and a short review before adding a new dependency.

## 🧪 Try it (5 min)

In one of your own projects (or a sample Node/Python project), run this:

```bash
npm audit          # Node projesi
pip-audit          # Python projesi (pip install pip-audit)
```

How many direct and how many indirect dependencies are there? How many of the flaws found are actually in code you use?

## ✅ Remember

- Most CMS flaws come from plugins and themes.
- Adding a dependency means taking someone else's code into your house.
- An SBOM quickly answers "do we have this component?".
