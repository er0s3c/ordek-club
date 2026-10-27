---
id: m01-05
baslik: "Suspicious Message: The Fake Campus Scholarship"
hedefler:
  - I check the sender by what comes after the @ sign
  - I don't click the link; I go to the official site myself
  - If I'm not sure, I verify through another channel and report it
# Organisation and domain names are fictional (RFC 2606 .example); they imitate no real organisation, person or site.
gorevler:
  - id: sahte-burs
    baslik: "Suspicious Message: The Fake Campus Scholarship"
    kanca:
      saat: "23:47"
      metin: "A message just landed on Deniz's phone: \"Your scholarship is approved, verify within 24 hours.\" Everyone will be thrilled. You take a look first."
    posta:
      gonderen: North Island Scholarship Office
      adres: burs@kuzeyada-burslar.example
      saat: "23:47"
      konu: "Your scholarship application is APPROVED, verify within 24 hours"
      govde: |
        Hello,

        Congratulations! Your merit scholarship has been approved. So that your scholarship isn't cancelled, sign in with your student number and password within 24 hours and verify your account.

        North Island University Scholarship Office
      dugme: Verify my account
      hedef: giris.kuzeyada-burslar.example
      resmi: kuzeyada.edu.example
    adimlar:
      - tur: sec
        baslik: What should Deniz do?
        soru: The message has arrived. What's the first move?
        secenekler:
          - metin: Tap the link
            sahne: giris
            geri: "Most people click right here; that's what the message was written for. It's a simulation — nothing was sent. If you'd typed your password, it would have gone to the scammer. You're not the problem."
          - metin: Inspect the sender
            dogru: true
            geri: "You caught it. The name says \"Scholarship Office\", but let's look at the address."
          - metin: Forward it to the group
            geri: "A well-meant choice. But forwarding it without a warning carries the trap to everyone in the group. Verify it yourself first."
        ipuclari:
          - "The button in a message goes wherever the person who wrote it wants. First look at who wrote the message."
          - "Which of the three options gathers information without touching anything?"
        cozum: "Let's look together: tapping the link and forwarding both do what the message wants. Inspecting the sender gathers information without touching anything. That's always the first move."
      - tur: sec
        baslik: One name, a different address
        soru: Does this message come from the school's address?
        panel: true
        secenekler:
          - metin: "Yes"
            geri: "Close. The word \"kuzeyada\" is in both addresses, but what follows it is different. Look at them side by side again."
          - metin: "No"
            dogru: true
            geri: "Right. The name is \"North Island Scholarship Office\", but the address isn't the school's. A hyphen and an extra word mean a different place."
          - metin: I'm not sure
            ipucu: true
            geri: "An honest answer. This time the hint is on screen: look at the address."
        ipuclari:
          - "A name can look nice. Look at the address: what comes after the @ sign tells you where the message came from."
          - "The school's address is kuzeyada.edu.example. Is the one in this message the same? Put them side by side, letter by letter."
        cozum: "Let's look together: kuzeyada · .edu · .example versus kuzeyada · -burslar · .example. The middle part is different, so the message doesn't come from the school's address."
      - tur: kanit
        baslik: What convinced you?
        soru: Which is the strongest sign? Pick one.
        tek: true
        secenekler:
          - metin: The sender's address isn't the same as the school's
            cekirdek: true
          - metin: The address the button goes to isn't the school's
            cekirdek: true
          - metin: It pressures you with 24 hours
            geri: "Rushing you is a classic sign, but real schools set deadlines too. There's something harder to fake."
          - metin: "It starts with \"Hello\""
            geri: "Real schools write \"Hello\" too. That alone isn't proof. What did you just put side by side?"
          - metin: One word is in capital letters
            geri: "Capitals grab attention, but they're not proof on their own. What did you just put side by side?"
        dogru_geri: "You caught it. The address is the hardest thing to change in a message, which is why it's the strongest evidence."
        eksik: "That alone isn't proof. What did you just put side by side?"
        ipuclari:
          - "What did you just put side by side?"
          - "Which is hardest to change: a greeting or an address?"
        cozum: "Let's look together: anyone can write a greeting, capital letters or a deadline. But the address the message came from and the address the button goes to aren't the school's. That's the evidence."
    kapanis:
      ifsa: "The \"Scholarship Office\" didn't write that message. Smooth-Talking Tevfik did. Polite, urgent, familiar. It always arrives like that. Logged."
      kurallar:
        - Check the sender by what comes after the @ sign.
        - Don't click the link. Go to the official site yourself.
        - If it's suspicious, report it — don't forward it. This trick is called phishing.
      sonraki: "00:12 New message. No link inside. The address is right, too. But the sender spelled your name wrong."
---

# Suspicious Message: The Fake Campus Scholarship

::gorev[sahte-burs]

::cizgi[m01-05-sahne]
