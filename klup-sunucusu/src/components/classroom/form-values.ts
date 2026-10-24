// Sunucu ve istemci bileşenlerinin ortak kullandığı form dönüşümleri ("use client" modülünden
// sunucuda fonksiyon çağrılamadığı için ayrı modülde).

// Yerel saat ↔ ISO: datetime-local girdisi saat dilimi taşımaz, tarayıcının yerel saatiyle yorumlanır.
export const toLocalInput = (d: string | Date | null | undefined) => {
  if (!d) return "";
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export type GroupValues = {
  kind: "CLASS" | "EVENT";
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  selfJoin: boolean;
  capacity: string;
};

export const groupValues = (g: { kind: "CLASS" | "EVENT"; name: string; description: string; startsAt: Date | string | null; endsAt: Date | string | null; location: string; selfJoin: boolean; capacity: number | null }): GroupValues => ({
  kind: g.kind,
  name: g.name,
  description: g.description,
  startsAt: toLocalInput(g.startsAt),
  endsAt: toLocalInput(g.endsAt),
  location: g.location,
  selfJoin: g.selfJoin,
  capacity: g.capacity === null ? "" : String(g.capacity),
});

export type TaskValues = {
  title: string;
  description: string;
  kind: string;
  difficulty: string;
  audience: "ALL" | "SELECTED" | "GROUP";
  targetUsernames: string;
  groupId: string;
  startsAt: string; // datetime-local
  dueAt: string;
  allowLate: boolean;
  allowResubmit: boolean;
  requireText: boolean;
  requireFile: boolean;
  maxScore: number;
  rubric: { criterion: string; points: number }[];
  xpRuleKey: string;
  xpAmount: string; // boş → kural varsayılanı
  teamMode: boolean;
  teams: string; // "Takım: kullanıcı1, kullanıcı2" satırları
  quiz: unknown[];
  passPercent: number;
  maxAttempts: string;
};

export const EMPTY_TASK: TaskValues = {
  title: "", description: "", kind: "TEXT", difficulty: "MEDIUM", audience: "ALL", targetUsernames: "", groupId: "", startsAt: "", dueAt: "",
  allowLate: false, allowResubmit: true, requireText: true, requireFile: false, maxScore: 100, rubric: [], xpRuleKey: "task.approved", xpAmount: "",
  teamMode: false, teams: "", quiz: [], passPercent: 60, maxAttempts: "",
};
