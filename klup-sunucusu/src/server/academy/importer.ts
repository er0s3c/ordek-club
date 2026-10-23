// İçeriği veritabanıyla eşitler. Tek transaction: ya hepsi uygulanır ya hiçbiri.
// Sayfa kimliği (slug) sabit anahtardır; içerikten kaldırılan yol/ders silinmez, arşivlenir
// (öğrencilerin ilerlemesi ve quiz denemeleri korunur).
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { env } from "@/server/env";
import { loadAcademy } from "./content";

export type ImportSummary = {
  tracks: number;
  lessons: number;
  created: number;
  updated: number;
  unchanged: number;
  archived: number;
  problems: string[];
  applied: boolean;
};

export async function importAcademy(opts: { dir?: string; actorId?: string | null; ip?: string } = {}): Promise<ImportSummary> {
  const dir = opts.dir ?? env().academyDir;
  const { tracks, problems } = loadAcademy(dir);
  const summary: ImportSummary = { tracks: tracks.length, lessons: 0, created: 0, updated: 0, unchanged: 0, archived: 0, problems, applied: false };
  if (problems.length) return summary; // hatalı içerik yarım uygulanmaz

  const now = new Date();
  await db.$transaction(
    async (tx) => {
      const existing = new Map((await tx.lesson.findMany({ select: { slug: true, contentHash: true, trackId: true, position: true, archivedAt: true } })).map((l) => [l.slug, l]));
      const keepTracks: string[] = [];
      const keepLessons: string[] = [];

      for (const t of tracks) {
        const villain = t.villain ? (t.villain as Prisma.InputJsonValue) : Prisma.DbNull;
        const row = await tx.track.upsert({
          where: { key: t.key },
          create: { key: t.key, code: t.code, kind: t.kind, title: t.title, summary: t.summary, position: t.position, villain },
          update: { code: t.code, kind: t.kind, title: t.title, summary: t.summary, position: t.position, villain, archivedAt: null },
        });
        keepTracks.push(row.id);

        for (const l of t.lessons) {
          summary.lessons++;
          keepLessons.push(l.slug);
          const prev = existing.get(l.slug);
          const data = {
            trackId: row.id,
            position: l.position,
            kind: l.kind,
            title: l.title,
            minutes: l.minutes,
            goals: l.goals,
            body: l.body,
            quiz: l.quiz ? (l.quiz as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
            missions: l.missions ? (l.missions as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
            passPercent: l.passPercent,
            sourcePath: l.sourcePath,
            contentHash: l.contentHash,
            archivedAt: null,
          };
          if (!prev) {
            await tx.lesson.create({ data: { slug: l.slug, ...data } });
            summary.created++;
          } else if (prev.contentHash !== l.contentHash || prev.trackId !== row.id || prev.position !== l.position || prev.archivedAt) {
            await tx.lesson.update({ where: { slug: l.slug }, data });
            summary.updated++;
          } else {
            summary.unchanged++;
          }
        }
      }

      const gone = await tx.lesson.updateMany({ where: { slug: { notIn: keepLessons }, archivedAt: null }, data: { archivedAt: now } });
      summary.archived = gone.count;
      await tx.track.updateMany({ where: { id: { notIn: keepTracks }, archivedAt: null }, data: { archivedAt: now } });
      await audit(
        {
          actorId: opts.actorId ?? null,
          action: "academy.import",
          targetType: "Academy",
          meta: { tracks: summary.tracks, lessons: summary.lessons, created: summary.created, updated: summary.updated, archived: summary.archived },
          ip: opts.ip,
        },
        tx,
      );
    },
    { timeout: 60_000 },
  );
  summary.applied = true;
  return summary;
}
