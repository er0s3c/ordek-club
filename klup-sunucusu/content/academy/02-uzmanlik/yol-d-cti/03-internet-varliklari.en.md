---
id: d-03
baslik: "Internet assets: WHOIS, DNS and certificate records"
hedefler:
  - Derive infrastructure relationships from WHOIS/RDAP, DNS and passive DNS records
  - Find hidden domain names in Certificate Transparency logs
---

# Internet assets: WHOIS, DNS and certificate records

> Painting a flag is cheap; building infrastructure is expensive. Each of Bedri's domain names carries a different flag, but they all connect somewhere.
> 🚩 **Flag 3:** The name of the domain names used in the attack screams "mercan". So what do the records whisper?

::cizgi[d-03-sahne]

## WHOIS and RDAP

A domain name's **registrar**, creation date and name servers.
The registrant is often hidden, but **date, time, registrar and NS** overlaps are fingerprints that are hard to hide.

```bash
whois ornek.example
curl -s https://rdap.org/domain/ornek.example    # RDAP: the same information, as JSON
```

## DNS and passive DNS

```bash
dig +short A ornek.example
dig +short NS ornek.example
dig +short TXT ornek.example     # the SPF record may contain the real mail server IP
```

::animasyon[dns-resolution]

**Passive DNS** shows which names an IP address has answered to in the past.
Careful: on shared hosting and CDN addresses, thousands of innocent sites share the same IP. Such an IP on its own is not evidence.

## Certificate Transparency

Every TLS certificate is written to public logs. In interfaces such as `crt.sh`, a certificate's
**SAN (Subject Alternative Name)** field gives away other domain names that share the same certificate.
If an attacker forgets a subdomain, that is where you find it.

## Pivoting

![A thread from a single key reaching other doors, and from there to other buildings, forming a network](../../gorseller/d-03-b.webp)

Jump from one indicator to the next: domain name → IP → other names on the same IP → their NS → other records on the same NS.
Write every step in the log; every pivot is a **hypothesis**, not evidence.

## 🧪 Try it (5 min)

Open the `lab/d-altyapi-kayitlari.txt` file. Which three features do the campaign's three domain names share?
How many of these features does MERCAN-7's old domain name `mrcn-sync.example` carry? Is there an unexpected name in the certificate records?

## ✅ Remember

- A name is easy to imitate; registration time, registrar and NS overlap are harder.
- Shared IPs (CDN, hosting) on their own are not proof of a relationship.
- The certificate SAN field reveals forgotten domain names.
