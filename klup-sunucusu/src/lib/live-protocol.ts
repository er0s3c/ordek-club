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
};

export const initialLiveState = (): LiveState => ({
  slide: 0, step: 0, paused: false, autoplay: false, speed: 1, freeNav: false, stepAt: Date.now(),
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
]);
export type ClientMessage = z.infer<typeof clientMessageSchema>;

export type ParticipantView = {
  userId: string;
  displayName: string;
  username: string;
  role: string;
  online: boolean;
  handRaised: boolean;
  connectedMs: number;
};
export type QuestionView = { id: string; userId: string | null; displayName: string; text: string; at: number; resolved: boolean };

export type ServerMessage =
  | { t: "welcome"; you: { userId: string; isHost: boolean }; session: { id: string; code: string; title: string; slideCount: number } }
  | { t: "state"; v: number; state: LiveState; serverTime: number }
  | { t: "presence"; online: number; participants?: ParticipantView[] } // tam liste yalnızca eğitmene
  | { t: "questions"; items: QuestionView[] } // yalnızca eğitmene
  | { t: "announcement"; text: string; at: number }
  | { t: "you"; handRaised: boolean }
  | { t: "ack"; what: "question" | "hand" }
  | { t: "ended" }
  | { t: "error"; code: string; message: string }
  | { t: "pong"; serverTime: number };

export const WS_PATH = "/ws/live";
export const WS_CLOSE = { ENDED: 4000, UNAUTHORIZED: 4401, FORBIDDEN: 4403, NOT_FOUND: 4404, RATE: 4429, REPLACED: 4409 } as const;
