---
id: a-08
baslik: "Server side: command injection, SSTI, SSRF, XXE"
hedefler:
  - Explain the shared cause of four server-side flaws
  - State the basic defence for each
---

# Server side: command injection, SSTI, SSRF, XXE

> What all four have in common: the server runs or fetches what the user gives it **with its own privileges**.
> 🗂️ **Drawer 8:** Jasmine isn't forcing doors any more. She's making the building's own butler do the work.

::cizgi[a-08-sahne]

## Four flaws, one table

| Flaw | What happens? | Sign in the lab | Defence |
|---|---|---|---|
| **Command injection** | Input is added to an operating system command | Extra output when `; id` is added to the `ping` form | Don't use a shell; pass arguments as a list |
| **SSTI** | Input is processed as code in the template engine | `49` on the page when you type `{{7*7}}` | Don't let users write templates; pass input as a variable |
| **SSRF** | The server makes the request **itself** to the address the user gives | Reaching internal addresses with "fetch an image from this address" | Target allow list; block internal networks and cloud metadata addresses |
| **XXE** | The XML parser loads external entities | An entity defined in the XML returns file contents | Disable DTDs/external entities in the parser |

## The difference in code

```python
# ❌ the input goes to the shell as text
os.system("ping -c 1 " + adres)

# ✅ no shell, the input is a single argument
subprocess.run(["ping", "-c", "1", adres], check=True, timeout=5)
```

Even so, **verify** that `adres` really is an IP address or a domain name.

## Why is SSRF so serious?

![A letter handed from outside to the building's own butler; the butler takes it to the vault room inside](../../gorseller/a-08-b.webp)

The server sits **inside** the firewall. The attacker looks with the server's eyes at internal panels,
databases and cloud metadata services that hand out credentials — things the attacker can't see from outside.

## 🧪 Try it (5 min) — reading code

Which of these three lines are dangerous? Why? How would you fix them?

```python
subprocess.run(["convert", dosya, "kucuk.png"])
os.system(f"zip yedek.zip {klasor}")
render_template_string("Merhaba " + ad)
```

## ✅ Remember

- Shared cause: input mixes into something the server runs with its own privileges.
- An argument list instead of a shell, a variable instead of code in the template.
- Against SSRF, limit targets with an allow list; block internal addresses.
