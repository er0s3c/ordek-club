---
id: m03-07
baslik: "M03 Quiz: Operating system security"
gecme: 70
sorular:
  - soru: What is the easiest way to notice a file that looks like "odev.pdf" on Windows but is actually "odev.pdf.exe"?
    tur: coktan
    secenekler:
      - Opening the file and looking
      - Making file name extensions visible
      - Renaming the file
      - Moving the file to the desktop
    dogru: 1
    aciklama: When extensions are hidden the double-extension trick is invisible; turning extensions on exposes the trick.
  - soru: Using a standard account for everyday use is an application of which security principle?
    tur: coktan
    secenekler:
      - Defence in depth
      - Least privilege
      - Data minimisation
      - Default permit
    dogru: 1
    aciklama: Giving the user just enough permission to do their job is the principle of least privilege.
  - soru: What is it called when malware keeps running even after the computer restarts?
    tur: coktan
    secenekler:
      - Persistence
      - Encryption
      - Backup
      - Virtualisation
    dogru: 0
    aciklama: Startup items and services are the common ways of achieving persistence.
  - soru: How are firewall rules evaluated?
    tur: coktan
    secenekler:
      - A random rule is chosen
      - They are checked in order, and the first matching rule is applied
      - The most recently added rule always wins
      - All the rules are combined
    dogru: 1
    aciklama: Rules are evaluated from top to bottom; if none matches, the default rule is applied.
  - soru: What does the "1" in the 3-2-1 backup rule mean?
    tur: coktan
    secenekler:
      - One backup a day
      - One copy kept elsewhere and offline
      - A single password
      - A one-year retention period
    dogru: 1
    aciklama: An offline copy stays safe even if ransomware encrypts the connected disks.
  - soru: Disk encryption protects against attacks coming from the internet while the computer is on.
    tur: dogru-yanlis
    dogru: false
    aciklama: Disk encryption mainly protects the data while the device is off or has been stolen.
---

# M03 Quiz: Operating system security

6 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Locksmith Rıza** · *when you pass the quiz with 70%*
>
> ::cizgi[riza-kapanis]
>
> ➡️ *Next case file: **Superuser Sadri** (M04)*
