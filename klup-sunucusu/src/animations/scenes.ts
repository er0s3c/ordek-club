// Motion Canvas anlatım sahneleri (kod tabanlı, kayıt defterinden kimlikle seçilir; sunum JSON'u kod taşımaz).
// Vite eklentisi olmadan: düğümler sınıflarla kurulur, MotionScene bileşeni çekirdek Player + Stage ile oynatır.
import type { ThreadGenerator } from "@motion-canvas/core";

export const SCENE_IDS = ["tls-handshake", "hash-avalanche", "phishing-chain"] as const;
export type SceneId = (typeof SCENE_IDS)[number];
export const SCENE_META: Record<SceneId, { title: string; summary: string; seconds: number }> = {
  "tls-handshake": { title: "TLS el sıkışması", summary: "İstemci ve sunucu anahtar paylaşmadan ortak bir oturum anahtarı türetir; sertifika sunucunun kimliğini doğrular.", seconds: 12 },
  "hash-avalanche": { title: "Çığ etkisi", summary: "Girdideki tek harflik değişiklik özetin neredeyse tamamını değiştirir.", seconds: 9 },
  "phishing-chain": { title: "Oltalamadan hesap ele geçirmeye", summary: "Sahte mesaj → sahte giriş sayfası → çalınan parola → yetkisiz giriş; MFA zinciri kırar.", seconds: 12 },
};

const INK = "#fffcf2", PURPLE = "#5c1fe2", LILAC = "#c9b6ff", GREEN = "#17ff74", RED = "#ff5468", DIM = "#6b6578";

// Sahne üreteçleri; 2D kütüphanesi istemcide dinamik yüklendiği için bağımlılıklar parametre olarak gelir.
type Lib = typeof import("@motion-canvas/2d") & typeof import("@motion-canvas/core");

export function buildScene(id: SceneId, L: Lib) {
  const { makeScene2D, Rect, Txt, Line, Circle, all, sequence, waitFor, easeInOutCubic, easeOutBack } = L;
  const box = (x: number, y: number, label: string, color = LILAC) => {
    const r = new Rect({ x, y, width: 300, height: 120, radius: 22, stroke: color, lineWidth: 5, fill: "#1d1730" });
    r.add(new Txt({ text: label, fill: INK, fontSize: 38, fontFamily: "Readex Pro, Arial" }));
    return r;
  };
  const caption = (text: string) => new Txt({ text, y: 400, fill: INK, fontSize: 34, fontFamily: "Readex Pro, Arial", opacity: 0 });
  function* say(c: InstanceType<Lib["Txt"]>, text: string): ThreadGenerator {
    yield* c.opacity(0, 0.2);
    c.text(text);
    yield* c.opacity(1, 0.3);
  }

  switch (id) {
    case "tls-handshake":
      return makeScene2D(function* (view) {
        view.fill("#141018");
        const client = box(-560, 0, "İstemci"), server = box(560, 0, "Sunucu", GREEN);
        const cap = caption("");
        view.add([client, server, cap]);
        client.scale(0); server.scale(0);
        yield* all(client.scale(1, 0.6, easeOutBack), server.scale(1, 0.6, easeOutBack));
        const msg = (text: string, from: number, to: number, y: number, color: string) => {
          const m = new Rect({ x: from, y, width: 260, height: 64, radius: 32, fill: color, opacity: 0 });
          m.add(new Txt({ text, fill: "#141018", fontSize: 28, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }));
          view.add(m);
          return function* (): ThreadGenerator { yield* m.opacity(1, 0.2); yield* m.x(to, 1.1, easeInOutCubic); yield* m.opacity(0.35, 0.3); };
        };
        yield* say(cap, "1) İstemci desteklediği şifre takımlarını ve rastgele bir sayı gönderir.");
        yield* msg("ClientHello", -400, 400, -170, LILAC)();
        yield* say(cap, "2) Sunucu seçimini, sertifikasını ve anahtar payını yollar.");
        yield* msg("ServerHello + sertifika", 400, -400, -60, GREEN)();
        const cert = new Rect({ x: -560, y: 190, width: 300, height: 90, radius: 14, stroke: GREEN, lineWidth: 4, opacity: 0 });
        cert.add(new Txt({ text: "✓ alan adı doğrulandı", fill: GREEN, fontSize: 26, fontFamily: "Readex Pro, Arial" }));
        view.add(cert);
        yield* say(cap, "3) İstemci sertifikayı güvenilir kök ile doğrular.");
        yield* cert.opacity(1, 0.4);
        yield* say(cap, "4) İki taraf da aynı oturum anahtarını kendisi hesaplar — anahtar hiç taşınmaz.");
        const kc = new Circle({ x: -560, y: -230, size: 0, fill: PURPLE }), ks = new Circle({ x: 560, y: -230, size: 0, fill: PURPLE });
        view.add([kc, ks]);
        yield* all(kc.size(70, 0.6, easeOutBack), ks.size(70, 0.6, easeOutBack));
        const tunnel = new Line({ points: [[-410, 0], [410, 0]], stroke: GREEN, lineWidth: 10, lineDash: [24, 16], end: 0 });
        view.add(tunnel);
        yield* say(cap, "5) Bundan sonraki her şey şifreli tünelden geçer.");
        yield* tunnel.end(1, 1);
        yield* waitFor(1.2);
      });
    case "hash-avalanche":
      return makeScene2D(function* (view) {
        view.fill("#141018");
        const cap = caption("");
        const input = (text: string, y: number) => new Txt({ text, y, x: -460, fill: INK, fontSize: 52, fontFamily: "JetBrains Mono, monospace", opacity: 0 });
        const a = input("kulup2026", -170), b = input("kulup2027", 120);
        const hexA = "9f86d081884c7d659a2feaa0c55ad015", hexB = "2c26b46b68ffc68ff99b453c1d304134";
        const cells = (hex: string, y: number, other?: string) => hex.split("").map((ch, i) => {
          const c = new Txt({ text: ch, x: 40 + i * 26, y, fill: other && other[i] !== ch ? RED : LILAC, fontSize: 40, fontFamily: "JetBrains Mono, monospace", opacity: 0 });
          return c;
        });
        const ra = cells(hexA, -170), rb = cells(hexB, 120, hexA);
        view.add([a, b, cap, ...ra, ...rb]);
        yield* say(cap, "Aynı özet fonksiyonu (SHA-256'nın ilk 32 hanesi)");
        yield* a.opacity(1, 0.4);
        yield* sequence(0.03, ...ra.map((c) => c.opacity(1, 0.2)));
        yield* say(cap, "Girdide yalnız son rakam değişiyor…");
        yield* b.opacity(1, 0.4);
        yield* sequence(0.03, ...rb.map((c) => c.opacity(1, 0.2)));
        const changed = rb.filter((_, i) => hexA[i] !== hexB[i]).length;
        yield* say(cap, `…ama ${changed}/32 hane değişti. Özetten girdiyi tahmin etmek bu yüzden işe yaramaz.`);
        yield* waitFor(2);
      });
    case "phishing-chain":
      return makeScene2D(function* (view) {
        view.fill("#141018");
        const cap = caption("");
        const steps = [box(-660, -80, "Sahte e-posta", RED), box(-220, -80, "Sahte giriş", RED), box(220, -80, "Parola çalındı", RED), box(660, -80, "Hesaba giriş", RED)];
        steps.forEach((s) => s.opacity(0));
        const arrows = [0, 1, 2].map((i) => new Line({ points: [[-500 + i * 440, -80], [-380 + i * 440, -80]], stroke: DIM, lineWidth: 6, endArrow: true, end: 0 }));
        view.add([...steps, ...arrows, cap]);
        const texts = ["Saldırgan kurumun adını taklit eden bir mesaj yollar.", "Bağlantı gerçeğine benzeyen bir giriş sayfası açar.", "Girilen parola saldırgana gider.", "Saldırgan çalınan parolayla hesaba girer."];
        for (let i = 0; i < steps.length; i++) {
          yield* say(cap, texts[i]!);
          yield* steps[i]!.opacity(1, 0.4);
          if (arrows[i]) yield* arrows[i]!.end(1, 0.5);
        }
        const mfa = new Rect({ x: 440, y: 160, width: 380, height: 110, radius: 20, fill: "#103a24", stroke: GREEN, lineWidth: 5, scale: 0 });
        mfa.add(new Txt({ text: "MFA: ikinci adım", fill: GREEN, fontSize: 36, fontFamily: "Readex Pro, Arial" }));
        view.add(mfa);
        yield* say(cap, "Çok faktörlü doğrulama son halkayı kırar: parola tek başına yetmez.");
        yield* all(mfa.scale(1, 0.6, easeOutBack), steps[3]!.stroke(GREEN, 0.6), steps[3]!.opacity(0.35, 0.6));
        yield* waitFor(1.5);
      });
  }
}
