// Animasyon metinlerinin İngilizcesi (scripts tarafından üretildi; elle düzenlenebilir).
// Diziler src/animations/{network,web,ops}.ts içindeki sırayla eşleşir. Kod satırları çevrilmez.
import type { AnimationEn } from "./locale";

export const EN_ANIM: Record<string, AnimationEn> = {
  "http-request": {
    "title": "HTTP request / response flow",
    "summary": "How does a browser ask for a page, and how does the server answer?",
    "actors": [
      {
        "label": "Browser",
        "sub": "client"
      },
      {
        "label": "Web server",
        "sub": "application"
      },
      {
        "label": "Database"
      }
    ],
    "steps": [
      {
        "label": "GET /profile",
        "note": "The browser sends an HTTP request: method (GET), path (/profile) and headers (Host, Cookie, User-Agent)."
      },
      {
        "label": "verify session",
        "note": "The server checks the session ID in the Cookie header. With no identity it redirects to the login page with 302."
      },
      {
        "label": "SELECT … WHERE id = $1",
        "note": "The application asks for the user's data with a parameterised query. Input is never concatenated into the query text."
      },
      {
        "label": "1 row",
        "note": "The database returns the result. The server places that data into the HTML template safely, escaping it."
      },
      {
        "label": "200 OK + HTML",
        "note": "The response: status code, headers (Content-Type, Content-Security-Policy, Set-Cookie) and body."
      },
      {
        "label": "render the page",
        "note": "The browser parses the HTML, fetches CSS/JS resources with extra requests and renders the page."
      }
    ],
    "zones": [],
    "panels": []
  },
  "dns-resolution": {
    "title": "DNS resolution",
    "summary": "How does the name ornek.edu.tr turn into an IP address?",
    "actors": [
      {
        "label": "Client",
        "sub": "stub resolver"
      },
      {
        "label": "Recursive",
        "sub": "resolver"
      },
      {
        "label": "Root (.)",
        "sub": "root server"
      },
      {
        "label": ".tr TLD",
        "sub": "TLD server"
      },
      {
        "label": "Authoritative",
        "sub": "ornek.edu.tr"
      }
    ],
    "steps": [
      {
        "label": "A ornek.edu.tr ?",
        "note": "The client first checks its own cache; if that misses, it asks the network's DNS resolver over UDP/53."
      },
      {
        "label": "ornek.edu.tr ?",
        "note": "If the answer is not in the resolver's cache, it starts with the root servers."
      },
      {
        "label": "→ .tr servers",
        "note": "The root server does not know the answer; it refers the resolver to the .tr TLD servers."
      },
      {
        "label": "ornek.edu.tr ?",
        "note": "The resolver asks the same question to the .tr server."
      },
      {
        "label": "→ ns1.ornek.edu.tr",
        "note": "The TLD names the authoritative name server for the domain."
      },
      {
        "label": "ornek.edu.tr ?",
        "note": "The question is put to the authoritative server."
      },
      {
        "label": "A 203.0.113.10 TTL 3600",
        "note": "The answer is cached for the TTL. If there is a DNSSEC signature, the resolver validates it."
      },
      {
        "label": "203.0.113.10",
        "note": "The client can now connect to the IP. Security note: fake DNS answers (spoofing) are reduced with DNSSEC and DoH/DoT."
      }
    ],
    "zones": [],
    "panels": []
  },
  "tcp-handshake": {
    "title": "TCP three-way handshake",
    "summary": "Before a reliable connection is set up: SYN, SYN-ACK, ACK.",
    "actors": [
      {
        "label": "Client",
        "sub": "10.0.0.5:51544"
      },
      {
        "label": "Server",
        "sub": "203.0.113.10:443"
      }
    ],
    "steps": [
      {
        "label": "SYN seq=1000",
        "note": "The client sends a SYN with a random initial sequence number. State: SYN_SENT."
      },
      {
        "label": "SYN-ACK seq=5000",
        "note": "The server picks its own sequence number (5000) and acknowledges the client's SYN (ack=1001). State: SYN_RECEIVED."
      },
      {
        "label": "ACK ack=5001",
        "note": "The client acknowledges; both sides are now ESTABLISHED. Data can flow from here."
      },
      {
        "label": "data (TLS ClientHello)",
        "note": "Application data starts to flow. Security note: SYN flood attacks use half-open connections to exhaust resources; SYN cookies reduce this."
      }
    ],
    "zones": [],
    "panels": []
  },
  "packet-journey": {
    "title": "A packet's journey across the network",
    "summary": "Which stops does a packet pass on its way from a laptop to a server on the internet?",
    "actors": [
      {
        "label": "Laptop",
        "sub": "192.168.1.20"
      },
      {
        "label": "Switch",
        "sub": "Layer 2"
      },
      {
        "label": "Home router",
        "sub": "NAT"
      },
      {
        "label": "ISP",
        "sub": "backbone"
      },
      {
        "label": "Server",
        "sub": "203.0.113.10"
      }
    ],
    "steps": [
      {
        "label": "encapsulation",
        "note": "Application data → TCP segment → IP packet → Ethernet frame. Because the destination IP is remote, the destination MAC is the gateway's MAC (found with ARP)."
      },
      {
        "label": "frame → GW MAC",
        "note": "The switch checks its MAC table and forwards the frame only to the router's port."
      },
      {
        "label": "frame",
        "note": "The router strips the Ethernet header and looks at the IP header."
      },
      {
        "label": "NAT → 198.51.100.7",
        "note": "NAT replaces the private address (192.168.1.20) with the public address and records the connection in its table. The TTL drops by one."
      },
      {
        "label": "IP packet",
        "note": "The packet reaches its destination hop by hop according to routing tables. traceroute shows these hops."
      },
      {
        "label": "reply (reverse path)",
        "note": "The reply returns by the same path; the NAT table makes sure it is delivered to the right internal device."
      }
    ],
    "zones": [],
    "panels": []
  },
  "firewall-decision": {
    "title": "Firewall decision process",
    "summary": "Rules are evaluated from top to bottom; the first matching rule is applied.",
    "actors": [
      {
        "label": "Visitor",
        "sub": "internet"
      },
      {
        "label": "Scanner bot",
        "sub": "internet"
      },
      {
        "label": "Firewall",
        "sub": "stateful"
      },
      {
        "label": "Web server",
        "sub": "443/tcp"
      },
      {
        "label": "Management (SSH)",
        "sub": "22/tcp"
      }
    ],
    "steps": [
      {
        "label": "TCP → 443",
        "note": "Rule 1: ALLOW tcp any → web:443. The packet matches this rule."
      },
      {
        "label": "ALLOW (rule 1)",
        "note": "The packet is forwarded. The stateful firewall records the connection in its table, so return traffic is allowed without a rule."
      },
      {
        "label": "TCP → 22",
        "note": "Rule 2: ALLOW tcp 10.10.0.0/16 (VPN) → ssh:22. It does not match because the source is the internet."
      },
      {
        "label": "log → SIEM",
        "note": "The blocked connection is logged. Many denials from the same source can raise a port-scan alarm."
      }
    ],
    "zones": [],
    "panels": []
  },
  "vpn-tunnel": {
    "title": "VPN tunnel",
    "summary": "On an untrusted network, traffic reaches the internal network through an encrypted tunnel.",
    "actors": [
      {
        "label": "Student",
        "sub": "café Wi-Fi"
      },
      {
        "label": "Listener",
        "sub": "same Wi-Fi"
      },
      {
        "label": "Open Wi-Fi"
      },
      {
        "label": "VPN gateway",
        "sub": "campus"
      },
      {
        "label": "Library system",
        "sub": "internal network"
      }
    ],
    "steps": [
      {
        "label": "handshake (key exchange)",
        "note": "Client and gateway authenticate each other and derive a shared session key (for example WireGuard or IPsec IKEv2)."
      },
      {
        "label": "ENCRYPTED packet",
        "note": "The inner packet (destined for the library system) is fully encrypted and placed inside a new outer packet."
      },
      {
        "label": "meaningless bytes",
        "note": "A listener on the same network sees only encrypted traffic heading to the gateway; it cannot see the content or the internal destination."
      },
      {
        "label": "ENCRYPTED packet",
        "note": "The gateway opens the outer packet, verifies its integrity and extracts the inner packet."
      },
      {
        "label": "inner packet",
        "note": "Inside the internal network the packet travels normally. Note: a VPN does not provide identity or endpoint security; it only protects transport."
      }
    ],
    "zones": [],
    "panels": []
  },
  "network-topology": {
    "title": "Corporate network topology and zones",
    "summary": "The internet, the DMZ and the internal network, and which traffic is allowed between which zones.",
    "actors": [
      {
        "label": "Internet"
      },
      {
        "label": "Firewall"
      },
      {
        "label": "Web",
        "sub": "DMZ"
      },
      {
        "label": "Email",
        "sub": "DMZ"
      },
      {
        "label": "Core switch"
      },
      {
        "label": "Staff"
      },
      {
        "label": "Database"
      },
      {
        "label": "SIEM"
      }
    ],
    "steps": [
      {
        "label": "HTTPS",
        "note": "From the internet, only the public services in the DMZ (web, email) may be reached."
      },
      {
        "label": "direct access ✕",
        "note": "A direct connection from the internet to the internal network is denied. The database is never exposed to the internet."
      },
      {
        "label": "only 5432/tcp",
        "note": "The web server in the DMZ reaches the internal network only on the port it needs, to the server it needs (least privilege)."
      },
      {
        "label": "egress (proxy)",
        "note": "Staff reach the internet through a controlled exit; outbound traffic is filtered as well."
      }
    ],
    "zones": [
      "INTERNET (untrusted)",
      "DMZ",
      "INTERNAL (trusted)"
    ],
    "panels": []
  },
  "tls-handshake": {
    "title": "Encryption and key exchange (TLS 1.3)",
    "summary": "How do the browser and the server agree on a shared key that listeners cannot break?",
    "actors": [
      {
        "label": "Browser"
      },
      {
        "label": "Listener",
        "sub": "passive"
      },
      {
        "label": "Server",
        "sub": "certified"
      }
    ],
    "steps": [
      {
        "label": "ClientHello + key_share",
        "note": "The client sends the cipher suites it supports and an ephemeral Diffie-Hellman public key (ECDHE)."
      },
      {
        "label": "ServerHello + key_share",
        "note": "The server sends its own ephemeral public key. Both sides can now compute the same shared secret; a listener cannot."
      },
      {
        "label": "Certificate + Sig",
        "note": "The server sends its certificate and a signature over the handshake. The browser validates the chain up to a trusted CA (the name must match)."
      },
      {
        "label": "Finished",
        "note": "Both sides verify that the handshake was not altered. Ephemeral keys give forward secrecy."
      },
      {
        "label": "🔒 encrypted HTTP",
        "note": "Application data is encrypted and its integrity protected with AEAD (for example AES-GCM)."
      },
      {
        "label": "encrypted bytes only",
        "note": "The listener sees the traffic but cannot read or change it. What it can see: destination IP, timing and size."
      }
    ],
    "zones": [],
    "panels": []
  },
  "authentication": {
    "title": "Authentication and session",
    "summary": "Password plus a second factor, then a secure session cookie.",
    "actors": [
      {
        "label": "User"
      },
      {
        "label": "Browser"
      },
      {
        "label": "Application"
      },
      {
        "label": "User DB",
        "sub": "password hashes"
      },
      {
        "label": "Authenticator",
        "sub": "TOTP app"
      }
    ],
    "steps": [
      {
        "label": "username + password",
        "note": "The form is submitted over HTTPS only."
      },
      {
        "label": "POST /login",
        "note": "The server limits the number of attempts (against brute force) and its error message does not say which field was wrong."
      },
      {
        "label": "fetch the hash",
        "note": "Passwords are not stored in plain text; they are stored with a salted, slow KDF (scrypt/Argon2/bcrypt)."
      },
      {
        "label": "scrypt$…",
        "note": "The server hashes the entered password with the same salt and compares in constant time."
      },
      {
        "label": "6-digit code",
        "note": "Second factor: even if the password is stolen, the attacker cannot sign in."
      },
      {
        "label": "Set-Cookie (HttpOnly)",
        "note": "A random, unpredictable session ID, sent with HttpOnly (JavaScript cannot read it) and Secure; SameSite guards against CSRF."
      }
    ],
    "zones": [],
    "panels": []
  },
  "sql-injection": {
    "title": "How SQL injection works",
    "summary": "If user input is added to the query text, data turns into code.",
    "actors": [],
    "steps": [],
    "zones": [],
    "panels": [
      "Insecure: concatenation",
      "Secure: parameterised query"
    ]
  },
  "xss": {
    "title": "How stored XSS works",
    "summary": "Unescaped user content runs as a script in another user's browser.",
    "actors": [
      {
        "label": "Attacker"
      },
      {
        "label": "Forum app"
      },
      {
        "label": "Database"
      },
      {
        "label": "Victim",
        "sub": "browser"
      },
      {
        "label": "Attacker server"
      }
    ],
    "steps": [
      {
        "label": "comment: <script>…",
        "note": "The attacker submits text containing a script into the comment field."
      },
      {
        "label": "store as-is",
        "note": "The application stores the content. (Storing is not the problem; the output is.)"
      },
      {
        "label": "GET /topic/42",
        "note": "Another user opens the page."
      },
      {
        "label": "HTML + unescaped comment",
        "note": "Because the comment is inserted into the HTML without escaping, the browser treats it as CODE, not text."
      },
      {
        "label": "session data / action",
        "note": "The script can send requests with the victim's session, change the page or leak data."
      },
      {
        "label": "&lt;script&gt; + CSP",
        "note": "Defence: context-aware output escaping (React does this by default), an HttpOnly cookie and a Content-Security-Policy with a nonce."
      }
    ],
    "zones": [],
    "panels": []
  },
  "phishing": {
    "title": "Phishing attack lifecycle",
    "summary": "From reconnaissance through credential use to detection.",
    "actors": [
      {
        "label": "Attacker"
      },
      {
        "label": "Email gateway",
        "sub": "SPF/DKIM/DMARC"
      },
      {
        "label": "Student"
      },
      {
        "label": "Fake login page",
        "sub": "obs-ornek.edu.co"
      },
      {
        "label": "Real OBS"
      },
      {
        "label": "SOC"
      }
    ],
    "steps": [
      {
        "label": "reconnaissance",
        "note": "The attacker researches the target: email format, systems in use and current announcements (OSINT)."
      },
      {
        "label": "inbox",
        "note": "The email is delivered because it uses a lookalike domain that passes SPF/DKIM/DMARC checks."
      },
      {
        "label": "clicks link + enters pwd",
        "note": "Warning signs: the domain, the unexpected request, the urgency. A password manager will not autofill on a fake site."
      },
      {
        "label": "credentials",
        "note": "The attacker collects the details."
      },
      {
        "label": "login attempt",
        "note": "With MFA in place the password alone is not enough. An unusual location or device raises an alert."
      }
    ],
    "zones": [],
    "panels": []
  },
  "mitm": {
    "title": "Man-in-the-middle (MITM) — concept",
    "summary": "The attacker steps between two parties; how do encryption and certificate checks defeat this?",
    "actors": [
      {
        "label": "Victim"
      },
      {
        "label": "Attacker",
        "sub": "same local network"
      },
      {
        "label": "Gateway"
      },
      {
        "label": "Bank site"
      }
    ],
    "steps": [
      {
        "label": "normal traffic",
        "note": "Normally the traffic goes straight to the gateway."
      },
      {
        "label": "traffic to attacker",
        "note": "If the traffic is unencrypted (HTTP), the attacker can read and change it."
      },
      {
        "label": "fake certificate",
        "note": "To read HTTPS traffic, it has to present a fake certificate."
      },
      {
        "label": "⚠ cert error / HSTS",
        "note": "The browser cannot tie the certificate to a trusted CA and drops the connection. HSTS prevents falling back to HTTP."
      },
      {
        "label": "🔒 end-to-end TLS",
        "note": "Defences: HTTPS and HSTS everywhere, never clicking through certificate warnings, and Dynamic ARP Inspection on the switch."
      }
    ],
    "zones": [],
    "panels": []
  },
  "soc-alert": {
    "title": "SOC alert handling process",
    "summary": "From an endpoint event to incident response: detection → triage → response.",
    "actors": [
      {
        "label": "Endpoint",
        "sub": "EDR agent"
      },
      {
        "label": "SIEM",
        "sub": "correlation"
      },
      {
        "label": "Analyst (L1)",
        "sub": "triage"
      },
      {
        "label": "Incident resp.",
        "sub": "L2/IR"
      },
      {
        "label": "Case file"
      }
    ],
    "steps": [
      {
        "label": "powershell -enc …",
        "note": "EDR logs the suspicious encoded PowerShell execution and sends it to the SIEM."
      },
      {
        "label": "rule matched: T1059.001",
        "note": "The SIEM correlates events (same user, new process, outbound connection) and assigns a severity."
      },
      {
        "label": "alert: HIGH",
        "note": "The analyst receives the alert: gathers context and judges whether it is a false positive."
      },
      {
        "label": "open case + evidence",
        "note": "The timeline, affected assets and indicators (IOCs) are recorded in the case."
      },
      {
        "label": "escalation",
        "note": "A true positive is handed over to the incident response team."
      },
      {
        "label": "isolate",
        "note": "Containment: the device is isolated from the network and the credentials are reset."
      },
      {
        "label": "root cause + lessons",
        "note": "Clean-up, recovery and 'lessons learned'. A new detection rule is added to the SIEM."
      }
    ],
    "zones": [],
    "panels": []
  },
  "secure-vs-insecure": {
    "title": "Secure and insecure code: storing passwords",
    "summary": "Two pieces of code doing the same job — one exposes everyone's password in a data breach.",
    "actors": [],
    "steps": [],
    "zones": [],
    "panels": [
      "Insecure",
      "Secure"
    ]
  }
};
