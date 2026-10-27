---
id: m03-03
baslik: What is running on your computer right now?
hedefler:
  - Explain the concepts of process, service and startup program
  - Notice a suspicious startup item
---

# What is running on your computer right now?

> When the computer starts, dozens of programs begin running before you click anything.
> Malware likes to hide there too, in **startup**.

::cizgi[m03-03-sahne]

## Three concepts

![A factory shift: robots working at the front (process), robots working quietly in a back room (service), and robots that leap up the moment the door opens (startup program)](../../gorseller/m03-03-c.webp)

- **Process** — A running program itself. Even each browser tab can be a separate process.
- **Service** — A process that runs in the background, often before you sign in (e.g. Windows Update).
- **Startup program** — An application that starts automatically when you sign in.

An attacker's goal is often **persistence**: to keep running even after the computer restarts.
Startup items and services are the best-known ways of doing that.

## Take a look with Task Manager

![The Task Manager startup tab](../../gorseller/m03-03-b.webp)

Things that raise suspicion:
- **An empty publisher** or a name you don't recognise
- Names made of random letters (`xk27qa.exe`)
- Items running from odd places such as `AppData\Roaming` or `Temp`
- A slightly different spelling of a familiar name (`svch0st.exe`)

Instead of deleting an item you don't know, research its name first; often it's just a driver helper.

## 🧪 Try it (3 min)

Task Manager → Startup apps. Disable one app that really isn't needed at **every startup**.
You'll notice your computer starts faster.

## ✅ Remember

- Process = a running program; service = a process in the background.
- Malware settles into startup and services for persistence.
- No publisher, odd name, odd location = investigate.
