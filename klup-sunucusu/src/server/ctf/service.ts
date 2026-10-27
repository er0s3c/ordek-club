// CTF panosu servisi: görev listesi (bayraksız), bayrak doğrulama (SHA-256, sabit zamanlı karşılaştırma),
// ipucu satın alma ve birey/takım skor tablosu. Puanlar CTFd dinamik puanlamasıyla çözen sayısından hesaplanır.
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { notFound, tooMany } from "@/server/errors";
import { hit } from "@/server/rate-limit";
import { award } from "@/server/xp/engine";
import type { Actor } from "@/server/auth/policy";
import { CATEGORY_TR, CTF, dynamicValue, type CtfChallenge } from "./data";

const byKey = (key: string) => CTF.find((c) => c.key === key);

async function solveCounts() {
  const rows = await db.ctfSolve.groupBy({ by: ["challengeKey"], _count: true });
  return new Map(rows.map((r) => [r.challengeKey, r._count]));
}

const valueOf = (c: CtfChallenge, counts: Map<string, number>) => dynamicValue(c, counts.get(c.key) ?? 0);

export async function ctfBoard(actor: Actor) {
  const [counts, mine, hints, firsts, team] = await Promise.all([
    solveCounts(),
    db.ctfSolve.findMany({ where: { userId: actor.id }, select: { challengeKey: true, createdAt: true } }),
    db.ctfHintUnlock.findMany({ where: { userId: actor.id }, select: { challengeKey: true, hint: true } }),
    db.ctfSolve.findMany({ distinct: ["challengeKey"], orderBy: { createdAt: "asc" }, select: { challengeKey: true, user: { select: { displayName: true } } } }),
    db.ctfTeamMember.findUnique({ where: { userId: actor.id }, select: { team: { select: { id: true, name: true } } } }),
  ]);
  const solved = new Set(mine.map((m) => m.challengeKey));
  const challenges = CTF.map((c) => ({
    key: c.key, title: c.title, category: c.category, categoryTr: CATEGORY_TR[c.category], difficulty: c.difficulty,
    value: valueOf(c, counts), solves: counts.get(c.key) ?? 0, description: c.description, artifact: c.artifact,
    firstBlood: firsts.find((f) => f.challengeKey === c.key)?.user.displayName ?? null,
    solved: solved.has(c.key),
    hints: c.hints.map((h, i) => ({ index: i, cost: h.cost, text: hints.some((x) => x.challengeKey === c.key && x.hint === i) ? h.text : null })),
  }));
  const board = await scoreboard(counts);
  const me = board.users.find((u) => u.userId === actor.id) ?? null;
  return { challenges, scoreboard: { users: board.users.slice(0, 20), teams: board.teams.slice(0, 10) }, me: { score: me?.score ?? 0, rank: me?.rank ?? null, team: team?.team ?? null } };
}

async function scoreboard(counts: Map<string, number>) {
  const [solves, hints] = await Promise.all([
    db.ctfSolve.findMany({ select: { userId: true, teamId: true, challengeKey: true, createdAt: true, user: { select: { displayName: true, username: true } } } }),
    db.ctfHintUnlock.findMany({ select: { userId: true, challengeKey: true, hint: true } }),
  ]);
  const users = new Map<string, { userId: string; name: string; username: string; score: number; solves: number; last: number }>();
  for (const s of solves) {
    const c = byKey(s.challengeKey);
    if (!c) continue;
    const u = users.get(s.userId) ?? { userId: s.userId, name: s.user.displayName, username: s.user.username, score: 0, solves: 0, last: 0 };
    u.score += valueOf(c, counts);
    u.solves += 1;
    u.last = Math.max(u.last, s.createdAt.getTime());
    users.set(s.userId, u);
  }
  for (const h of hints) { const u = users.get(h.userId); const c = byKey(h.challengeKey); if (u && c) u.score -= c.hints[h.hint]?.cost ?? 0; }
  // Eşitlikte puana daha önce ulaşan önde (CTFd gibi).
  const userRows = [...users.values()].sort((a, b) => b.score - a.score || a.last - b.last).map((u, i) => ({ ...u, rank: i + 1 }));

  const teamIds = [...new Set(solves.map((s) => s.teamId).filter((t): t is string => !!t))];
  const names = teamIds.length ? await db.ctfTeam.findMany({ where: { id: { in: teamIds } }, select: { id: true, name: true } }) : [];
  const teams = new Map<string, { teamId: string; name: string; score: number; keys: Set<string>; last: number }>();
  for (const s of solves) {
    if (!s.teamId) continue;
    const name = names.find((n) => n.id === s.teamId)?.name;
    const c = byKey(s.challengeKey);
    if (!name || !c) continue;
    const t = teams.get(s.teamId) ?? { teamId: s.teamId, name, score: 0, keys: new Set<string>(), last: 0 };
    if (!t.keys.has(c.key)) { t.keys.add(c.key); t.score += valueOf(c, counts); t.last = Math.max(t.last, s.createdAt.getTime()); }
    teams.set(s.teamId, t);
  }
  const teamRows = [...teams.values()].sort((a, b) => b.score - a.score || a.last - b.last).map((t, i) => ({ teamId: t.teamId, name: t.name, score: t.score, solves: t.keys.size, rank: i + 1 }));
  return { users: userRows, teams: teamRows };
}

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest();

export async function submitFlag(actor: Actor, key: string, flag: string) {
  const c = byKey(key);
  if (!c) throw notFound("Görev bulunamadı.");
  const r = hit(`ctf:${actor.id}:${key}`, 8, 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const correct = timingSafeEqual(sha(flag.trim()), Buffer.from(c.flagSha256, "hex"));
  if (!correct) return { correct: false as const };
  const membership = await db.ctfTeamMember.findUnique({ where: { userId: actor.id }, select: { teamId: true } });
  const xp = await db.$transaction(async (tx) => {
    const existing = await tx.ctfSolve.findUnique({ where: { userId_challengeKey: { userId: actor.id, challengeKey: key } } });
    if (existing) return 0;
    await tx.ctfSolve.create({ data: { userId: actor.id, challengeKey: key, teamId: membership?.teamId ?? null } });
    return award(tx, { userId: actor.id, ruleKey: "ctf.solve", key: `ctf:${actor.id}:${key}`, source: "TASK", reason: `CTF: ${c.title}`, refType: "CtfSolve" });
  });
  const counts = await solveCounts();
  return { correct: true as const, value: valueOf(c, counts), xp };
}

export async function unlockHint(actor: Actor, key: string, index: number) {
  const c = byKey(key);
  const h = c?.hints[index];
  if (!c || !h) throw notFound("İpucu bulunamadı.");
  await db.ctfHintUnlock.upsert({ where: { userId_challengeKey_hint: { userId: actor.id, challengeKey: key, hint: index } }, create: { userId: actor.id, challengeKey: key, hint: index }, update: {} });
  return { text: h.text, cost: h.cost };
}
