---
id: f-04
baslik: "Mobile dynamic analysis: emulator, logcat and traffic"
hedefler:
  - Watch what an app does while running, using adb and logcat in an emulator
  - Hunt for sensitive data in the app's data folder and in the logs
---

# Mobile dynamic analysis: emulator, logcat and traffic

> Static analysis reads the plan. Dynamic analysis **runs** the app and watches what it does.
> 🔧 **Circuit 4:** When you sign in to the lock app, something is quietly being recorded. What?

::cizgi[f-04-sahne]

## Static or dynamic?

![On the left an analyst reads the blueprint of a closed box, on the right the same analyst watches the box run inside a glass test chamber](../../gorseller/f-04-b.webp)

| | Static | Dynamic |
|---|---|---|
| What does it do? | Reads the code and settings | Watches the running app |
| What does it find well? | Embedded secrets, risky settings | Real data going to logs, disk, network |
| Its blind spot | Values produced at runtime | Code paths that never trigger |

You use both together: what you find statically, you confirm dynamically.

## Lab setup

- **Android Studio emulator (AVD)**; the "Google APIs" image gives root access for testing.
- Don't root your personal phone: only the emulator or the club's test device.
- The app: DIVA, InsecureBankv2 or your own app.

## First steps with adb

```bash
adb devices                          # is the emulator showing up?
adb install diva-beta.apk
adb shell pm list packages | grep diva
adb logcat | grep -iE "pass|token|kart"
```

## The data folder

```bash
adb shell
run-as jakhar.aseem.diva ls -R       # works on debuggable apps
```

| Location | What do you look for? |
|---|---|
| `shared_prefs/*.xml` | Plain-text passwords, tokens |
| `databases/*.db` | Unencrypted SQLite tables |
| `files/`, `cache/` | Exported reports, images, temporary files |
| External storage (`/sdcard`) | Files other apps can read too |

## Traffic

The emulator's traffic goes through a proxy (OWASP ZAP, Burp); you see the requests and responses.
For HTTPS you install the proxy's certificate **on the emulator only**. We'll see in F05 why it sometimes doesn't work.

## 🧪 Try it (5 min)

Open DIVA in the emulator and enter a fake card number on the "Insecure Logging" screen (e.g. `4000 0000 0000 0000`).
At the same time run `adb logcat` and see whether the value you entered lands in the log. Then, on the "Insecure Data Storage – Part 1"
screen, find the information you saved inside `shared_prefs`.

## ✅ Remember

- Dynamic analysis is only done in the emulator or on a lab device.
- Logcat and `shared_prefs` are the first address for forgotten secrets.
- A proxy shows what the app really talks about with the server.
