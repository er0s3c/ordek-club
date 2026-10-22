import type { Prisma, PresentationStatus } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canEditPresentation, canUseTeaching, canViewPresentation, isAdmin, type Actor } from "@/server/auth/policy";
import { DECK_SCHEMA_VERSION, deckSchema, slideSteps, type Block, type ClientDeck, type Deck } from "@/lib/deck-schema";
import { TEMPLATES } from "@/templates";

type Tx = Prisma.TransactionClient;

function requireTeacher(actor: Actor) {
  if (!canUseTeaching(actor)) throw forbidden("Eğitmen paneli yalnızca eğitmen ve yöneticilere açıktır.");
}

export function parseDeck(raw: unknown): Deck {
  const r = deckSchema.safeParse(raw);
  if (!r.success) {
    const first = r.error.issues[0];
    const where = first?.path.join(".") || "kök";
    throw badRequest(`Sunum dosyası geçersiz (${where}): ${first?.message ?? "bilinmeyen hata"}`, "INVALID_DECK");
  }
  return r.data;
}

async function writeVersion(tx: Tx, presentationId: string, deck: Deck, authorId: string) {
  const last = await tx.presentationVersion.findFirst({ where: { presentationId }, orderBy: { number: "desc" }, select: { number: true } });
  const version = await tx.presentationVersion.create({
    data: {
      presentationId,
      number: (last?.number ?? 0) + 1,
      meta: { schema: DECK_SCHEMA_VERSION },
      createdById: authorId,
      slides: {
        create: deck.slides.map((s, i) => ({
          position: i,
          title: s.title,
          blocks: { layout: s.layout, items: s.blocks } as unknown as Prisma.InputJsonValue,
          notes: s.notes,
          steps: slideSteps(s.blocks),
        })),
      },
    },
  });
  await tx.presentation.update({ where: { id: presentationId }, data: { currentVersionId: version.id, title: deck.title, description: deck.description } });
  return version;
}

export async function createPresentation(actor: Actor, deck: Deck, ip: string, templateKey?: string) {
  requireTeacher(actor);
  return db.$transaction(async (tx) => {
    const p = await tx.presentation.create({
      data: { title: deck.title, description: deck.description, ownerId: actor.id, templateKey: templateKey ?? null },
    });
    await writeVersion(tx, p.id, deck, actor.id);
    await audit({ actorId: actor.id, action: templateKey ? "presentation.create.template" : "presentation.import", targetType: "Presentation", targetId: p.id, meta: { slides: deck.slides.length, templateKey: templateKey ?? null }, ip }, tx);
    return p;
  });
}

export async function createFromTemplate(actor: Actor, key: string, ip: string) {
  const t = TEMPLATES[key];
  if (!t) throw notFound("Şablon bulunamadı.");
  return createPresentation(actor, parseDeck(t), ip, key);
}

export async function listPresentations(actor: Actor) {
  requireTeacher(actor);
  const where: Prisma.PresentationWhereInput = isAdmin(actor.role)
    ? { status: { not: "ARCHIVED" } }
    : { status: { not: "ARCHIVED" }, OR: [{ ownerId: actor.id }, { status: "PUBLISHED" }] };
  const items = await db.presentation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true, title: true, description: true, status: true, ownerId: true, updatedAt: true, templateKey: true,
      owner: { select: { username: true, displayName: true } },
      currentVersion: { select: { number: true, _count: { select: { slides: true } } } },
    },
  });
  return items.map((p) => ({ ...p, canEdit: canEditPresentation(actor, p) }));
}

async function loadForActor(actor: Actor, id: string, mode: "view" | "edit") {
  requireTeacher(actor);
  const p = await db.presentation.findUnique({ where: { id } });
  // Yetkisiz kişiye kaydın varlığı da sızdırılmaz: 404.
  if (!p || !canViewPresentation(actor, p)) throw notFound("Sunum bulunamadı.");
  if (mode === "edit" && !canEditPresentation(actor, p)) throw forbidden("Bu sunumu yalnızca sahibi veya yöneticiler düzenleyebilir.");
  return p;
}

// Bir sürümün slaytlarını istemci biçiminde döndürür. Notlar yalnızca includeNotes=true ise eklenir.
export async function loadClientDeck(versionId: string, includeNotes: boolean): Promise<ClientDeck> {
  const v = await db.presentationVersion.findUniqueOrThrow({
    where: { id: versionId },
    include: { presentation: { select: { title: true, description: true } }, slides: { orderBy: { position: "asc" } } },
  });
  return {
    title: v.presentation.title,
    description: v.presentation.description,
    slides: v.slides.map((s) => {
      const b = s.blocks as unknown as { layout?: "default" | "title" | "section"; items?: Block[] };
      return {
        id: s.id,
        position: s.position,
        title: s.title,
        layout: b.layout ?? "default",
        blocks: b.items ?? [],
        steps: s.steps,
        ...(includeNotes ? { notes: s.notes } : {}),
      };
    }),
  };
}

export async function getPresentation(actor: Actor, id: string) {
  const p = await loadForActor(actor, id, "view");
  if (!p.currentVersionId) throw notFound("Sunumun içeriği yok.");
  const [deck, owner, versionNo] = await Promise.all([
    loadClientDeck(p.currentVersionId, true),
    p.ownerId ? db.user.findUnique({ where: { id: p.ownerId }, select: { username: true, displayName: true } }) : null,
    db.presentationVersion.findUnique({ where: { id: p.currentVersionId }, select: { number: true } }),
  ]);
  return { id: p.id, status: p.status, ownerId: p.ownerId, owner, version: versionNo?.number ?? 1, updatedAt: p.updatedAt, canEdit: canEditPresentation(actor, p), deck };
}

export async function exportDeck(actor: Actor, id: string): Promise<Deck> {
  const p = await loadForActor(actor, id, "view");
  const deck = await loadClientDeck(p.currentVersionId!, true);
  return {
    schema: DECK_SCHEMA_VERSION,
    title: deck.title,
    description: deck.description,
    slides: deck.slides.map((s) => ({ title: s.title, layout: s.layout, blocks: s.blocks, notes: s.notes ?? "" })),
  };
}

export async function updatePresentation(
  actor: Actor,
  id: string,
  input: { status?: PresentationStatus; content?: unknown },
  ip: string,
) {
  const p = await loadForActor(actor, id, "edit");
  const deck = input.content !== undefined ? parseDeck(input.content) : null;
  if (input.status === "ARCHIVED") throw badRequest("Arşivlemek için silme işlemini kullan.");
  await db.$transaction(async (tx) => {
    if (deck) await writeVersion(tx, p.id, deck, actor.id);
    if (input.status && input.status !== p.status) await tx.presentation.update({ where: { id: p.id }, data: { status: input.status } });
    await audit({ actorId: actor.id, action: deck ? "presentation.content" : "presentation.status", targetType: "Presentation", targetId: p.id, meta: { status: input.status ?? null, newVersion: Boolean(deck) }, ip }, tx);
  });
}

export async function duplicatePresentation(actor: Actor, id: string, ip: string) {
  const deck = await exportDeck(actor, id);
  return createPresentation(actor, { ...deck, title: `${deck.title} (kopya)`.slice(0, 160) }, ip);
}

// Silme = arşivleme: geçmiş canlı oturum özetleri sürüm verisine bağlı kalır.
export async function archivePresentation(actor: Actor, id: string, ip: string) {
  const p = await loadForActor(actor, id, "edit");
  await db.$transaction(async (tx) => {
    await tx.presentation.update({ where: { id: p.id }, data: { status: "ARCHIVED" } });
    await audit({ actorId: actor.id, action: "presentation.archive", targetType: "Presentation", targetId: p.id, ip }, tx);
  });
}

export type ImportInput = z.input<typeof deckSchema>;
