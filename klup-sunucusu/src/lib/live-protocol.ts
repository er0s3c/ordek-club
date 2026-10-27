// Canlı sınıf WebSocket protokolü — istemci ve sunucu ortak tipleri ve doğrulama.
import { z } from "zod";

export const SPEEDS = [0.5, 1, 1.5, 2] as const;

// Sunucuda tutulan, tüm katılımcılara yayınlanan senkron durum.
export type LiveState = {
  slide: number; // 0 tabanlı slayt indeksi
  step: number; // slayt içindeki adım (animasyon aşaması / açılan madde)
  paused: boolean; // eğitmen dersi duraklattı → öğrenci ekranında mola perdesi
  autoplay: boolean; // adımlar sunucu zamanlayıcısıyla otomatik ilerler
  speed: (typeof SPEEDS)[number];
  freeNav: boolean; // öğrenciler kendi başına gezinebilir (bireysel inceleme)
  stepAt: number; // son adım değişikliğinin sunucu zamanı (ms) — animasyon senkronu için
  // VMware uygulama molaları: slayt indeksi → bağlı görev ve teslim süresi (eğitmen o slayta geçince oluşur)
  practicals: Record<string, { assignmentId: string; dueAt: number }>;
};

export const initialLiveState = (): LiveState => ({
  slide: 0, step: 0, paused: false, autoplay: false, speed: 1, freeNav: false, stepAt: Date.now(), practicals: {},
});

const control = z.discriminatedUnion("action", [
  z.object({ action: z.literal("next") }),
  z.object({ action: z.literal("prev") }),
  z.object({ action: z.literal("goto"), slide: z.number().int().min(0).max(500), step: z.number().int().min(0).max(100).default(0) }),
  z.object({ action: z.literal("pause"), value: z.boolean() }),
  z.object({ action: z.literal("autoplay"), value: z.boolean() }),
  z.object({ action: z.literal("speed"), value: z.union([z.literal(0.5), z.literal(1), z.literal(1.5), z.literal(2)]) }),
  z.object({ action: z.literal("freeNav"), value: z.boolean() }),
]);
export type ControlAction = z.infer<typeof control>;

const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, " ").trim())
    .pipe(z.string().min(1).max(max));

export const clientMessageSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("hello"), lastVersion: z.number().int().min(-1).default(-1) }),
  z.object({ t: z.literal("ping") }),
  z.object({ t: z.literal("control"), c: control }),
  z.object({ t: z.literal("hand"), raised: z.boolean() }),
  z.object({ t: z.literal("question"), text: clean(500) }),
  z.object({ t: z.literal("announce"), text: clean(300) }),
  z.object({ t: z.literal("resolve"), id: z.string().min(1).max(40) }),
  z.object({ t: z.literal("lowerHand"), userId: z.string().min(1).max(40) }),
  // Canlı quiz / anket (açma, kapatma, sonucu açıklama yalnız eğitmende; cevap öğrencide)
  z.object({
    t: z.literal("poll.open"),
    purpose: z.enum(["LIVE", "EXIT"]).optional(),
    kind: z.enum(["QUIZ", "POLL"]),
    question: clean(300),
    options: z.array(clean(120)).min(2).max(6),
    correctIndex: z.number().int().min(0).max(5).optional(),
    anonymous: z.boolean().default(false),
    timeLimitSec: z.number().int().min(10).max(600).default(60),
  }),
  z.object({ t: z.literal("poll.close") }),
  z.object({ t: z.literal("poll.reveal") }),
  z.object({ t: z.literal("poll.answer"), pollId: z.string().min(1).max(40), choice: z.number().int().min(0).max(5) }),
  // Yardım kuyruğu: öğrenci sıraya girer (isteğe bağlı not + takıldığı görev); eğitmen çözüldü olarak işaretler.
  z.object({ t: z.literal("help"), note: z.string().max(200).transform((s) => s.trim()).default(""), taskRef: z.string().max(80).transform((s) => s.trim()).default("") }),
  z.object({ t: z.literal("help.cancel") }),
  z.object({ t: z.literal("help.resolve"), id: z.string().min(1).max(40) }),
  // Anlama göstergesi: anonim; slayt değişince sıfırlanır.
  z.object({ t: z.literal("pulse"), value: z.enum(["ok", "slow", "repeat"]).nullable() }),
  // Söz sırası: el kaldıranlar sırayla; eğitmen sıradakine söz verir.
  z.object({ t: z.literal("speaker.next") }),
]);
export type ClientMessage = z.infer<typeof clientMessageSchema>;

export type ParticipantView = {
  userId: string;
  displayName: string;
  username: string;
  role: string;
  online: boolean;
  handRaised: boolean;
  handAt: number | null; // söz sırası: el kaldırma zamanı
  connectedMs: number;
};
export type HelpView = { id: string; userId: string; displayName: string; note: string; taskRef: string; at: number };
export type PulseStats = { ok: number; slow: number; repeat: number; online: number };
// Öğrenciye giden quiz görünümü: doğru cevap ve dağılım yalnız sonuç açıklanınca eklenir.
export type PollView = {
  purpose?: "LIVE" | "EXIT";
  id: string;
  kind: "QUIZ" | "POLL";
  question: string;
  options: string[];
  anonymous: boolean;
  timeLimitSec: number;
  status: "OPEN" | "CLOSED" | "REVEALED";
  closesAt: number;
  total: number;
  mine: number | null;
  results: number[] | null;
  correctIndex: number | null;
};
export type PollStats = { pollId: string; counts: number[]; total: number; answers: { displayName: string; choice: number }[] | null };
export type QuestionView = { id: string; userId: string | null; displayName: string; text: string; at: number; resolved: boolean };

export type ServerMessage =
  | { t: "welcome"; you: { userId: string; isHost: boolean }; session: { id: string; code: string; title: string; slideCount: number }; serverNow: number }
  | { t: "state"; v: number; state: LiveState; serverTime: number }
  | { t: "presence"; online: number; participants?: ParticipantView[] } // tam liste yalnızca eğitmene
  | { t: "questions"; items: QuestionView[] } // yalnızca eğitmene
  | { t: "announcement"; text: string; at: number }
  | { t: "you"; handRaised: boolean }
  | { t: "ack"; what: "question" | "hand" | "poll" }
  | { t: "poll"; poll: PollView | null }
  | { t: "poll.stats"; stats: PollStats } // yalnızca eğitmene
  | { t: "operation.changed"; revision: number }
  | { t: "help.queue"; items: HelpView[] } // yalnızca eğitmene
  | { t: "help.you"; pending: boolean; position: number | null }
  | { t: "pulse.stats"; stats: PulseStats } // yalnızca eğitmene
  | { t: "pulse.you"; value: "ok" | "slow" | "repeat" | null }
  | { t: "turn"; at: number } // söz sende
  | { t: "ended" }
  | { t: "error"; code: string; message: string }
  | { t: "pong"; serverTime: number };

export const WS_PATH = "/ws/live";
export const WS_CLOSE = { ENDED: 4000, UNAUTHORIZED: 4401, FORBIDDEN: 4403, NOT_FOUND: 4404, RATE: 4429, REPLACED: 4409 } as const;
