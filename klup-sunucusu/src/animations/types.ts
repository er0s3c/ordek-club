// Animasyon tanımları VERİDİR (kod değil): sunum JSON'u yalnızca kimlik (id) ile başvurur,
// istemci bu kayıt defterinden çizer. Böylece kullanıcı içeriği hiçbir zaman çalıştırılabilir kod taşımaz.

export type IconKey =
  | "laptop" | "server" | "database" | "globe" | "router" | "firewall" | "user" | "attacker"
  | "mail" | "shield" | "lock" | "cloud" | "siem" | "browser" | "switch" | "wifi" | "analyst" | "key";

export type ActorTone = "neutral" | "good" | "bad" | "infra";
export type StepTone = "request" | "reply" | "attack" | "secure" | "info";

export type Actor = {
  id: string;
  label: string;
  sub?: string;
  icon: IconKey;
  x: number; // 0–800 tuval koordinatı (merkez)
  y: number; // 0–360
  tone?: ActorTone;
};

export type FlowStep = {
  from: string;
  to: string; // from === to → hareket yok, yalnızca vurgu
  label: string; // ok üzerindeki kısa etiket (ör. "SYN")
  note: string; // adım açıklaması (alt bilgi çubuğu)
  tone?: StepTone;
  focus?: string[]; // ayrıca vurgulanacak aktörler
};

export type FlowAnimation = {
  kind: "flow";
  id: string;
  title: string;
  summary: string;
  actors: Actor[];
  links?: [string, string][]; // sabit bağlantılar (topoloji çizgileri)
  zones?: { label: string; x: number; y: number; w: number; h: number; tone: "trusted" | "dmz" | "untrusted" }[];
  steps: FlowStep[];
  // "sketch": bölge ve bağlantılar elle çizilmiş görünür (rough.js); varsayılan temiz çizgi.
  style?: "clean" | "sketch";
  // "auto": aktör konumları ELK ile hesaplanır (x/y yalnız başlangıç değeri olur).
  layout?: "manual" | "auto";
};

export type CodePanel = { label: string; tone: "bad" | "good" | "neutral"; lines: string[]; lang?: string };

export type CodeStep = {
  note: string;
  highlight: { panel: number; lines: number[] }[];
  output?: { panel: number; text: string; tone: "bad" | "good" | "neutral" };
};

export type CodeAnimation = {
  kind: "code";
  id: string;
  title: string;
  summary: string;
  panels: CodePanel[];
  steps: CodeStep[];
};

export type AnimationDef = FlowAnimation | CodeAnimation;

// Adım 0 = başlangıç (yalnız sahne); adım k = k'inci olay gerçekleşti.
export const animationStepCount = (a: AnimationDef) => a.steps.length + 1;
