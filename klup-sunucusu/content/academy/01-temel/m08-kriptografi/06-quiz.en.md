---
id: m08-06
baslik: "M08 Quiz: Cryptography and digital identity"
sorular:
  - soru: In asymmetric encryption, which key is used to lock (encrypt) the message?
    tur: coktan
    secenekler: [The recipient's private key, The recipient's public key, The sender's password, A single shared key]
    dogru: 1
    aciklama: The public key is given to everyone and locks; only the owner of the private key can open it.
  - soru: What is the fundamental difference between a hash and encryption?
    tur: coktan
    secenekler:
      - A hash is faster
      - A hash is irreversible, encryption is decrypted with a key
      - Encryption only works on text
      - A hash requires a key
    dogru: 1
    aciklama: A hash is one-way; encryption opens back up with the key.
  - soru: What is the purpose of adding "salt" to password hashes?
    tur: coktan
    secenekler:
      - To shorten the hash
      - To make the same passwords produce different hashes and make ready-made tables useless
      - To make the password reversible
      - To encrypt the password
    dogru: 1
    aciklama: A random salt unique to each user blocks rainbow table attacks.
  - soru: Which of these is needed to verify a digital signature?
    tur: coktan
    secenekler: [The signer's private key, The signer's public key, The recipient's private key, The certificate's password]
    dogru: 1
    aciklama: A signature is made with the private key and verified with the public key.
  - soru: Which of the following MFA methods is the most resistant to phishing?
    tur: coktan
    secenekler: [An SMS code, An email code, A passkey / hardware security key, A security question]
    dogru: 2
    aciklama: A passkey is bound to the domain name; it doesn't work on a fake site.
  - soru: "\"kumda yuruyen mavi ordek\" passphrase is stronger than the password \"P@ss1!\"."
    tur: dogru-yanlis
    dogru: true
    aciklama: Length increases the number of combinations far more than complexity does.
  - soru: It is safe to tell the verification code that arrives on your phone to someone who says they are calling from the school.
    tur: dogru-yanlis
    dogru: false
    aciklama: A verification code is never shared under any circumstances; legitimate organisations don't ask for it.
---

# M08 Quiz: Cryptography and digital identity

7 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Safecracker Kadir** · *when you pass the quiz with 70%*
>
> ::cizgi[kadir-kapanis]
>
> ➡️ *Next case file: **Masked Mine** (M09)*
