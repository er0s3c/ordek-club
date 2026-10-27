---
id: m07-06
baslik: Leaving no flaw in your own code
hedefler:
  - Recognise common security mistakes in Python
  - Use API keys and external requests safely
---

# Leaving no flaw in your own code

> The tool a security person writes is software too — and it can carry flaws.
> The most common mistakes all come from the same place: **trusting the input**.

::cizgi[m07-06-sahne]

## Four classic mistakes

| ❌ Don't | ✅ Do | Why? |
|---|---|---|
| `eval(girdi)` | `int(girdi)`, `json.loads(girdi)` | `eval` runs the input **as code** |
| `os.system("ping " + host)` | `subprocess.run(["ping", "-c", "1", host])` | The list form doesn't turn additions like `; rm -rf ~` into commands |
| `"SELECT … WHERE ad='" + ad + "'"` | `cur.execute("SELECT … WHERE ad = ?", (ad,))` | A parameterised query keeps the input as data |
| `API_KEY = "sk-abc123"` hard-coded | `os.environ["API_KEY"]` | The code goes to GitHub, and the key goes with it |

See why gluing input into SQL as text is dangerous:

::animasyon[sql-injection]

## Calling external APIs safely

![A comparison of a key kept in a safe and a key taped above the door](../../gorseller/m07-06-b.webp)

```python
import os
import requests

anahtar = os.environ.get("HAVA_API_KEY")
if not anahtar:
    raise SystemExit("HAVA_API_KEY tanımlı değil")

yanit = requests.get(
    "https://api.example.com/hava",
    params={"sehir": "Girne"},
    headers={"Authorization": f"Bearer {anahtar}"},
    timeout=10,            # do not wait forever
)                          # do NOT use verify=False: it turns off certificate checking
yanit.raise_for_status()
print(yanit.json())
```

- **Don't print** the key into logs or error messages.
- Add the `.env` file to `.gitignore`.
- Don't trust the response either: check that the fields you expect are really there.

## 🧪 Try it (4 min)

What's wrong in the line below? Fix it.

```python
dosya = input("Hangi log? ")
os.system("cat /var/log/" + dosya)
```

<details><summary>Answer</summary>If the user types <code>x; rm -rf ~</code>, the second command runs too. Path traversal such as <code>../../etc/shadow</code> is also possible. The fix: compare against a list of allowed file names and read the file with <code>open()</code>.</details>

## ✅ Remember

- Never glue input into code, a command or a query string.
- Keys go in an environment variable, not in the code.
- Set a timeout on external requests; don't turn off certificate checking.
