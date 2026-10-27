---
id: f-03
baslik: "Android static analysis: reading code with JADX and MobSF"
hedefler:
  - Decompile an APK into readable code with JADX and hunt for embedded secrets
  - Interpret a MobSF report against the OWASP MASVS headings
---

# Android static analysis: reading code with JADX and MobSF

> Static analysis means reading the app **without running it**. Everything the developer forgot stays in the code.
> 🔧 **Circuit 3:** A key is hidden in Leman's app. Not on the phone — inside the code.

::cizgi[f-03-sahne]

## The yardstick: OWASP MASVS and MASTG

**MASVS** (Mobile Application Security Verification Standard) says "what should it be?": storage, crypto, network, code quality…
**MASTG** (Mobile Application Security Testing Guide) answers "how do you test it?". Tie your finding to these headings.

## JADX: from dex to readable code

![A compressed parcel passing through a translation machine and coming out as readable pages](../../gorseller/f-03-c.webp)

```bash
jadx -d diva-kod/ diva-beta.apk
grep -rniE "api_?key|secret|password|token|http://" diva-kod/
```

What to look for:

- Keys, passwords, URLs hardcoded into the code
- Weak crypto: `MD5`, `DES`, `AES/ECB`, a fixed IV
- Writing sensitive data with `Log.d(...)`
- `setJavaScriptEnabled(true)` + `addJavascriptInterface` inside a `WebView`

## MobSF: the automated first scan

```bash
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest
```

Open `http://localhost:8000` in your browser and upload the APK. The report lists Manifest settings, permissions, embedded secrets and the certificate.

![The static analysis summary screen MobSF produced for the deliberately vulnerable DIVA app; security score and Manifest findings marked](../../gorseller/f-03-b.webp)

**Careful:** MobSF is a starting point. Verify every finding yourself in JADX; there are plenty of false positives.

## How do you write a finding?

| Field | Example |
|---|---|
| Title | Cloud API key hardcoded in code |
| Evidence | Class name + line, `grep` output |
| Mapping | MASVS-CRYPTO (key management) |
| Recommendation | Revoke the key, move to server-side authentication |

## The rule

Only deliberately vulnerable training apps (DIVA, InsecureBankv2, MASTG test apps) or **your own** app.
Reverse engineering someone else's app and publishing it is a licensing and legal problem.

## 🧪 Try it (5 min)

Open DIVA in JADX. Find the class behind the "Hardcoding Issues – Part 1" screen and identify the value hardcoded in the code.
Then write which MASVS heading (STORAGE, CRYPTO, CODE…) you would tie this to.

## ✅ Remember

- Every constant in an APK is a constant anyone can read.
- MobSF gets you started fast, JADX verifies.
- Findings are reported against MASVS headings.
