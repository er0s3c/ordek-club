import type { AnimationDef } from "./types";

export const tlsHandshake: AnimationDef = {
  kind: "flow",
  id: "tls-handshake",
  title: "Şifreleme ve anahtar değişimi (TLS 1.3)",
  summary: "Tarayıcı ile sunucu, dinleyenlerin çözemeyeceği ortak bir anahtarda nasıl anlaşır?",
  actors: [
    { id: "client", label: "Tarayıcı", icon: "browser", x: 130, y: 180 },
    { id: "eve", label: "Dinleyici", sub: "pasif", icon: "attacker", x: 400, y: 320, tone: "bad" },
    { id: "server", label: "Sunucu", sub: "sertifikalı", icon: "server", x: 670, y: 180, tone: "infra" },
  ],
  steps: [
    { from: "client", to: "server", label: "ClientHello + key_share (ECDHE)", tone: "request", note: "İstemci desteklediği şifre takımlarını ve geçici (ephemeral) bir Diffie-Hellman açık anahtarını gönderir." },
    { from: "server", to: "client", label: "ServerHello + key_share", tone: "reply", note: "Sunucu kendi geçici açık anahtarını gönderir. İki taraf artık aynı ortak sırrı hesaplayabilir; dinleyici hesaplayamaz." },
    { from: "server", to: "client", label: "Sertifika + İmza", tone: "secure", note: "Sunucu sertifikasını ve el sıkışmanın imzasını gönderir. Tarayıcı zinciri güvenilir bir CA'ya kadar doğrular (alan adı eşleşmeli)." },
    { from: "client", to: "server", label: "Finished", tone: "secure", note: "İki taraf el sıkışmanın değiştirilmediğini doğrular. Geçici anahtarlar sayesinde ileriye dönük gizlilik (forward secrecy) sağlanır." },
    { from: "client", to: "server", label: "🔒 şifreli HTTP", tone: "secure", note: "Uygulama verisi AEAD (ör. AES-GCM) ile şifrelenir ve bütünlüğü korunur." },
    { from: "server", to: "eve", label: "yalnızca şifreli bayt", tone: "attack", note: "Dinleyici trafiği görür ama içeriği okuyamaz ve değiştiremez. Görebildiği: hedef IP, zamanlama, boyut." },
  ],
};

export const authentication: AnimationDef = {
  kind: "flow",
  id: "authentication",
  title: "Kimlik doğrulama ve oturum",
  summary: "Parola + ikinci faktör, ardından güvenli oturum çerezi.",
  actors: [
    { id: "user", label: "Kullanıcı", icon: "user", x: 80, y: 180 },
    { id: "browser", label: "Tarayıcı", icon: "browser", x: 250, y: 180 },
    { id: "app", label: "Uygulama", icon: "server", x: 500, y: 180, tone: "infra" },
    { id: "db", label: "Kullanıcı DB", sub: "parola hash'leri", icon: "database", x: 710, y: 100, tone: "infra" },
    { id: "otp", label: "Doğrulayıcı", sub: "TOTP uygulaması", icon: "key", x: 710, y: 280, tone: "good" },
  ],
  steps: [
    { from: "user", to: "browser", label: "kullanıcı adı + parola", tone: "request", note: "Form yalnızca HTTPS üzerinden gönderilir." },
    { from: "browser", to: "app", label: "POST /login", tone: "request", note: "Sunucu deneme sayısını sınırlar (kaba kuvvete karşı) ve hata mesajında hangi alanın yanlış olduğunu söylemez." },
    { from: "app", to: "db", label: "hash'i getir", tone: "request", note: "Parolalar düz metin değil, tuzlu ve yavaş bir KDF (scrypt/Argon2/bcrypt) ile saklanır." },
    { from: "db", to: "app", label: "scrypt$…", tone: "reply", note: "Sunucu girilen parolayı aynı tuzla hash'ler ve sabit zamanlı karşılaştırır." },
    { from: "otp", to: "app", label: "6 haneli kod", tone: "secure", note: "İkinci faktör: parola çalınsa bile saldırgan giriş yapamaz." },
    { from: "app", to: "browser", label: "Set-Cookie: HttpOnly; Secure; SameSite", tone: "secure", note: "Rastgele, tahmin edilemez oturum kimliği. HttpOnly → JavaScript okuyamaz; SameSite → CSRF'e karşı koruma." },
  ],
};

export const sqlInjection: AnimationDef = {
  kind: "code",
  id: "sql-injection",
  title: "SQL Injection mantığı",
  summary: "Kullanıcı girdisi sorgu metnine eklenirse, veri koda dönüşür.",
  panels: [
    {
      label: "Güvensiz: metin birleştirme",
      tone: "bad",
      lines: [
        "const user = req.body.username;",
        "const sql = \"SELECT * FROM users \" +",
        "  \"WHERE name = '\" + user + \"'\";",
        "db.query(sql);",
      ],
    },
    {
      label: "Güvenli: parametreli sorgu",
      tone: "good",
      lines: [
        "const user = req.body.username;",
        "db.query(",
        "  \"SELECT * FROM users WHERE name = $1\",",
        "  [user]",
        ");",
      ],
    },
  ],
  steps: [
    { note: "Saldırgan kullanıcı adı alanına şunu yazar:  ' OR '1'='1", highlight: [{ panel: 0, lines: [0] }, { panel: 1, lines: [0] }] },
    { note: "Güvensiz kodda girdi doğrudan SQL metnine yapıştırılır.", highlight: [{ panel: 0, lines: [1, 2] }], output: { panel: 0, text: "SELECT * FROM users WHERE name = '' OR '1'='1'", tone: "bad" } },
    { note: "'1'='1' her zaman doğru → koşul tüm satırlar için geçerli olur. Veritabanı, girdinin bir kısmını KOD olarak çalıştırdı.", highlight: [{ panel: 0, lines: [3] }], output: { panel: 0, text: "→ tüm kullanıcılar döndü (kimlik doğrulama atlandı)", tone: "bad" } },
    { note: "Parametreli sorguda sorgu yapısı önceden sabittir; $1 yalnızca bir DEĞER yer tutucusudur.", highlight: [{ panel: 1, lines: [2] }] },
    { note: "Girdi ayrı gönderilir ve her zaman veri olarak işlenir. Aynı saldırı metni sadece garip bir kullanıcı adıdır.", highlight: [{ panel: 1, lines: [3] }], output: { panel: 1, text: "→ 0 satır (öyle bir kullanıcı yok)", tone: "good" } },
  ],
};

export const xssFlow: AnimationDef = {
  kind: "flow",
  id: "xss",
  title: "XSS (Stored) çalışma prensibi",
  summary: "Kaçışlanmamış kullanıcı içeriği başka kullanıcının tarayıcısında betik olarak çalışır.",
  actors: [
    { id: "attacker", label: "Saldırgan", icon: "attacker", x: 90, y: 90, tone: "bad" },
    { id: "app", label: "Forum uygulaması", icon: "server", x: 400, y: 90, tone: "infra" },
    { id: "db", label: "Veritabanı", icon: "database", x: 700, y: 90, tone: "infra" },
    { id: "victim", label: "Kurban", sub: "tarayıcı", icon: "browser", x: 400, y: 290 },
    { id: "collector", label: "Saldırgan sunucusu", icon: "cloud", x: 90, y: 290, tone: "bad" },
  ],
  steps: [
    { from: "attacker", to: "app", label: "yorum: <script>…</script>", tone: "attack", note: "Saldırgan yorum alanına betik içeren bir metin gönderir." },
    { from: "app", to: "db", label: "olduğu gibi kaydet", tone: "request", note: "Uygulama içeriği saklar. (Saklamak sorun değil; sorun çıktıda.)" },
    { from: "victim", to: "app", label: "GET /konu/42", tone: "request", note: "Başka bir kullanıcı sayfayı açar." },
    { from: "app", to: "victim", label: "HTML + kaçışlanmamış yorum", tone: "attack", note: "Yorum HTML'e kaçışlanmadan eklendiği için tarayıcı onu metin değil KOD olarak yorumlar." },
    { from: "victim", to: "collector", label: "oturum verisi / işlem", tone: "attack", note: "Betik kurbanın oturumuyla istek atabilir, sayfayı değiştirebilir, veri sızdırabilir." },
    { from: "app", to: "victim", label: "&lt;script&gt; + CSP", tone: "secure", note: "Savunma: çıktıda bağlama uygun kaçışlama (React varsayılan olarak yapar), HttpOnly çerez ve nonce'lu Content-Security-Policy." },
  ],
};

export const phishing: AnimationDef = {
  kind: "flow",
  id: "phishing",
  title: "Phishing saldırısının yaşam döngüsü",
  summary: "Keşiften kimlik bilgisi kullanımına ve tespite kadar.",
  actors: [
    { id: "attacker", label: "Saldırgan", icon: "attacker", x: 90, y: 90, tone: "bad" },
    { id: "mail", label: "E-posta ağ geçidi", sub: "SPF/DKIM/DMARC", icon: "mail", x: 400, y: 90, tone: "infra" },
    { id: "victim", label: "Öğrenci", icon: "user", x: 700, y: 90 },
    { id: "fake", label: "Sahte giriş sayfası", sub: "obs-ornek.edu.co", icon: "browser", x: 400, y: 290, tone: "bad" },
    { id: "real", label: "Gerçek OBS", icon: "server", x: 700, y: 290, tone: "infra" },
    { id: "soc", label: "SOC", icon: "analyst", x: 90, y: 290, tone: "good" },
  ],
  steps: [
    { from: "attacker", to: "attacker", label: "keşif", tone: "attack", note: "Saldırgan hedefi araştırır: e-posta biçimi, kullanılan sistemler, güncel duyurular (OSINT)." },
    { from: "attacker", to: "mail", label: "\"Ders kaydınız iptal edilecek!\"", tone: "attack", note: "Aciliyet ve korku içeren, gerçeğe benzer bir e-posta gönderilir. Gönderen alan adı taklit edilir." },
    { from: "mail", to: "victim", label: "gelen kutusu", tone: "request", note: "SPF/DKIM/DMARC kontrollerinden geçebilen benzer bir alan adı kullanıldığı için e-posta teslim edilir." },
    { from: "victim", to: "fake", label: "bağlantıya tıklar + parolayı girer", tone: "attack", note: "Uyarı işaretleri: alan adı, beklenmeyen istek, aciliyet. Parola yöneticisi sahte sitede otomatik doldurmaz." },
    { from: "fake", to: "attacker", label: "kimlik bilgileri", tone: "attack", note: "Saldırgan bilgileri toplar." },
    { from: "attacker", to: "real", label: "giriş denemesi", tone: "attack", note: "MFA varsa yalnızca parola yetmez. Olağandışı konum/cihaz uyarı üretir." },
    { from: "victim", to: "soc", label: "\"Bu e-posta şüpheli\" bildirimi", tone: "secure", note: "Hızlı bildirim: SOC aynı e-postayı tüm kutulardan kaldırır, alan adını engeller, parolayı sıfırlatır." },
  ],
};

export const mitm: AnimationDef = {
  kind: "flow",
  id: "mitm",
  title: "Ortadaki adam (MITM) — kavramsal",
  summary: "Saldırgan iki taraf arasına girer; şifreleme ve sertifika doğrulaması bunu nasıl boşa çıkarır?",
  actors: [
    { id: "victim", label: "Kurban", icon: "laptop", x: 110, y: 120 },
    { id: "attacker", label: "Saldırgan", sub: "aynı yerel ağ", icon: "attacker", x: 400, y: 300, tone: "bad" },
    { id: "gw", label: "Ağ geçidi", icon: "router", x: 400, y: 120, tone: "infra" },
    { id: "site", label: "Banka sitesi", icon: "server", x: 690, y: 120, tone: "infra" },
  ],
  links: [["victim", "gw"], ["gw", "site"]],
  steps: [
    { from: "victim", to: "gw", label: "normal trafik", tone: "request", note: "Normalde trafik doğrudan ağ geçidine gider." },
    { from: "attacker", to: "victim", label: "\"ağ geçidi benim\" (sahte ARP)", tone: "attack", note: "Saldırgan yerel ağda sahte adres çözümleme yanıtları yayarak trafiğin kendisine gelmesini sağlar." },
    { from: "victim", to: "attacker", label: "trafik saldırgana akar", tone: "attack", note: "Şifresiz (HTTP) trafikse saldırgan okuyabilir ve değiştirebilir." },
    { from: "attacker", to: "victim", label: "sahte sertifika", tone: "attack", note: "HTTPS'i çözmek için sahte sertifika sunmak zorunda kalır." },
    { from: "victim", to: "victim", label: "⚠ sertifika hatası / HSTS", tone: "secure", note: "Tarayıcı sertifikayı güvenilir bir CA'ya bağlayamaz ve bağlantıyı keser. HSTS, HTTP'ye düşürmeyi engeller." },
    { from: "victim", to: "site", label: "🔒 uçtan uca TLS", tone: "secure", note: "Savunmalar: her yerde HTTPS + HSTS, sertifika uyarılarını asla geçmemek, switch'te Dynamic ARP Inspection." },
  ],
};
