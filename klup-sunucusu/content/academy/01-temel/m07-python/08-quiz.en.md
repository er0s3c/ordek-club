---
id: m07-08
baslik: "M07 Quiz: Python and automation"
sorular:
  - soru: What defines a block of code in Python (for example, the inside of an if)?
    tur: coktan
    secenekler: [Curly braces, Indentation, Semicolon, the end keyword]
    dogru: 1
    aciklama: Python defines blocks by indentation.
  - soru: "Which structure is most suitable for finding the most frequent IPs in a log file?"
    tur: coktan
    secenekler: [list, collections.Counter, str, bool]
    dogru: 1
    aciklama: Counter is a dictionary specialised for counting and offers most_common().
  - soru: What do you use to tell whether a file has been changed afterwards?
    tur: coktan
    secenekler: [File size, SHA-256 hash value, File name, Creation date]
    dogru: 1
    aciklama: Even if a single bit changes, the hash changes completely.
  - soru: What is the safest way to use user input in a system command?
    tur: coktan
    secenekler:
      - os.system("ping " + girdi)
      - eval(girdi)
      - subprocess.run(["ping", "-c", "1", girdi])
      - subprocess.run("ping " + girdi, shell=True)
    dogru: 2
    aciklama: The list form passes the input as a single argument; there is no shell interpretation.
  - soru: Where should an API key be kept?
    tur: coktan
    secenekler: [In a variable at the top of the code, In the GitHub README file, In an environment variable or a secret settings file, In a comment line]
    dogru: 2
    aciklama: A key embedded in code leaks when the code is shared.
  - soru: "\"except: pass\" silently swallowing all errors is good practice in security tools."
    tur: dogru-yanlis
    dogru: false
    aciklama: A silent error means an unnoticed problem or attack.
  - soru: Using verify=False when making a request with requests turns off certificate verification.
    tur: dogru-yanlis
    dogru: true
    aciklama: This leaves the connection open to man-in-the-middle attacks; it should not be used.
---

# M07 Quiz: Python and automation

7 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Puppeteer Orhan** · *when you pass the quiz with 70%*
>
> ::cizgi[orhan-kapanis]
>
> ➡️ *Next case file: **Safecracker Kadir** (M08)*
