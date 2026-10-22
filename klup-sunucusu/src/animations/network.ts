import type { AnimationDef } from "./types";

export const httpRequest: AnimationDef = {
  kind: "flow",
  id: "http-request",
  title: "HTTP istek / yanıt akışı",
  summary: "Tarayıcı bir sayfayı nasıl ister, sunucu nasıl yanıtlar?",
  actors: [
    { id: "browser", label: "Tarayıcı", sub: "istemci", icon: "browser", x: 110, y: 180 },
    { id: "web", label: "Web sunucusu", sub: "uygulama", icon: "server", x: 400, y: 180, tone: "infra" },
    { id: "db", label: "Veritabanı", icon: "database", x: 690, y: 180, tone: "infra" },
  ],
  steps: [
    { from: "browser", to: "web", label: "GET /profil", tone: "request", note: "Tarayıcı bir HTTP isteği gönderir: yöntem (GET), yol (/profil), başlıklar (Host, Cookie, User-Agent)." },
    { from: "web", to: "web", label: "oturum doğrula", tone: "info", note: "Sunucu Cookie başlığındaki oturum kimliğini doğrular. Kimlik yoksa 302 ile girişe yönlendirir." },
    { from: "web", to: "db", label: "SELECT … WHERE id = $1", tone: "request", note: "Uygulama, parametreli sorgu ile kullanıcının verisini ister. Girdi sorgu metnine eklenmez." },
    { from: "db", to: "web", label: "1 satır", tone: "reply", note: "Veritabanı sonucu döner. Sunucu bu veriyi HTML şablonuna güvenli şekilde (kaçışlayarak) yerleştirir." },
    { from: "web", to: "browser", label: "200 OK + HTML", tone: "reply", note: "Yanıt: durum kodu, başlıklar (Content-Type, Content-Security-Policy, Set-Cookie) ve gövde." },
    { from: "browser", to: "browser", label: "sayfayı çiz", tone: "info", note: "Tarayıcı HTML'i ayrıştırır, CSS/JS kaynaklarını ek isteklerle alır ve sayfayı çizer." },
  ],
};

export const dnsResolution: AnimationDef = {
  kind: "flow",
  id: "dns-resolution",
  title: "DNS çözümleme",
  summary: "ornek.edu.tr adı bir IP adresine nasıl dönüşür?",
  actors: [
    { id: "client", label: "İstemci", sub: "stub resolver", icon: "laptop", x: 90, y: 180 },
    { id: "resolver", label: "Özyinelemeli", sub: "çözümleyici", icon: "globe", x: 300, y: 180, tone: "infra" },
    { id: "root", label: "Kök (.)", sub: "root server", icon: "server", x: 590, y: 60, tone: "infra" },
    { id: "tld", label: ".tr TLD", sub: "TLD sunucusu", icon: "server", x: 700, y: 180, tone: "infra" },
    { id: "auth", label: "Yetkili DNS", sub: "ornek.edu.tr", icon: "server", x: 590, y: 300, tone: "infra" },
  ],
  steps: [
    { from: "client", to: "resolver", label: "A ornek.edu.tr ?", tone: "request", note: "İstemci önce kendi önbelleğine bakar; yoksa ağın DNS çözümleyicisine sorar (UDP/53)." },
    { from: "resolver", to: "root", label: "ornek.edu.tr ?", tone: "request", note: "Çözümleyicinin önbelleğinde yoksa kök sunuculardan başlar." },
    { from: "root", to: "resolver", label: "→ .tr sunucuları", tone: "reply", note: "Kök sunucu cevabı bilmez; .tr TLD sunucularına yönlendirir (referral)." },
    { from: "resolver", to: "tld", label: "ornek.edu.tr ?", tone: "request", note: "Çözümleyici aynı soruyu .tr sunucusuna sorar." },
    { from: "tld", to: "resolver", label: "→ ns1.ornek.edu.tr", tone: "reply", note: "TLD, alan adının yetkili ad sunucusunu bildirir." },
    { from: "resolver", to: "auth", label: "ornek.edu.tr ?", tone: "request", note: "Yetkili sunucuya sorulur." },
    { from: "auth", to: "resolver", label: "A 203.0.113.10 (TTL 3600)", tone: "reply", note: "Cevap TTL süresince önbelleğe alınır. DNSSEC imzası varsa çözümleyici doğrular." },
    { from: "resolver", to: "client", label: "203.0.113.10", tone: "reply", note: "İstemci artık IP'ye bağlanabilir. Güvenlik notu: sahte DNS yanıtları (spoofing) DNSSEC ve DoH/DoT ile azaltılır." },
  ],
};

export const tcpHandshake: AnimationDef = {
  kind: "flow",
  id: "tcp-handshake",
  title: "TCP üçlü el sıkışma",
  summary: "Güvenilir bir bağlantı kurulmadan önce SYN, SYN-ACK, ACK.",
  actors: [
    { id: "client", label: "İstemci", sub: "10.0.0.5:51544", icon: "laptop", x: 160, y: 180 },
    { id: "server", label: "Sunucu", sub: "203.0.113.10:443", icon: "server", x: 640, y: 180, tone: "infra" },
  ],
  steps: [
    { from: "client", to: "server", label: "SYN seq=1000", tone: "request", note: "İstemci rastgele bir başlangıç sıra numarasıyla SYN gönderir. Durum: SYN_SENT." },
    { from: "server", to: "client", label: "SYN-ACK seq=5000 ack=1001", tone: "reply", note: "Sunucu kendi sıra numarasını seçer ve istemcinin SYN'ini onaylar. Durum: SYN_RECEIVED." },
    { from: "client", to: "server", label: "ACK ack=5001", tone: "request", note: "İstemci onaylar; iki taraf da ESTABLISHED. Artık veri gönderilebilir." },
    { from: "client", to: "server", label: "veri (TLS ClientHello)", tone: "request", note: "Uygulama verisi akar. Güvenlik notu: SYN flood saldırıları yarım kalmış bağlantılarla kaynak tüketir; SYN cookies bunu azaltır." },
  ],
};

export const packetJourney: AnimationDef = {
  kind: "flow",
  id: "packet-journey",
  title: "Paketin ağdaki yolculuğu",
  summary: "Bir paket dizüstü bilgisayardan internetteki sunucuya hangi duraklardan geçer?",
  actors: [
    { id: "laptop", label: "Dizüstü", sub: "192.168.1.20", icon: "laptop", x: 70, y: 190 },
    { id: "switch", label: "Switch", sub: "Katman 2", icon: "switch", x: 220, y: 190, tone: "infra" },
    { id: "router", label: "Ev yönlendiricisi", sub: "NAT", icon: "router", x: 380, y: 190, tone: "infra" },
    { id: "isp", label: "ISS", sub: "omurga", icon: "cloud", x: 540, y: 190, tone: "infra" },
    { id: "server", label: "Sunucu", sub: "203.0.113.10", icon: "server", x: 720, y: 190, tone: "infra" },
  ],
  links: [["laptop", "switch"], ["switch", "router"], ["router", "isp"], ["isp", "server"]],
  steps: [
    { from: "laptop", to: "laptop", label: "kapsülleme", tone: "info", note: "Uygulama verisi → TCP segmenti → IP paketi → Ethernet çerçevesi. Hedef IP uzak olduğu için hedef MAC = ağ geçidinin MAC'i (ARP ile bulunur)." },
    { from: "laptop", to: "switch", label: "çerçeve → GW MAC", tone: "request", note: "Switch, MAC tablosuna bakarak çerçeveyi yalnızca yönlendiricinin portuna iletir." },
    { from: "switch", to: "router", label: "çerçeve", tone: "request", note: "Yönlendirici Ethernet başlığını söker, IP başlığına bakar." },
    { from: "router", to: "isp", label: "NAT: 192.168.1.20 → 198.51.100.7", tone: "request", note: "NAT özel adresi genel adresle değiştirir ve bağlantıyı tablosuna yazar. TTL bir azalır." },
    { from: "isp", to: "server", label: "IP paketi", tone: "request", note: "Paket, yönlendirme tablolarına göre atlama atlama (hop) hedefe ulaşır. traceroute bu atlamaları gösterir." },
    { from: "server", to: "laptop", label: "yanıt (ters yol)", tone: "reply", note: "Yanıt aynı yoldan döner; NAT tablosu sayesinde doğru iç cihaza teslim edilir." },
  ],
};

export const firewallDecision: AnimationDef = {
  kind: "flow",
  id: "firewall-decision",
  title: "Güvenlik duvarı karar mekanizması",
  summary: "Kurallar yukarıdan aşağı değerlendirilir; ilk eşleşen kural uygulanır.",
  actors: [
    { id: "visitor", label: "Ziyaretçi", sub: "internet", icon: "globe", x: 90, y: 90 },
    { id: "scanner", label: "Tarayıcı bot", sub: "internet", icon: "attacker", x: 90, y: 280, tone: "bad" },
    { id: "fw", label: "Güvenlik duvarı", sub: "stateful", icon: "firewall", x: 400, y: 185, tone: "infra" },
    { id: "web", label: "Web sunucusu", sub: "443/tcp", icon: "server", x: 700, y: 90, tone: "infra" },
    { id: "ssh", label: "Yönetim (SSH)", sub: "22/tcp", icon: "lock", x: 700, y: 280, tone: "infra" },
  ],
  steps: [
    { from: "visitor", to: "fw", label: "TCP → 443", tone: "request", note: "Kural 1: ALLOW tcp any → web:443. Paket bu kurala uyar." },
    { from: "fw", to: "web", label: "ALLOW (kural 1)", tone: "secure", note: "Paket iletilir. Stateful güvenlik duvarı bağlantıyı tabloya yazar; dönüş trafiği otomatik izinlidir." },
    { from: "scanner", to: "fw", label: "TCP → 22", tone: "attack", note: "Kural 2: ALLOW tcp 10.10.0.0/16 (VPN) → ssh:22. Kaynak internet olduğu için eşleşmez." },
    { from: "fw", to: "fw", label: "DENY (varsayılan)", tone: "attack", focus: ["scanner"], note: "Hiçbir kural eşleşmedi → son kural: DENY any any. Varsayılan-red (default deny) en güvenli yaklaşımdır." },
    { from: "fw", to: "fw", label: "log → SIEM", tone: "info", note: "Engellenen bağlantı loglanır. Aynı kaynaktan çok sayıda red, port taraması alarmı üretebilir." },
  ],
};

export const vpnTunnel: AnimationDef = {
  kind: "flow",
  id: "vpn-tunnel",
  title: "VPN tüneli",
  summary: "Güvensiz bir ağda trafik şifreli bir tünelle iç ağa taşınır.",
  actors: [
    { id: "laptop", label: "Öğrenci", sub: "kafe Wi-Fi", icon: "laptop", x: 90, y: 190 },
    { id: "eve", label: "Dinleyen kişi", sub: "aynı Wi-Fi", icon: "attacker", x: 260, y: 320, tone: "bad" },
    { id: "wifi", label: "Açık Wi-Fi", icon: "wifi", x: 260, y: 190, tone: "infra" },
    { id: "gw", label: "VPN ağ geçidi", sub: "kampüs", icon: "shield", x: 520, y: 190, tone: "good" },
    { id: "lib", label: "Kütüphane sistemi", sub: "iç ağ", icon: "server", x: 720, y: 190, tone: "infra" },
  ],
  links: [["laptop", "wifi"], ["wifi", "gw"], ["gw", "lib"]],
  steps: [
    { from: "laptop", to: "gw", label: "el sıkışma (anahtar değişimi)", tone: "secure", note: "İstemci ve ağ geçidi kimlik doğrular ve ortak oturum anahtarı üretir (ör. WireGuard / IPsec IKEv2)." },
    { from: "laptop", to: "wifi", label: "ŞİFRELİ paket", tone: "secure", note: "İç paket (hedef: kütüphane sistemi) tamamen şifrelenir ve yeni bir dış paket içine konur." },
    { from: "wifi", to: "eve", label: "yalnızca anlamsız bayt", tone: "attack", note: "Aynı ağdaki dinleyici yalnızca ağ geçidine giden şifreli trafiği görür; içeriği ve iç hedefi göremez." },
    { from: "wifi", to: "gw", label: "ŞİFRELİ paket", tone: "secure", note: "Ağ geçidi dış paketi açar, bütünlüğü doğrular ve iç paketi çıkarır." },
    { from: "gw", to: "lib", label: "iç paket", tone: "request", note: "İç ağda paket normal şekilde iletilir. Not: VPN kimliği/uç nokta güvenliğini sağlamaz; yalnızca taşımayı korur." },
  ],
};

export const networkTopology: AnimationDef = {
  kind: "flow",
  id: "network-topology",
  title: "Kurumsal ağ topolojisi ve bölgeler",
  summary: "İnternet, DMZ ve iç ağ; trafiğin hangi bölgeler arasında izinli olduğu.",
  zones: [
    { label: "İNTERNET (güvenilmez)", x: 10, y: 20, w: 170, h: 320, tone: "untrusted" },
    { label: "DMZ", x: 290, y: 20, w: 210, h: 140, tone: "dmz" },
    { label: "İÇ AĞ (güvenilir)", x: 290, y: 180, w: 500, h: 160, tone: "trusted" },
  ],
  actors: [
    { id: "net", label: "İnternet", icon: "cloud", x: 95, y: 180 },
    { id: "fw", label: "Güvenlik duvarı", icon: "firewall", x: 230, y: 180, tone: "infra" },
    { id: "web", label: "Web", sub: "DMZ", icon: "server", x: 350, y: 95, tone: "infra" },
    { id: "mail", label: "E-posta", sub: "DMZ", icon: "mail", x: 450, y: 95, tone: "infra" },
    { id: "sw", label: "Çekirdek switch", icon: "switch", x: 400, y: 265, tone: "infra" },
    { id: "pc", label: "Personel", icon: "laptop", x: 540, y: 265 },
    { id: "db", label: "Veritabanı", icon: "database", x: 650, y: 265, tone: "infra" },
    { id: "siem", label: "SIEM", icon: "siem", x: 740, y: 265, tone: "good" },
  ],
  links: [["net", "fw"], ["fw", "web"], ["fw", "mail"], ["fw", "sw"], ["sw", "pc"], ["sw", "db"], ["sw", "siem"]],
  steps: [
    { from: "net", to: "web", label: "HTTPS", tone: "request", note: "İnternetten yalnızca DMZ'deki herkese açık servislere (web, e-posta) erişime izin verilir." },
    { from: "net", to: "db", label: "doğrudan erişim ✕", tone: "attack", note: "İnternetten iç ağa doğrudan bağlantı reddedilir. Veritabanı asla internete açılmaz." },
    { from: "web", to: "db", label: "yalnızca 5432/tcp", tone: "secure", note: "DMZ'deki web sunucusu iç ağa yalnızca gereken porttan, gereken sunucuya erişir (en az yetki)." },
    { from: "pc", to: "net", label: "çıkış (proxy)", tone: "request", note: "Personel internete denetimli çıkış yapar; çıkış trafiği de filtrelenir." },
    { from: "sw", to: "siem", label: "loglar", tone: "info", focus: ["fw", "web", "db"], note: "Tüm bölgelerden loglar SIEM'de toplanır: ağ bölümlendirme + merkezi izleme = derinlemesine savunma." },
  ],
};
