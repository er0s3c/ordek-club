---
id: m08-03
baslik: Digital signature and certificate — "did you really send this?"
hedefler:
  - Explain how a digital signature works
  - Understand certificates and the PKI chain
---

# Digital signature and certificate

> Encryption says "let no one read this". A signature says "**I really sent this and no one changed it**".

::cizgi[m08-03-sahne]

## How does a digital signature work?

![A wax seal pressed onto a document only with the private seal in its owner's hand; anyone can verify the seal with the magnifying glass they hold](../../gorseller/m08-03-b.webp)

1. The sender takes the **hash** of the document.
2. They sign the hash with their own **private key**.
3. The recipient verifies the signature with the sender's **public key** and compares it with the hash they calculated themselves.

The result:
- ✅ **Identity** — the signature can only be made with that private key.
- ✅ **Integrity** — if a single letter of the document changes, the hash doesn't match.
- ✅ **Non-repudiation** — you can't say "I didn't send it".

Where? Software updates, electronically signed documents, Git commits, TLS.

## Certificate: "Whose public key is this really?"

![Passport control: a key's identity document, stamped by a trusted authority](../../gorseller/m08-03-c.webp)

An attacker can also produce a public key that says "I'm the bank". The solution: **a trusted third party** verifies and signs it.

- **Certificate** = domain name + public key + the signature of a **Certificate Authority (CA)**
- **PKI** (Public Key Infrastructure) = the CAs, the certificates and the verification rules, all together

## The chain of trust

```text
Root CA (pre-installed in your browser/operating system)
   └── Intermediate CA (signed by the root)
         └── kuzeykiyi.edu.example certificate (signed by the intermediate CA)
```

The browser follows the chain upwards; if it can't reach the root, it gives a warning.
See where this verification sits in the TLS handshake:

::animasyon[tls-handshake]

## 🧪 Try it (3 min)

Open a site's certificate (M05-06) and look at the **Certificate path / Certificate Hierarchy** tab.
How many links are there in the chain? What is the name of the root CA?

## ✅ Remember

- A signature is made with the private key and verified with the public key.
- A signature provides identity, integrity and non-repudiation.
- A certificate binds a public key to an identity; trust is built through a chain that reaches up to the root CA.
