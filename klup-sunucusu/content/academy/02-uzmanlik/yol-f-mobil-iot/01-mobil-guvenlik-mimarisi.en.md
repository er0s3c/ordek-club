---
id: f-01
baslik: "Mobile security architecture: sandbox, permissions and secure storage"
hedefler:
  - Explain how app isolation (the sandbox) works on Android and iOS
  - Assess whether the permissions an app asks for match what it actually does
---

# Mobile security architecture: sandbox, permissions and secure storage

> Every app on your phone lives in its own room. The only person who opens the door is you: when you say **"Allow"**.
> 🔧 **Circuit 1:** The campus smart lock app asks for camera, contacts and SMS permission. Why would a door lock read your contacts?

::cizgi[f-01-sahne]

## Isolation: every app a separate room

![A phone like an apartment building: each app in its own locked flat, shared doors passable only with permission](../../gorseller/f-01-b.webp)

- **Android:** each app runs under its own Linux user ID (UID); its files sit under `/data/data/<package>/` and no one else can read them. SELinux builds an extra wall.
- **iOS:** each app runs in its own container; only code signed by Apple is loaded.
- Isolation (the sandbox) makes it harder for an attacker to **move on to the others** even if one app is taken over.

## Permissions: the key to the door

| Permission type | Example | How is it granted? |
|---|---|---|
| Normal | Internet | At install, without asking |
| Dangerous (runtime) | Camera, location, microphone, contacts | Asked of the user, can be revoked |
| Special | Accessibility, reading notifications | Manually, from Settings |

The rule is simple: **a permission must match the function.** If a torch app wants your contacts, that's a big question mark.

## Secure storage

- Passwords and tokens don't sit in a plain file but in a hardware-backed vault: **Android Keystore**, **iOS Keychain**.
- Sensitive data must not end up in device backups or screenshots.
- The app signature proves that an update comes from the same developer.

## Where it breaks

The architecture is sound; it's usually the apps that create the problems: unnecessary permissions, tokens stored in plain text,
a component left exported. Rooting/jailbreaking means deliberately knocking the walls down; that's why banking apps check for it.

## 🧪 Try it (4 min)

On your own phone, open **Settings → Privacy → Permission manager** (iOS: **Settings → Privacy & Security**).
Count the apps with camera, microphone and location permission. Revoke it from any app whose function doesn't match.

## ✅ Remember

- Every app in its own sandbox; the one who breaks through the wall is usually the app's own bug.
- If a permission doesn't match the function, it's a red flag.
- Secrets live in the Keystore/Keychain, not in a plain file.
