// Sorun bildirimi takibi: ders hatası, teknik sorun ya da çeviri hatası bir takip numarasına (HB-0001) dönüşür.
// Bildiren "alındı → inceleniyor → düzeltildi/reddedildi" durumlarını ve personelin notlarını görür.
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { forbidden, notFound, tooMany } from "@/server/errors";
import { isStaff, type Actor } from "@/server/auth/policy";
import { LIMITS, hit } from "@/server/rate-limit";
import { notify } from "@/server/classroom/notifications";

export const ISSUE_STATUS = ["RECEIVED", "REVIEWING", "FIXED", "REJECTED"] as const;
export const ISSUE_LABEL: Record<(typeof ISSUE_STATUS)[number], string> = { RECEIVED: "Alındı", REVIEWING: "İnceleniyor", FIXED: "Düzeltildi", REJECTED: "Değişiklik gerekmedi" };
export const ISSUE_KIND_LABEL = { CONTENT: "İçerik hatası", TECHNICAL: "Teknik sorun", TRANSLATION: "Çeviri / dil" } as const;
export const issueNo = (n: number) => `HB-${String(n).padStart(4, "0")}`;

export const issueSchema = z.object({
  lessonSlug: z.string().regex(/^[a-z0-9-]{1,40}$/).nullable().default(null),
  location: z.string().trim().max(200).default(""),
  kind: z.enum(["CONTENT", "TECHNICAL", "TRANSLATION"]).default("CONTENT"),
  body: z.string().trim().min(10, "Sorunu en az bir cümleyle anlat.").max(3000),
});
type History = { status: string; note: string; at: string }[];

export async function createIssue(actor: Actor, input: z.output<typeof issueSchema>) {
  const [max, win] = LIMITS.postPerUser;
  const r = hit(`issue:${actor.id}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const lesson = input.lessonSlug ? await db.lesson.findFirst({ where: { slug: input.lessonSlug, archivedAt: null }, select: { id: true } }) : null;
  const created = await db.issueReport.create({
    data: { userId: actor.id, lessonId: lesson?.id ?? null, location: input.location, kind: input.kind, body: input.body, history: [{ status: "RECEIVED", note: "Bildirim alındı.", at: new Date().toISOString() }] },
  });
  return { id: created.id, number: issueNo(created.number) };
}

export async function myIssues(actor: Actor) {
  const rows = await db.issueReport.findMany({ where: { userId: actor.id }, orderBy: { createdAt: "desc" }, take: 100, include: { lesson: { select: { slug: true, title: true } } } });
  return rows.map((r) => ({ ...r, no: issueNo(r.number), history: r.history as History }));
}

export async function listIssues(actor: Actor, status?: string) {
  if (!isStaff(actor.role)) throw forbidden();
  const where: Prisma.IssueReportWhereInput = status && (ISSUE_STATUS as readonly string[]).includes(status) ? { status } : {};
  const rows = await db.issueReport.findMany({ where, orderBy: [{ createdAt: "desc" }], take: 300, include: { lesson: { select: { slug: true, title: true } }, user: { select: { displayName: true } } } });
  return rows.map((r) => ({ ...r, no: issueNo(r.number), history: r.history as History }));
}

export const issueUpdateSchema = z.object({ status: z.enum(ISSUE_STATUS), note: z.string().trim().max(1000).default("") });

export async function updateIssue(actor: Actor, id: string, input: z.output<typeof issueUpdateSchema>, ip: string) {
  if (!isStaff(actor.role)) throw forbidden("Sorun bildirimlerini personel günceller.");
  return db.$transaction(async (tx) => {
    const cur = await tx.issueReport.findUnique({ where: { id } });
    if (!cur) throw notFound();
    const history = [...(cur.history as History), { status: input.status, note: input.note, at: new Date().toISOString() }];
    const row = await tx.issueReport.update({ where: { id }, data: { status: input.status, history } });
    if (cur.userId && cur.userId !== actor.id)
      await notify(tx, [cur.userId], { type: "SYSTEM", title: `${issueNo(cur.number)}: ${ISSUE_LABEL[input.status]}`, body: input.note.slice(0, 200), link: "/reports" });
    await audit({ actorId: actor.id, action: "issue.update", targetType: "IssueReport", targetId: id, meta: { status: input.status }, ip }, tx);
    return row;
  });
}
