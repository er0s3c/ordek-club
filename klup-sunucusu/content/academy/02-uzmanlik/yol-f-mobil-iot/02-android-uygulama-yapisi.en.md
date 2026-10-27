---
id: f-02
baslik: "Android app structure: APK, Manifest and components"
hedefler:
  - Recognise the parts inside an APK file and what each one does
  - Find risky settings and exported components in AndroidManifest.xml
---

# Android app structure: APK, Manifest and components

> An APK is really just a **zip file**. Open it and the app's plan comes out too.
> 🔧 **Circuit 2:** Leman's "CampusLock" app manifest has landed in the lab. How many of its doors are open?

::cizgi[f-02-sahne]

## Inside the APK

![An opened shipping box: code gears, a box of pictures and a manifest document with a rules list on top](../../gorseller/f-02-b.webp)

```bash
unzip -l kampuskilit.apk          # list the contents
apktool d kampuskilit.apk -o kilit/   # convert the Manifest into readable XML
```

| Part | Its job |
|---|---|
| `AndroidManifest.xml` | Package name, permissions, components, security settings |
| `classes.dex` | Compiled code (Dalvik bytecode) |
| `res/`, `assets/` | Images, text, embedded files |
| `lib/` | Native libraries, `.so` |
| `META-INF/` | Signature information |

## Four components

- **Activity:** a screen.
- **Service:** work that runs in the background.
- **BroadcastReceiver:** listens for broadcasts from the system or other apps.
- **ContentProvider:** shares data with other apps.

A component with `android:exported="true"` **can also be started by other apps.** If there's no permission protection,
the "Admin panel" screen can be opened without signing in.

## Manifest red flags

| Setting | Risk |
|---|---|
| `android:debuggable="true"` | In production a debugger can attach, the data folder can be read |
| `android:allowBackup="true"` | App data can be taken out in a backup |
| `android:usesCleartextTraffic="true"` | Allows unencrypted HTTP |
| Unprotected `exported` component | Another app triggers the screen/service |
| A key inside `<meta-data>` | A secret anyone can read |

## What does the fix look like?

- A component that shouldn't be called from outside: `android:exported="false"`.
- If it's needed: protect it with `android:permission`, validate every piece of incoming data.
- Delete permissions that don't match the function; move the secret out of the app and onto the server.
- In a production build, `debuggable` and cleartext are off, and sensitive data is excluded from backup.

## 🧪 Try it (5 min)

Open the file `content/academy/lab/f-AndroidManifest.xml`. It belongs to a door lock app.
Find at least **five** red flags: permissions that don't match the function, risky settings and unprotected exported components.
For each one, write a one-line fix.

## ✅ Remember

- An APK is a zip; the Manifest is the app's security plan.
- With `exported="true"` and no permission, the component is a door open to everyone.
- `debuggable`, `allowBackup` and cleartext settings must be off in production.
