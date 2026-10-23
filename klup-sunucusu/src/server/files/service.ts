// Dosya paylaşımı: yükleme, yetkili indirme, silme, kota. Yetki her indirmede sunucuda kontrol edilir.
import type { FileAsset, FileScope, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { visibleAssignmentsWhere } from "@/server/classroom/access";
import { cleanFileName, readBlob, removeBlob, validateUpload, writeBlob } from "./store";

const MB = 1024 * 1024;

export type UploadTarget =
  | { scope: "CLUB" }
  | { scope: "USERS"; userIds: string[] }
  | { scope: "ASSIGNMENT"; assignmentId: string }
  | { scope: "SUBMISSION"; submissionId: string };

export async function maxUploadBytes() {
  return (await getSettings()).maxUploadMb * MB;
}

async function usedBytes(where: Prisma.FileAssetWhereInput) {
  return (await db.fileAsset.aggregate({ where: { deletedAt: null, ...where }, _sum: { size: true } }))._sum.size ?? 0;
}

// Dosyayı doğrular, kotayı kontrol eder, diske yazar ve kaydını oluşturur.
// Not: Yetki (bu kapsama kim yükleyebilir) çağıran serviste kontrol edilir.
export async function storeFile(
  tx: Prisma.TransactionClient | typeof db,
  actor: Actor,
  file: File,
  target: UploadTarget,
  description = "",
): Promise<FileAsset> {
  const s = await getSettings();
  if (file.size === 0) throw badRequest("Dosya boş.", "EMPTY_FILE");
  if (file.size > s.maxUploadMb * MB) throw badRequest(`Dosya en fazla ${s.maxUploadMb} MB olabilir.`, "FILE_TOO_LARGE");
  const name = cleanFileName(file.name);
  const buf = new Uint8Array(await file.arrayBuffer());
  const sniffed = validateUpload(name, buf);
  if ((await usedBytes({})) + buf.length > s.storageQuotaMb * MB) throw badRequest("Kulüp depolama kotası doldu. Yöneticiye haber ver.", "QUOTA_CLUB");
  if (!isStaff(actor.role) && (await usedBytes({ ownerId: actor.id })) + buf.length > s.userQuotaMb * MB)
    throw badRequest(`Kişisel yükleme kotan (${s.userQuotaMb} MB) doldu.`, "QUOTA_USER");
  const { key, sha256 } = await writeBlob(buf);
  try {
    const row = await tx.fileAsset.create({
      data: {
        name,
        storageKey: key,
        mime: sniffed.mime,
        kind: sniffed.kind,
        size: buf.length,
        sha256,
        description: description.slice(0, 300),
        scope: target.scope,
        ownerId: actor.id,
        assignmentId: target.scope === "ASSIGNMENT" ? target.assignmentId : null,
        submissionId: target.scope === "SUBMISSION" ? target.submissionId : null,
        ...(target.scope === "USERS" ? { grants: { create: [...new Set(target.userIds)].map((userId) => ({ userId })) } } : {}),
      },
    });
    return row;
  } catch (err) {
    await removeBlob(key); // kayıt yazılamadıysa diskte yetim dosya bırakma
    throw err;
  }
}

// Personelin kulüp kütüphanesine / belirli üyelere / bir göreve dosya yüklemesi.
export async function uploadLibraryFile(actor: Actor, file: File, target: Exclude<UploadTarget, { scope: "SUBMISSION" }>, description: string, ip: string) {
  if (!canManageClassroom(actor)) throw forbidden("Dosya paylaşımı eğitmen ve yöneticilere açıktır.");
  if (target.scope === "USERS") {
    if (!target.userIds.length) throw badRequest("En az bir üye seç.", "NO_USERS");
    const n = await db.user.count({ where: { id: { in: target.userIds }, status: "ACTIVE" } });
    if (n !== new Set(target.userIds).size) throw badRequest("Seçilen üyelerden bazıları bulunamadı.", "BAD_USERS");
  }
  if (target.scope === "ASSIGNMENT") {
    const a = await db.assignment.findUnique({ where: { id: target.assignmentId }, select: { createdById: true } });
    if (!a) throw notFound("Görev bulunamadı.");
    if (!isAdmin(actor.role) && a.createdById !== actor.id) throw forbidden("Bu göreve yalnızca oluşturan eğitmen dosya ekleyebilir.");
  }
  const f = await storeFile(db, actor, file, target, description);
  await audit({ actorId: actor.id, action: "file.upload", targetType: "FileAsset", targetId: f.id, meta: { name: f.name, scope: f.scope, size: f.size, sha256: f.sha256 }, ip });
  return f;
}

type FileWithRefs = FileAsset & { grants: { userId: string }[]; submission: { userId: string } | null };

export async function canReadFile(actor: Actor, f: FileWithRefs): Promise<boolean> {
  if (f.deletedAt || actor.status !== "ACTIVE") return false;
  if (isStaff(actor.role)) return true;
  if (f.ownerId === actor.id) return true;
  switch (f.scope as FileScope) {
    case "CLUB":
      return true;
    case "USERS":
      return f.grants.some((g) => g.userId === actor.id);
    case "SUBMISSION":
      return f.submission?.userId === actor.id;
    case "ASSIGNMENT":
      return !!f.assignmentId && (await db.assignment.count({ where: { id: f.assignmentId, ...visibleAssignmentsWhere(actor) } })) > 0;
  }
}

const loadFile = (id: string) =>
  db.fileAsset.findUnique({ where: { id }, include: { grants: { select: { userId: true } }, submission: { select: { userId: true } } } });

// İndirme: yetkisiz kullanıcıya dosyanın varlığı da sızdırılmaz (404).
export async function openFile(actor: Actor, id: string) {
  const f = await loadFile(id);
  if (!f || !(await canReadFile(actor, f))) throw notFound("Dosya bulunamadı.");
  const data = await readBlob(f.storageKey).catch(() => null);
  if (!data) throw notFound("Dosya bulunamadı.");
  return { file: f, data };
}

export async function deleteFile(actor: Actor, id: string, ip: string) {
  const f = await db.fileAsset.findUnique({ where: { id }, include: { submission: { select: { status: true, userId: true } } } });
  if (!f || f.deletedAt) throw notFound("Dosya bulunamadı.");
  const own = f.ownerId === actor.id;
  // Öğrenci kendi teslim dosyasını yalnız teslim değerlendirilmeden önce silebilir.
  const lockedSubmission = f.submission && (f.submission.status === "APPROVED" || f.submission.status === "REJECTED");
  const allowed = isAdmin(actor.role) || (own && (isStaff(actor.role) || !lockedSubmission));
  if (!allowed) throw forbidden("Bu dosyayı silemezsin.");
  await db.fileAsset.update({ where: { id }, data: { deletedAt: new Date() } });
  await removeBlob(f.storageKey); // içerik diskten hemen silinir; kayıt denetim için kalır
  await audit({ actorId: actor.id, action: "file.delete", targetType: "FileAsset", targetId: id, meta: { name: f.name, scope: f.scope }, ip });
}

// Kütüphane: kişinin görebildiği paylaşılmış dosyalar (teslim dosyaları hariç).
export async function listLibrary(actor: Actor) {
  const where: Prisma.FileAssetWhereInput = isStaff(actor.role)
    ? { deletedAt: null, scope: { not: "SUBMISSION" } }
    : {
        deletedAt: null,
        OR: [
          { scope: "CLUB" },
          { scope: "USERS", grants: { some: { userId: actor.id } } },
          { scope: "ASSIGNMENT", assignment: visibleAssignmentsWhere(actor) },
        ],
      };
  return db.fileAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true, name: true, kind: true, size: true, scope: true, description: true, createdAt: true, ownerId: true,
      owner: { select: { displayName: true } },
      assignment: { select: { id: true, title: true } },
      _count: { select: { grants: true } },
    },
  });
}

export async function storageUsage() {
  const s = await getSettings();
  const byScope = await db.fileAsset.groupBy({ by: ["scope"], where: { deletedAt: null }, _sum: { size: true }, _count: true });
  const total = byScope.reduce((a, r) => a + (r._sum.size ?? 0), 0);
  return { total, quota: s.storageQuotaMb * MB, userQuota: s.userQuotaMb * MB, byScope: byScope.map((r) => ({ scope: r.scope, bytes: r._sum.size ?? 0, count: r._count })) };
}
