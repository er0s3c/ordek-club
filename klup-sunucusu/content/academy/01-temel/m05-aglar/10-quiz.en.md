---
id: m05-10
baslik: "M05 Quiz: The internet and networks"
sorular:
  - soru: Which device delivers frames to the right device among devices on the same local network?
    tur: coktan
    secenekler: [Modem, Switch, Access point, DNS server]
    dogru: 1
    aciklama: A switch delivers within the local network based on MAC addresses.
  - soru: In the TCP/IP model, which layer is the IP protocol on?
    tur: coktan
    secenekler: [Application, Transport, Internet, Network access]
    dogru: 2
    aciklama: IP sits in the Internet layer, which routes packets between networks.
  - soru: Which of the following is a private IP address?
    tur: coktan
    secenekler: [8.8.8.8, 192.168.10.4, 151.101.1.69, 203.0.113.66]
    dogru: 1
    aciklama: 192.168.0.0/16 is a private address range.
  - soru: What is the correct order of the TCP three-way handshake?
    tur: coktan
    secenekler: [ACK → SYN → SYN-ACK, SYN → ACK → SYN-ACK, SYN → SYN-ACK → ACK, SYN-ACK → SYN → ACK]
    dogru: 2
    aciklama: The client sends SYN, the server replies with SYN-ACK, and the client completes it with ACK.
  - soru: What is the right approach for database ports (e.g. 3306, 5432)?
    tur: coktan
    secenekler:
      - They should be open to the internet so the application can reach them
      - They should be closed to the internet; only the servers that need them should reach them
      - They should be open only at night
      - They can be opened to the internet if the port number is changed
    dogru: 1
    aciklama: Database services should never be open to the internet.
  - soru: The internet works but sites can't be reached by domain name, while they can be reached by IP. Where is the problem most likely?
    tur: coktan
    secenekler: [DHCP, DNS, ARP, Cable]
    dogru: 1
    aciklama: Name resolution isn't working.
  - soru: The padlock icon in the address bar guarantees that the site is honest and trustworthy.
    tur: dogru-yanlis
    dogru: false
    aciklama: The padlock only shows that the connection is encrypted and that the certificate belongs to that domain name.
  - soru: With Wireshark, the content of HTTPS traffic can be read by default.
    tur: dogru-yanlis
    dogru: false
    aciklama: TLS encrypts the content; only connection information and the handshake are visible.
---

# M05 Quiz: The internet and networks

8 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Listener Nuri** · *when you pass the quiz with 70%*
>
> ::cizgi[nuri-kapanis]
>
> ➡️ *Next case file: **Cookie-Baker Celal** (M06)*
