// Hazır sunum şablonları. "Şablondan oluştur" ile eğitmenin kendi kopyası olarak veritabanına yazılır.
import type { z } from "zod";
import type { deckSchema } from "@/lib/deck-schema";

type DeckIn = z.input<typeof deckSchema>;

const httpSecurity101: DeckIn = {
  title: "HTTP Security 101",
  description: "HTTP'nin temelleri, oturumlar, TLS ve en yaygın web zafiyetlerine giriş.",
  slides: [
    {
      title: "HTTP Security 101",
      layout: "title",
      blocks: [{ type: "text", text: "Web uygulamaları nasıl konuşur ve nerede kırılır?" }],
      notes: "Kendini tanıt. Katılımcılara: 'Bugün bir web sayfasını açtığınızda arka planda neler olduğunu adım adım göreceğiz.'",
    },
    {
      title: "Bugünün planı",
      blocks: [
        { type: "bullets", reveal: true, items: ["HTTP istek / yanıt döngüsü", "Oturumlar ve kimlik doğrulama", "TLS: trafiği şifrelemek", "SQL Injection ve XSS", "Uygulama molası"] },
      ],
      notes: "Her maddeyi tek tek aç. Süre: ~2 dk.",
    },
    {
      title: "Bir sayfa açtığınızda",
      blocks: [{ type: "animation", animation: "http-request" }],
      notes: "Her adımda durup soru sor: 'Sizce sunucu kim olduğunuzu nasıl biliyor?' (Cookie).",
    },
    {
      title: "HTTP isteğinin anatomisi",
      blocks: [
        {
          type: "code",
          language: "http",
          code: "GET /profil HTTP/1.1\nHost: club.ornek.edu.tr\nCookie: club_session=Vx8…\nUser-Agent: Mozilla/5.0\nAccept: text/html",
          highlightSteps: [[1], [2], [3]],
        },
        { type: "callout", tone: "info", text: "HTTP durumsuzdur: sunucu sizi her istekte çerezle yeniden tanır." },
      ],
      notes: "Satır satır: yöntem+yol, Host, Cookie.",
    },
    {
      title: "Kimlik doğrulama",
      blocks: [{ type: "animation", animation: "authentication" }],
      notes: "Neden HttpOnly? Neden SameSite? XSS konusuna köprü kur.",
    },
    {
      title: "TLS: trafiği korumak",
      blocks: [{ type: "animation", animation: "tls-handshake" }],
      notes: "Forward secrecy kavramını vurgula.",
    },
    {
      title: "SQL Injection",
      blocks: [{ type: "animation", animation: "sql-injection" }],
      notes: "Önce güvensiz paneli göster, sonra parametreli sorgu. 'Filtreleme değil, ayırma' mesajı.",
    },
    {
      title: "XSS",
      blocks: [{ type: "animation", animation: "xss" }],
      notes: "React'in varsayılan kaçışlamasını ve dangerouslySetInnerHTML'in neden tehlikeli olduğunu anlat.",
    },
    {
      title: "Uygulama: tarayıcı geliştirici araçları",
      blocks: [
        { type: "text", text: "Tarayıcınızda F12 → Network sekmesini açın ve bu sayfayı yenileyin." },
        {
          type: "terminal",
          reveal: true,
          lines: [
            { cmd: "curl -I https://example.com", out: "HTTP/2 200\ncontent-type: text/html; charset=UTF-8" },
            { cmd: "curl -s -o /dev/null -w '%{http_code}' https://example.com/yok", out: "404" },
          ],
        },
        { type: "callout", tone: "warn", text: "Yalnızca kendi sistemlerinizde veya açık izniniz olan hedeflerde deneyin." },
      ],
      notes: "5 dakika ver. Kimin Set-Cookie başlığını bulduğunu sor.",
    },
    {
      title: "Özet",
      blocks: [
        { type: "bullets", reveal: true, items: ["Girdi veridir, kod değildir: parametreli sorgu", "Çıktıyı bağlama göre kaçışla + CSP", "Oturum çerezi: HttpOnly, Secure, SameSite", "Her yerde HTTPS"] },
      ],
      notes: "Soru-cevap.",
    },
  ],
};

const networkFundamentals: DeckIn = {
  title: "Ağ Temelleri",
  description: "Paketlerin yolculuğu, DNS, TCP, güvenlik duvarları ve VPN.",
  slides: [
    { title: "Ağ Temelleri", layout: "title", blocks: [{ type: "text", text: "Bir paket A noktasından B noktasına nasıl gider?" }], notes: "" },
    { title: "Paketin yolculuğu", blocks: [{ type: "animation", animation: "packet-journey" }], notes: "Kapsülleme adımında OSI katmanlarını hatırlat." },
    { title: "DNS çözümleme", blocks: [{ type: "animation", animation: "dns-resolution" }], notes: "Önbellek ve TTL üzerine soru sor." },
    { title: "TCP üçlü el sıkışma", blocks: [{ type: "animation", animation: "tcp-handshake" }], notes: "Wireshark'ta SYN/SYN-ACK/ACK filtresi: tcp.flags.syn == 1" },
    { title: "Güvenlik duvarı", blocks: [{ type: "animation", animation: "firewall-decision" }], notes: "Varsayılan-red ilkesini tartış." },
    { title: "Kurumsal topoloji", blocks: [{ type: "animation", animation: "network-topology" }], notes: "DMZ neden var?" },
    { title: "VPN", blocks: [{ type: "animation", animation: "vpn-tunnel" }], notes: "" },
    {
      title: "Uygulama molası: üçlü el sıkışmayı yakala",
      blocks: [
        {
          type: "practical",
          title: "TCP el sıkışmasını Wireshark'ta bul",
          description: "Laboratuvar VM'inde bir HTTP isteği başlatıp trafiği yakalayın ve el sıkışmanın üç paketini işaretleyin.",
          files: ["lab-ag-temelleri.ova (eğitmenden)"],
          steps: [
            "Lab VM'ini 'temiz' snapshot'ından başlatın.",
            "Wireshark'ta eth0 arayüzünde yakalamayı başlatın.",
            "Terminalde: curl http://lab-web.local",
            "Filtre: tcp.flags.syn == 1 — SYN ve SYN-ACK paketlerini bulun.",
            "Üç paketin sıra numaralarını (seq/ack) teslim metnine yazın; ekran görüntüsü ekleyin.",
          ],
          durationMin: 15,
          host: {
            prepNotes: "Ders öncesi OVA'yı paylaşın; lab-web.local yalnız iç ağda (host-only) çözülmeli.",
            vms: ["lab-istemci (Ubuntu, 2 GB)", "lab-web (nginx, host-only)"],
            snapshot: "temiz",
            expected: "SYN (seq=x), SYN-ACK (seq=y, ack=x+1), ACK (ack=y+1). Göreli sıra numaraları açıksa x=0, y=0 görünür.",
          },
        },
      ],
      notes: "Bu slayta geçince öğrencilere teslim formu açılır; süre sayacı başlar.",
    },
    {
      title: "Komut satırında",
      blocks: [
        {
          type: "terminal",
          reveal: true,
          lines: [
            { cmd: "nslookup example.com", out: "Address: 93.184.215.14" },
            { cmd: "traceroute example.com", out: " 1  192.168.1.1  1.2 ms\n 2  10.20.0.1  8.4 ms\n …" },
            { cmd: "ss -tn state established", out: "ESTAB 0 0 10.0.0.5:51544 203.0.113.10:443" },
          ],
        },
      ],
      notes: "",
    },
  ],
};

const blueTeamIntro: DeckIn = {
  title: "Mavi Takıma Giriş",
  description: "Phishing, ortadaki adam saldırısı, güvenli kod ve SOC süreci.",
  slides: [
    { title: "Mavi Takıma Giriş", layout: "title", blocks: [{ type: "text", text: "Saldırıları anlamak, savunmayı kurmak." }], notes: "" },
    { title: "Phishing yaşam döngüsü", blocks: [{ type: "animation", animation: "phishing" }], notes: "Gerçek bir (anonimleştirilmiş) kulüp/üniversite örneği göster." },
    { title: "Ortadaki adam", blocks: [{ type: "animation", animation: "mitm" }], notes: "Kavramsal: saldırı aracı adımları değil, savunma odaklı." },
    { title: "Parola saklama", blocks: [{ type: "animation", animation: "secure-vs-insecure" }], notes: "" },
    { title: "SOC alarm süreci", blocks: [{ type: "animation", animation: "soc-alert" }], notes: "MITRE ATT&CK tekniğini göster." },
    {
      title: "Tartışma",
      blocks: [{ type: "bullets", reveal: true, items: ["Kulübümüzde hangi e-postalar şüpheli?", "Bir alarmın yanlış pozitif olduğunu nasıl anlarız?", "Kendi hesaplarımızda MFA açık mı?"] }],
      notes: "",
    },
  ],
};

export const TEMPLATES: Record<string, DeckIn> = {
  "http-security-101": httpSecurity101,
  "network-fundamentals": networkFundamentals,
  "blue-team-intro": blueTeamIntro,
};

export const TEMPLATE_LIST = Object.entries(TEMPLATES).map(([key, d]) => ({
  key,
  title: d.title,
  description: d.description ?? "",
  slideCount: d.slides.length,
}));
