---
id: f-06
baslik: "Introduction to iOS security: Keychain, entitlements and sandbox"
hedefler:
  - Explain iOS's code signing, sandbox and Keychain layers
  - Recognise risky settings in Info.plist and entitlements
---

# Introduction to iOS security: Keychain, entitlements and sandbox

> iOS is a walled garden. But the window of every house in the garden is closed by the **developer**.
> 🔧 **Circuit 6:** Leman's lock app has an iPhone version too. The wall is solid; is the window open?

::cizgi[f-06-sahne]

## Layers

![A phone like a castle surrounded by concentric walls: outer wall, inner wall and, at the centre, the vault where keys are kept](../../gorseller/f-06-b.webp)

| Layer | What does it do? |
|---|---|
| **Code signing** | Only signed code runs |
| **Sandbox** | Every app in its own container |
| **Data Protection** | Files are encrypted while the device is locked |
| **Keychain** | An encrypted vault for passwords and keys |
| **Secure Enclave** | Biometrics and keys on a separate chip |

## Entitlements: declarations of authority

Entitlements are the **list of powers** embedded in the app's signature: Keychain access group, notifications, App Groups, HealthKit…
More entitlement than needed is like more permission than needed.

## Info.plist red flags

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key><true/>    <!-- ATS off: unencrypted HTTP allowed -->
</dict>
<key>NSCameraUsageDescription</key>
<string>To open the door</string>             <!-- why does a lock app want the camera? -->
```

- **ATS** (App Transport Security) requires HTTPS by default; turning it off needs a justification.
- The access class matters in a Keychain record: a strict class like `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` keeps the record from travelling to another device in backups.

## Examination

An IPA is a zip file too; inside are `Info.plist`, the executable and the signature. On macOS you can see
the entitlements of an app you compiled yourself like this:

```bash
codesign -d --entitlements - KampusKilit.app
```

## Jailbreak

A jailbreak removes the walls; for testing it's only done on the club's separate test device, never on a personal phone.

## 🧪 Try it (3 min)

If you have an iPhone: open **Settings → Privacy & Security → App Privacy Report** and look at which app last accessed
location, camera or microphone, and when. If not: fix the two problems in the Info.plist snippet above.

## ✅ Remember

- On iOS the signature and sandbox build the wall, the developer closes the window.
- Secrets are stored in the Keychain with a strict access class.
- `NSAllowsArbitraryLoads` and unnecessary entitlements are red flags.
