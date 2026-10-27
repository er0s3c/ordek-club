// Atölye senaryoları (özgün, kurgusal veriler; gerçek kişi/kurum yok). Cevaplar yalnız sunucuda kalır;
// istemciye publicWorkshop() ile süzülmüş görünüm gider.
import type { FwRule, Packet, Row } from "@/lib/workshop-query";

// ── güvenli kod düzeltme ────────────────────────────────────────────────────
// Testler kod çalıştırmaz: düzeltilmiş satır(lar) adlandırılmış kurallarla denetlenir.
export type CodeTest = { name: string; group: "fix" | "keep"; require?: string[]; forbid?: string[]; hint: string };
// sandbox: öğrencinin kendi tarayıcısında (Pyodide) kodun ardından çalışan deneme betiği. Gerçek veritabanı/kabuk
// yoktur; sahte nesneler çağrıları kaydeder ve saldırı girdisinin sonucunu gösterir. Puanlamaya katılmaz.
export type SecureCode = { key: string; title: string; story: string; language: string; lines: string[]; vulnerable: number[]; tests: CodeTest[]; explanation: string; sandbox?: string };

const SQL_SANDBOX = [
  "USERS = [(1, 'ayse', 'ayse@club.test'), (2, 'mert', 'mert@club.test'), (3, 'zeynep', 'zeynep@club.test')]",
  "class FakeCursor:",
  "    def __init__(self):",
  "        self.calls = []",
  "        self.rows = []",
  "    def execute(self, sql, params=None):",
  "        self.calls.append((sql, params))",
  "        if params is None and \"' OR '1'='1\" in sql:",
  "            self.rows = list(USERS)  # girdi sorgunun yapısını değiştirdi",
  "        else:",
  "            wanted = params[0] if params else sql.split(\"name = '\")[-1].rstrip(\"'\")",
  "            self.rows = [u for u in USERS if u[1] == wanted]",
  "    def fetchone(self):",
  "        return self.rows[0] if self.rows else None",
  "class FakeConn:",
  "    def __init__(self):",
  "        self.cur = FakeCursor()",
  "    def cursor(self):",
  "        return self.cur",
  "for name in ['ayse', \"x' OR '1'='1\"]:",
  "    conn = FakeConn()",
  "    result = find_user(conn, name)",
  "    sql, params = conn.cur.calls[-1]",
  "    print('girdi       :', repr(name))",
  "    print('sorgu metni :', sql)",
  "    print('parametreler:', params)",
  "    print('dönen satır :', result, '| eşleşen satır sayısı:', len(conn.cur.rows))",
  "    print('-' * 60)",
].join("\n");

const PING_SANDBOX = [
  "import os, subprocess",
  "calls = []",
  "def fake_system(cmd):",
  "    calls.append(('os.system — KABUK yorumlar', cmd))",
  "    return 0",
  "class Done:",
  "    returncode = 0",
  "    stdout = ''",
  "def fake_run(args, *a, **k):",
  "    calls.append(('subprocess.run' + (' — shell=True, KABUK yorumlar' if k.get('shell') else ' — kabuk yok'), args))",
  "    return Done()",
  "os.system = fake_system",
  "subprocess.run = fake_run",
  "for host in ['club.local', 'club.local; ls /']:",
  "    calls.clear()",
  "    check_host(host)",
  "    print('girdi:', repr(host))",
  "    for how, what in calls:",
  "        print('  ', how, '→', what)",
  "        if 'KABUK' in how and ';' in str(what):",
  "            print('   !! ; sonrası ikinci komut olarak çalışırdı')",
  "    print('-' * 60)",
].join("\n");

export const SECURE_CODE: SecureCode[] = [
  {
    key: "sql-login", title: "Kulüp kütüphanesinde kullanıcı arama", language: "python",
    story: "Kulübün kitap ödünç sistemi kullanıcıyı ada göre arıyor. Test ortamında birinin arama kutusuna tırnak yazınca bütün kullanıcılar listelendi.",
    lines: [
      "def find_user(conn, name):",
      "    cur = conn.cursor()",
      "    cur.execute(\"SELECT id, name, email FROM users WHERE name = '\" + name + \"'\")",
      "    return cur.fetchone()",
    ],
    vulnerable: [2],
    tests: [
      { name: "Kullanıcı girdisi sorgu metnine eklenmiyor", group: "fix", forbid: ["\\+\\s*name", "name\\s*\\+", "f[\"'].*\\{name\\}", "%\\s*name", "\\.format\\("], hint: "Metin birleştirme ya da f-string kullanma; değeri ayrı parametre olarak ver." },
      { name: "Parametreli sorgu kullanılıyor", group: "fix", require: ["execute\\(\\s*[\"'][^\"']*(%s|\\?)[^\"']*[\"']\\s*,"], hint: "Yer tutucu kullan: execute(\"... WHERE name = %s\", (name,))" },
      { name: "Aynı tablo ve filtre korunuyor", group: "keep", require: ["FROM\\s+users", "WHERE\\s+name\\s*="], hint: "Sorgu hâlâ users tablosunu ada göre süzmeli." },
      { name: "Ad değeri parametre olarak gönderiliyor", group: "keep", require: ["\\(\\s*name\\s*,?\\s*\\)|\\[\\s*name\\s*\\]"], hint: "İkinci argüman name değerini taşımalı: (name,)" },
    ],
    explanation: "Parametreli sorguda veritabanı sürücüsü değeri veri olarak gönderir; tırnak ya da SQL anahtar kelimesi sorgunun yapısını değiştiremez.",
    sandbox: SQL_SANDBOX,
  },
  {
    key: "xss-greeting", title: "Etkinlik sayfasında karşılama mesajı", language: "javascript",
    story: "Etkinlik kayıt sayfası katılımcının adını ekrana yazıyor. Adını <img onerror=...> olarak giren biri diğer ziyaretçilerin tarayıcısında kod çalıştırabildi.",
    lines: [
      "function showGreeting(user) {",
      "  const box = document.getElementById(\"greeting\");",
      "  box.innerHTML = \"Hoş geldin, \" + user.name + \"!\";",
      "}",
    ],
    vulnerable: [2],
    tests: [
      { name: "HTML olarak yorumlanan atama kalktı", group: "fix", forbid: ["innerHTML", "outerHTML", "insertAdjacentHTML", "document\\.write"], hint: "innerHTML metni HTML olarak yorumlar." },
      { name: "Metin güvenli biçimde yazılıyor", group: "fix", require: ["textContent|innerText|createTextNode"], hint: "textContent metni olduğu gibi gösterir." },
      { name: "Mesaj ve ad korunuyor", group: "keep", require: ["Hoş geldin", "user\\.name"], hint: "Karşılama metni ve kullanıcının adı hâlâ görünmeli." },
    ],
    explanation: "textContent içeriği metin düğümü olarak ekler; kullanıcı verisi etiket ya da olay işleyicisi olarak yorumlanmaz.",
  },
  {
    key: "cmd-ping", title: "Ağ panelinde erişilebilirlik testi", language: "python",
    story: "Kulübün iç izleme paneli, girilen sunucuya ping atıyor. Bir test kullanıcısı adresin sonuna “; ls” ekleyince sunucudaki dosyalar listelendi.",
    lines: [
      "import os, subprocess",
      "def check_host(host):",
      "    return os.system(\"ping -c 1 \" + host)",
    ],
    vulnerable: [2],
    tests: [
      { name: "Kabuk üzerinden komut çalıştırılmıyor", group: "fix", forbid: ["os\\.system", "shell\\s*=\\s*True", "os\\.popen", "\\+\\s*host"], hint: "Kabuk, ; ve && gibi karakterleri komut ayırıcı olarak yorumlar." },
      { name: "Argüman listesi kullanılıyor", group: "fix", require: ["subprocess\\.run\\(\\s*\\["], hint: "subprocess.run([\"ping\", \"-c\", \"1\", host])" },
      { name: "Aynı komut ve hedef korunuyor", group: "keep", require: ["[\"']ping[\"']", "[\"']-c[\"']", "host"], hint: "Komut hâlâ hedefe tek ping atmalı." },
    ],
    explanation: "Argüman listesiyle çalıştırılan süreçte kabuk yoktur; host değeri tek bir argümandır ve komut ayırıcı olarak yorumlanmaz.",
    sandbox: PING_SANDBOX,
  },
];

// ── görsel ağ kurma ─────────────────────────────────────────────────────────
export type NetNode = { id: string; label: string; ip: string; zone: string; x: number; y: number };
export type NetScenario = { key: string; title: string; story: string; nodes: NetNode[]; packets: (Packet & { expect: "allow" | "deny"; why: string })[]; starter: FwRule[] };
export const NETWORK: NetScenario[] = [
  {
    key: "web-db", title: "Kulüp sitesi ve veritabanı",
    story: "Öğrenciler kulüp sitesine HTTPS ile erişmeli. Veritabanına yalnız web sunucusu bağlanabilmeli; dışarıdan gelen her şey reddedilmeli.",
    nodes: [
      { id: "student", label: "Öğrenci dizüstü", ip: "10.0.0.15", zone: "LAN", x: 60, y: 120 },
      { id: "web", label: "Web sunucusu", ip: "10.0.1.20", zone: "DMZ", x: 300, y: 60 },
      { id: "db", label: "Veritabanı", ip: "10.0.2.30", zone: "DB", x: 540, y: 120 },
      { id: "guest", label: "Misafir Wi-Fi", ip: "10.9.0.44", zone: "GUEST", x: 300, y: 200 },
    ],
    packets: [
      { from: "student", to: "web", port: 443, expect: "allow", why: "Öğrenciler siteye HTTPS ile erişir." },
      { from: "web", to: "db", port: 5432, expect: "allow", why: "Uygulama veritabanına bağlanır." },
      { from: "student", to: "db", port: 5432, expect: "deny", why: "Kullanıcılar veritabanına doğrudan bağlanmamalı." },
      { from: "guest", to: "web", port: 22, expect: "deny", why: "Yönetim erişimi misafir ağına kapalı." },
      { from: "student", to: "web", port: 80, expect: "deny", why: "Şifresiz HTTP kapalı tutulur." },
    ],
    starter: [{ from: "any", to: "any", port: "any", action: "allow" }],
  },
  {
    key: "admin-ssh", title: "Yönetim erişimini daraltma",
    story: "Sunuculara SSH yalnız yönetici bilgisayarından açılmalı. Web sunucusu herkese 443'ten hizmet vermeye devam etmeli.",
    nodes: [
      { id: "admin", label: "Yönetici PC", ip: "10.0.0.5", zone: "LAN", x: 60, y: 60 },
      { id: "student", label: "Öğrenci PC", ip: "10.0.0.40", zone: "LAN", x: 60, y: 190 },
      { id: "web", label: "Web sunucusu", ip: "10.0.1.20", zone: "DMZ", x: 330, y: 120 },
      { id: "files", label: "Dosya sunucusu", ip: "10.0.1.30", zone: "DMZ", x: 560, y: 120 },
    ],
    packets: [
      { from: "admin", to: "web", port: 22, expect: "allow", why: "Yönetici sunucuyu yönetebilmeli." },
      { from: "admin", to: "files", port: 22, expect: "allow", why: "Yönetici dosya sunucusunu da yönetir." },
      { from: "student", to: "web", port: 22, expect: "deny", why: "Öğrenci PC'den SSH kapalı." },
      { from: "student", to: "web", port: 443, expect: "allow", why: "Site herkese açık kalır." },
      { from: "student", to: "files", port: 445, expect: "deny", why: "Dosya paylaşımı dışarıya açık değil." },
    ],
    starter: [],
  },
];

// ── sorgu geliştirme ────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
function authLogs(): Row[] {
  const rows: Row[] = [];
  const users = ["ayse", "mert", "zeynep", "can", "elif", "deniz"];
  for (let i = 0; i < 60; i++) {
    const user = users[i % users.length]!;
    rows.push({ time: `2026-10-0${1 + (i % 7)}T0${8 + (i % 2)}:${pad(i % 60)}:00Z`, user, src_ip: `10.0.0.${20 + (i % users.length)}`, action: "login", status: i % 9 === 0 ? "FAIL" : "OK", country: "TR" });
  }
  for (let i = 0; i < 38; i++) rows.push({ time: `2026-10-05T03:${pad(i)}:10Z`, user: ["admin", "root", "mert", "test"][i % 4]!, src_ip: "203.0.113.77", action: "login", status: i === 37 ? "OK" : "FAIL", country: "NL" });
  for (let i = 0; i < 7; i++) rows.push({ time: `2026-10-06T22:1${i}:00Z`, user: "elif", src_ip: "198.51.100.9", action: "login", status: "FAIL", country: "US" });
  rows.push({ time: "2026-10-05T03:40:02Z", user: "test", src_ip: "203.0.113.77", action: "download", status: "OK", country: "NL" });
  return rows.sort((a, b) => String(a.time).localeCompare(String(b.time)));
}
export type QueryScenario = { key: string; title: string; story: string; question: string; rows: Row[]; answer: string; example: string };
export const QUERY: QueryScenario[] = [
  { key: "brute-ip", title: "En çok başarısız giriş", story: "SOC panosunda gece saatlerinde giriş alarmları yükseldi.", question: "En fazla başarısız giriş denemesi yapan kaynak IP adresi hangisi?", rows: authLogs(), answer: "203.0.113.77", example: "where status=FAIL | count by src_ip" },
  { key: "compromised-user", title: "Ele geçirilen hesap", story: "Aynı IP'den çok sayıda başarısız denemenin ardından bir başarılı giriş görüldü.", question: "Saldırgan IP'sinden başarılı giriş yapılan kullanıcı adı nedir?", rows: authLogs(), answer: "test", example: "where src_ip=203.0.113.77 and status=OK" },
];

// ── olay zaman çizelgesi ────────────────────────────────────────────────────
export type TimelineCard = { id: string; source: string; time: string; text: string };
export type TimelineScenario = { key: string; title: string; story: string; cards: TimelineCard[]; order: string[]; explanation: string };
export const TIMELINE: TimelineScenario[] = [
  {
    key: "phish-chain", title: "Sahte burs e-postası", story: "Bir öğrencinin hesabından kulüp listesine şüpheli dosya gönderildi. Kanıtlar farklı sistemlerden geldi; bazı saatler UTC, bazıları Türkiye saatiyle (UTC+3).",
    cards: [
      { id: "c1", source: "E-posta ağ geçidi (UTC)", time: "2026-10-12 06:58", text: "“Burs sonucu” konulu e-posta öğrenciye teslim edildi." },
      { id: "c2", source: "Tarayıcı geçmişi (UTC+3)", time: "2026-10-12 10:04", text: "burs-sonuc.example sayfası açıldı, form gönderildi." },
      { id: "c3", source: "Kimlik sağlayıcı (UTC)", time: "2026-10-12 07:31", text: "Hesaba yurt dışından başarılı giriş." },
      { id: "c4", source: "Posta sunucusu (UTC+3)", time: "2026-10-12 10:40", text: "Hesaptan kulüp listesine ekli dosya gönderildi." },
      { id: "c5", source: "Yardım masası (UTC+3)", time: "2026-10-12 11:15", text: "Üye, şüpheli dosyayı bildirdi; parola sıfırlandı." },
    ],
    order: ["c1", "c2", "c3", "c4", "c5"],
    explanation: "Önce saatler tek zamana çevrilir (UTC+3 → UTC: 10:04 → 07:04). Sıra: e-posta teslimi → sahte forma parola girişi → yurt dışından giriş → listeye dosya gönderimi → bildirim ve sıfırlama.",
  },
  {
    key: "usb-lab", title: "Laboratuvardaki USB bellek", story: "Kulüp laboratuvarındaki bir bilgisayarda gece fidye notu bulundu. Elinde Windows olay kayıtları ve kamera notları var (hepsi UTC+3).",
    cards: [
      { id: "u1", source: "Kamera notu", time: "2026-10-20 17:42", text: "Ziyaretçi masaya USB bellek bırakıyor." },
      { id: "u2", source: "Windows olay günlüğü", time: "2026-10-20 18:05", text: "Yeni USB depolama aygıtı takıldı (öğrenci hesabı)." },
      { id: "u3", source: "Windows olay günlüğü", time: "2026-10-20 18:06", text: "invoice.pdf.exe çalıştırıldı." },
      { id: "u4", source: "Windows olay günlüğü", time: "2026-10-20 18:09", text: "Zamanlanmış görev oluşturuldu: gece 02:00." },
      { id: "u5", source: "Dosya sistemi", time: "2026-10-21 02:00", text: "Belgeler klasöründe toplu yeniden adlandırma, fidye notu." },
    ],
    order: ["u1", "u2", "u3", "u4", "u5"],
    explanation: "Fiziksel erişim (USB) → aygıtın takılması → çift uzantılı dosyanın çalıştırılması → kalıcılık için zamanlanmış görev → gecikmeli şifreleme.",
  },
];

// ── kanıt ilişki haritası ───────────────────────────────────────────────────
export type MapNode = { id: string; kind: "ip" | "user" | "file" | "event"; label: string; detail: string };
export type MapScenario = { key: string; title: string; story: string; nodes: MapNode[]; required: [string, string][] };
export const EVIDENCE_MAP: MapScenario[] = [
  {
    key: "lab-intrusion", title: "Lab sunucusuna izinsiz giriş", story: "Kanıtları birbirine bağla: kim, nereden, hangi dosyayla, ne yaptı? Her bağlantıya bir cümlelik gerekçe yaz.",
    nodes: [
      { id: "ip1", kind: "ip", label: "203.0.113.77", detail: "SSH loglarında 38 başarısız deneme" },
      { id: "u1", kind: "user", label: "test", detail: "Unutulmuş deneme hesabı, zayıf parola" },
      { id: "e1", kind: "event", label: "Başarılı SSH girişi", detail: "05.10 03:37 UTC" },
      { id: "f1", kind: "file", label: "backup.tar.gz", detail: "/srv/lab altında, 03:40'ta indirildi" },
      { id: "e2", kind: "event", label: "Dosya indirme", detail: "sftp oturumu, 41 MB" },
      { id: "ip2", kind: "ip", label: "10.0.0.24", detail: "Kulüp içi, normal giriş trafiği" },
    ],
    required: [["ip1", "e1"], ["u1", "e1"], ["e1", "e2"], ["e2", "f1"]],
  },
];
