---
id: m08-04
baslik: Password manager, MFA and passkey
hedefler:
  - Explain the benefit of using a password manager
  - Rank MFA methods by security
  - Understand the passkey concept and secure session management
---

# Password manager, MFA and passkey

> The human brain isn't built to remember 80 different strong passwords.
> The answer isn't a better memory but **better tools**.

::cizgi[m08-04-sahne]

## Password manager

- Generates and stores a **different, long, random** password for every site.
- You remember only **one** master password — make it a long sentence.
- It doesn't autofill on a fake site → bonus protection against phishing.

![Passphrase generator](../../gorseller/m08-04-b.webp)

Length is worth more than complexity: `kumda-yuruyen-mavi-ordek-sabah` is easy to remember and much stronger than `P@ssw0rd1!`.

## MFA: the second lock

![Two locks on a door: one opened by a password key, the other by a small device in the owner's pocket; the thief is stuck with only the first key](../../gorseller/m08-04-c.webp)

Even if your password is stolen, there's no sign-in without the second factor. From strongest to weakest:

| Method | Strength | Note |
|---|---|---|
| **Passkey / hardware key** | ⭐⭐⭐⭐ | Resistant to phishing |
| **App notification + number matching** | ⭐⭐⭐ | Watch out for "approve" spam |
| **Authenticator app code** (TOTP) | ⭐⭐⭐ | The code can be entered on a fake site |
| **SMS code** | ⭐⭐ | Open to SIM-swap attacks; still better than nothing |

⚠️ **Don't share** the verification code with **anyone** — including someone who says "we're calling from the school".

## Passkey: the passwordless future

A passkey is an asymmetric key pair: the private key stays on your device, only the public key goes to the site.
It's opened with a fingerprint or a PIN. **It doesn't work on a fake site**, because the key is bound to the domain name.

## Secure session

- Don't tick "remember me" on a shared computer; **sign out** when you're done.
- Check the "active sessions" list in your account now and then.
- When you change your password, close the sessions on other devices.

## 🧪 Try it (5 min)

Pick your most important account (email): is MFA on? If not, turn it on **now**. Which method did you choose?

## ✅ Remember

- A separate password for every site; the password manager does this.
- Turn on MFA; a passkey or an app if possible, SMS at worst.
- A verification code is never shared with anyone.
