import { Prisma, type PresentationStatus } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canEditPresentation, canUseTeaching, canViewPresentation, isAdmin, type Actor } from "@/server/auth/policy";
import { DECK_SCHEMA_VERSION, EMPTY_PRACTICAL_HOST, deckSchema, slideSteps, type Block, type ClientDeck, type Deck } from "@/lib/deck-schema";
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

// Görsel blokları yalnız kulübe yüklenmiş (MEDIA/CLUB kapsamlı) raster görsellere başvurabilir.
async function checkMedia(deck: Deck, tx: Tx | typeof db = db) {
  const ids = [...new Set(deck.slides.flatMap((sl) => sl.blocks.flatMap((b) => (b.type === "image" ? [b.fileId] : []))))];
  if (!ids.length) return;
  const ok = await tx.fileAsset.count({ where: { id: { in: ids }, kind: "image", scope: { in: ["MEDIA", "CLUB"] }, deletedAt: null } });
  if (ok !== ids.length) throw badRequest("Sunumdaki görsellerden biri bulunamadı ya da görsel değil. Görseli Studio'dan yeniden yükle.", "BAD_MEDIA");
}

// Görev blokları yalnız akademide var olan (arşivlenmemiş) bir dersin tanımlı görevine başvurabilir.
async function checkMissions(deck: Deck, tx: Tx | typeof db = db) {
  const refs = deck.slides.flatMap((sl) => sl.blocks.flatMap((b) => (b.type === "mission" ? [b] : [])));
  if (!refs.length) return;
  const lessons = await tx.lesson.findMany({ where: { slug: { in: [...new Set(refs.map((r) => r.lesson))] }, archivedAt: null }, select: { slug: true, missions: true } });
  for (const r of refs) {
    const l = lessons.find((x) => x.slug === r.lesson);
    const ids = Array.isArray(l?.missions) ? (l.missions as { id?: string }[]).map((m) => m.id) : [];
    if (!ids.includes(r.mission)) throw badRequest("Sunumdaki görevlerden biri akademide bulunamadı. Görevi Studio'dan yeniden seç.", "BAD_MISSION");
  }
}

async function writeVersion(tx: Tx, presentationId: string, deck: Deck, authorId: string) {
  await checkMedia(deck, tx);
  await checkMissions(deck, tx);
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
          blocks: { layout: s.layout, items: s.blocks, ...(s.motion ? { motion: s.motion } : {}) } as unknown as Prisma.InputJsonValue,
          notes: s.notes,
          steps: slideSteps(s.blocks),
        })),
      },
    },
  });
  // Yeni sürüm yayınlanınca Studio taslağı temizlenir.
  await tx.presentation.update({ where: { id: presentationId }, data: { currentVersionId: version.id, title: deck.title, description: deck.description, draft: Prisma.DbNull, draftUpdatedAt: null } });
  return version;
}

export async function createPresentation(actor: Actor, deck: Deck, ip: string, templateKey?: string, transaction?: Tx) {
  requireTeacher(actor);
  const write = async (tx: Tx) => {
    const p = await tx.presentation.create({
      data: { title: deck.title, description: deck.description, ownerId: actor.id, templateKey: templateKey ?? null },
    });
    await writeVersion(tx, p.id, deck, actor.id);
    await audit({ actorId: actor.id, action: templateKey ? "presentation.create.template" : "presentation.import", targetType: "Presentation", targetId: p.id, meta: { slides: deck.slides.length, templateKey: templateKey ?? null }, ip }, tx);
    return p;
  };
  return transaction ? write(transaction) : db.$transaction(write);
}

export async function createFromTemplate(actor: Actor, key: string, ip: string) {
  // Eğitmenlerin paylaştığı şablon: "user:<sunumId>"
  if (key.startsWith("user:")) {
    const p = await db.presentation.findUnique({ where: { id: key.slice(5) } });
    if (!p || !p.isTemplate || p.status === "ARCHIVED" || !canViewPresentation(actor, p)) throw notFound("Şablon bulunamadı.");
    const deck = await exportDeck(actor, p.id);
    return createPresentation(actor, deck, ip, key);
  }
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
      id: true, title: true, description: true, status: true, ownerId: true, updatedAt: true, templateKey: true, isTemplate: true, draftUpdatedAt: true,
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
      const b = s.blocks as unknown as { layout?: "default" | "title" | "section"; items?: Block[]; motion?: string };
      return {
        id: s.id,
        position: s.position,
        title: s.title,
        layout: b.layout ?? "default",
        // Uygulama molasının eğitmen notları (VM, snapshot, beklenen sonuç) öğrenciye gönderilmez.
        blocks: includeNotes ? (b.items ?? []) : (b.items ?? []).map((x) => (x.type === "practical" ? { ...x, host: EMPTY_PRACTICAL_HOST } : x)),
        steps: s.steps,
        ...(b.motion ? { motion: b.motion } : {}),
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
  return { id: p.id, status: p.status, ownerId: p.ownerId, owner, version: versionNo?.number ?? 1, updatedAt: p.updatedAt, canEdit: canEditPresentation(actor, p), isTemplate: p.isTemplate, hasDraft: p.draft !== null, deck };
}

export async function exportDeck(actor: Actor, id: string): Promise<Deck> {
  const p = await loadForActor(actor, id, "view");
  const deck = await loadClientDeck(p.currentVersionId!, true);
  return {
    schema: DECK_SCHEMA_VERSION,
    title: deck.title,
    description: deck.description,
    slides: deck.slides.map((s) => ({ title: s.title, layout: s.layout, blocks: s.blocks, notes: s.notes ?? "", motion: s.motion ?? "" })),
  };
}

export async function updatePresentation(
  actor: Actor,
  id: string,
  input: { status?: PresentationStatus; content?: unknown; isTemplate?: boolean },
  ip: string,
) {
  const p = await loadForActor(actor, id, "edit");
  const deck = input.content !== undefined ? parseDeck(input.content) : null;
  if (input.status === "ARCHIVED") throw badRequest("Arşivlemek için silme işlemini kullan.");
  await db.$transaction(async (tx) => {
    if (deck) await writeVersion(tx, p.id, deck, actor.id);
    if (input.status && input.status !== p.status) await tx.presentation.update({ where: { id: p.id }, data: { status: input.status } });
    if (input.isTemplate !== undefined && input.isTemplate !== p.isTemplate) await tx.presentation.update({ where: { id: p.id }, data: { isTemplate: input.isTemplate } });
    await audit({ actorId: actor.id, action: deck ? "presentation.content" : "presentation.status", targetType: "Presentation", targetId: p.id, meta: { status: input.status ?? null, newVersion: Boolean(deck), isTemplate: input.isTemplate ?? null }, ip }, tx);
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

// ── Club Studio ─────────────────────────────────────────────────────────────
// Otomatik kayıt bir "taslak" (Presentation.draft) yazar; sürüm oluşturmaz. Yayınla → doğrulanmış yeni sürüm.
// Taslak düzenleme sırasında geçici olarak geçersiz olabilir; sorunlar kaydedilir ama yayın engellenir.

const MAX_DRAFT_BYTES = 512 * 1024;

export type DeckIssue = { path: string; message: string };

export function deckIssues(raw: unknown): DeckIssue[] {
  const r = deckSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.slice(0, 20).map((i) => ({ path: i.path.join("."), message: i.message }));
}

export async function getStudio(actor: Actor, id: string) {
  const p = await loadForActor(actor, id, "edit");
  const current = p.currentVersionId ? await exportDeck(actor, id) : null;
  const versions = await db.presentationVersion.findMany({
    where: { presentationId: id },
    orderBy: { number: "desc" },
    take: 50,
    select: { id: true, number: true, createdAt: true, createdBy: { select: { displayName: true } }, _count: { select: { slides: true } } },
  });
  return {
    id: p.id,
    status: p.status,
    isTemplate: p.isTemplate,
    deck: (p.draft as unknown) ?? current,
    draftUpdatedAt: p.draftUpdatedAt,
    hasDraft: p.draft !== null,
    version: versions[0]?.number ?? 0,
    versions,
  };
}

export async function saveDraft(actor: Actor, id: string, content: unknown) {
  await loadForActor(actor, id, "edit");
  if (Buffer.byteLength(JSON.stringify(content ?? null)) > MAX_DRAFT_BYTES) throw badRequest("Sunum çok büyük (en fazla 512 KB).", "TOO_LARGE");
  const at = new Date();
  await db.presentation.update({ where: { id }, data: { draft: content as Prisma.InputJsonValue, draftUpdatedAt: at } });
  return { savedAt: at, issues: deckIssues(content) };
}

export async function publishDraft(actor: Actor, id: string, ip: string) {
  const p = await loadForActor(actor, id, "edit");
  if (p.draft === null) throw badRequest("Yayınlanacak taslak yok.", "NO_DRAFT");
  const deck = parseDeck(p.draft);
  return db.$transaction(async (tx) => {
    const v = await writeVersion(tx, id, deck, actor.id);
    await audit({ actorId: actor.id, action: "presentation.publish", targetType: "Presentation", targetId: id, meta: { version: v.number, slides: deck.slides.length }, ip }, tx);
    return { version: v.number };
  });
}

export async function discardDraft(actor: Actor, id: string) {
  await loadForActor(actor, id, "edit");
  await db.presentation.update({ where: { id }, data: { draft: Prisma.DbNull, draftUpdatedAt: null } });
}

// Eski sürümü taslağa yükler (yayınlamak ayrı adım): geçmiş değişmez, yeni sürüm olarak eklenir.
export async function restoreVersion(actor: Actor, id: string, versionId: string) {
  await loadForActor(actor, id, "edit");
  const v = await db.presentationVersion.findFirst({ where: { id: versionId, presentationId: id }, select: { id: true } });
  if (!v) throw notFound("Sürüm bulunamadı.");
  const deck = await loadClientDeck(v.id, true);
  const content: Deck = { schema: DECK_SCHEMA_VERSION, title: deck.title, description: deck.description, slides: deck.slides.map((sl) => ({ title: sl.title, layout: sl.layout, blocks: sl.blocks, notes: sl.notes ?? "", motion: sl.motion ?? "" })) };
  await db.presentation.update({ where: { id }, data: { draft: content as unknown as Prisma.InputJsonValue, draftUpdatedAt: new Date() } });
  return content;
}

// Şablon listesi: hazır şablonlar + eğitmenlerin paylaştığı (yayınlanmış ya da kendine ait) şablonlar.
export async function userTemplates(actor: Actor) {
  const rows = await db.presentation.findMany({
    where: { isTemplate: true, status: { not: "ARCHIVED" }, ...(isAdmin(actor.role) ? {} : { OR: [{ ownerId: actor.id }, { status: "PUBLISHED" }] }) },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, description: true, owner: { select: { displayName: true } }, currentVersion: { select: { _count: { select: { slides: true } } } } },
  });
  return rows.map((p) => ({ key: `user:${p.id}`, title: p.title, description: `${p.description}${p.description ? " · " : ""}${p.owner?.displayName ?? "—"} paylaştı`, slideCount: p.currentVersion?._count.slides ?? 0 }));
}
