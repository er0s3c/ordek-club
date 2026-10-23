// Yetkilendirme politikası — saf fonksiyonlar (DB'ye dokunmaz, birim testlenir).
// Tüm API'ler bu fonksiyonlarla karar verir; arayüzdeki gizleme yalnızca kolaylıktır.
import type { MemberStatus, Role } from "@prisma/client";

export const ROLE_RANK: Record<Role, number> = { OWNER: 4, ADMIN: 3, INSTRUCTOR: 2, STUDENT: 1 };

export type Actor = { id: string; role: Role; status: MemberStatus };
export type Target = { id: string; role: Role; status: MemberStatus };

export const isStaff = (role: Role) => role === "OWNER" || role === "ADMIN" || role === "INSTRUCTOR";
export const isAdmin = (role: Role) => role === "OWNER" || role === "ADMIN";

export function hasRole(actor: { role: Role }, allowed: readonly Role[]): boolean {
  return allowed.includes(actor.role);
}

// Admin paneli erişimi
export const canAccessAdmin = (a: Actor) => a.status === "ACTIVE" && isAdmin(a.role);

// Üye yönetimi: aktör, hedefi yönetebilir mi? (onay/red/devre dışı/etkinleştirme)
// Kurallar: kendi hesabını yönetemez; OWNER'a dokunulamaz; ADMIN yalnız kendinden düşük rolleri yönetir.
export function canManageMember(actor: Actor, target: Target): boolean {
  if (!canAccessAdmin(actor)) return false;
  if (actor.id === target.id) return false;
  if (target.role === "OWNER") return false;
  if (actor.role === "OWNER") return true;
  return ROLE_RANK[actor.role] > ROLE_RANK[target.role];
}

// Rol atama: kimin hangi rolü verebileceği.
// OWNER → ADMIN/INSTRUCTOR/STUDENT. ADMIN → INSTRUCTOR/STUDENT. OWNER rolü bu yolla verilemez.
export function assignableRoles(actor: Actor): Role[] {
  if (!canAccessAdmin(actor)) return [];
  if (actor.role === "OWNER") return ["ADMIN", "INSTRUCTOR", "STUDENT"];
  return ["INSTRUCTOR", "STUDENT"];
}

export function canChangeRole(actor: Actor, target: Target, newRole: Role): boolean {
  return canManageMember(actor, target) && assignableRoles(actor).includes(newRole);
}

// Davet kodu hangi rolle oluşturulabilir (rol atama kuralının aynısı).
export const canCreateInvitationFor = (actor: Actor, role: Role) => assignableRoles(actor).includes(role);

// Kulüp ayarları: kayıt politikası ve oturum ayarları dahil yalnız OWNER/ADMIN.
export const canEditSettings = (a: Actor) => canAccessAdmin(a);
// Audit log görüntüleme
export const canViewAudit = (a: Actor) => canAccessAdmin(a);

// Durum geçişleri (üyelik yaşam döngüsü)
export type MemberAction = "approve" | "reject" | "disable" | "enable";
const TRANSITIONS: Record<MemberAction, { from: MemberStatus[]; to: MemberStatus }> = {
  approve: { from: ["PENDING", "REJECTED"], to: "ACTIVE" },
  reject: { from: ["PENDING"], to: "REJECTED" },
  disable: { from: ["ACTIVE"], to: "DISABLED" },
  enable: { from: ["DISABLED"], to: "ACTIVE" },
};

export function nextStatus(current: MemberStatus, action: MemberAction): MemberStatus | null {
  const t = TRANSITIONS[action];
  return t.from.includes(current) ? t.to : null;
}

// ── Faz 2: sunumlar ve canlı oturumlar ──────────────────────────────────────
type PresentationRef = { ownerId: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };

export const canUseTeaching = (a: Actor) => a.status === "ACTIVE" && isStaff(a.role);

// Düzenleme/silme: sahibi ya da OWNER/ADMIN.
export const canEditPresentation = (a: Actor, p: PresentationRef) =>
  canUseTeaching(a) && p.status !== "ARCHIVED" && (isAdmin(a.role) || p.ownerId === a.id);

// Görüntüleme/kopyalama/canlı başlatma: kendi sunumu, admin ya da yayınlanmış sunum.
export const canViewPresentation = (a: Actor, p: PresentationRef) =>
  canUseTeaching(a) && p.status !== "ARCHIVED" && (isAdmin(a.role) || p.ownerId === a.id || p.status === "PUBLISHED");

// Canlı oturumu yönetme: oturumu başlatan eğitmen ya da OWNER/ADMIN.
export const canHostSession = (a: Actor, s: { hostId: string | null }) =>
  a.status === "ACTIVE" && (isAdmin(a.role) || (isStaff(a.role) && s.hostId === a.id));

// ── Faz 3: akademi ───────────────────────────────────────────────────────────
// Dersleri her aktif üye okur; içerik içe aktarma ve akademi istatistikleri yalnız OWNER/ADMIN.
export const canUseAcademy = (a: Actor) => a.status === "ACTIVE";
export const canManageAcademy = (a: Actor) => canAccessAdmin(a);

// ── Faz 4: XP ve rozetler ───────────────────────────────────────────────────
// Kural, seviye, puan düzeltme ve rozet yönetimi yalnız OWNER/ADMIN. XP yalnız sunucu kurallarıyla verilir.
export const canManageGamification = (a: Actor) => canAccessAdmin(a);
