import { describe, expect, it } from "vitest";
import type { MemberStatus, Role } from "@prisma/client";
import { assignableRoles, canAccessAdmin, canChangeRole, canManageMember, nextStatus } from "@/server/auth/policy";

const u = (id: string, role: Role, status: MemberStatus = "ACTIVE") => ({ id, role, status });
const owner = u("o", "OWNER"), admin = u("a", "ADMIN"), admin2 = u("a2", "ADMIN"), inst = u("i", "INSTRUCTOR"), stu = u("s", "STUDENT");

describe("RBAC politikası", () => {
  it("admin paneline yalnız aktif OWNER/ADMIN girer", () => {
    expect(canAccessAdmin(owner)).toBe(true);
    expect(canAccessAdmin(admin)).toBe(true);
    expect(canAccessAdmin(inst)).toBe(false);
    expect(canAccessAdmin(stu)).toBe(false);
    expect(canAccessAdmin(u("x", "ADMIN", "DISABLED"))).toBe(false);
  });

  it("kimse kendini ya da OWNER'ı yönetemez", () => {
    expect(canManageMember(owner, owner)).toBe(false);
    expect(canManageMember(admin, admin)).toBe(false);
    expect(canManageMember(admin, owner)).toBe(false);
  });

  it("ADMIN yalnız kendinden düşük rolleri yönetir", () => {
    expect(canManageMember(admin, admin2)).toBe(false);
    expect(canManageMember(admin, inst)).toBe(true);
    expect(canManageMember(admin, stu)).toBe(true);
    expect(canManageMember(owner, admin)).toBe(true);
  });

  it("öğrenci/eğitmen hiçbir üyeyi yönetemez", () => {
    expect(canManageMember(inst, stu)).toBe(false);
    expect(canManageMember(stu, stu)).toBe(false);
  });

  it("rol atama: yetki yükseltme engelleri", () => {
    expect(assignableRoles(owner)).toEqual(["ADMIN", "INSTRUCTOR", "STUDENT"]);
    expect(assignableRoles(admin)).toEqual(["INSTRUCTOR", "STUDENT"]);
    expect(assignableRoles(inst)).toEqual([]);
    expect(canChangeRole(admin, stu, "ADMIN")).toBe(false);
    expect(canChangeRole(admin, stu, "OWNER")).toBe(false);
    expect(canChangeRole(owner, stu, "OWNER")).toBe(false);
    expect(canChangeRole(owner, stu, "ADMIN")).toBe(true);
    expect(canChangeRole(admin, stu, "INSTRUCTOR")).toBe(true);
  });

  it("üyelik durum geçişleri", () => {
    expect(nextStatus("PENDING", "approve")).toBe("ACTIVE");
    expect(nextStatus("PENDING", "reject")).toBe("REJECTED");
    expect(nextStatus("REJECTED", "approve")).toBe("ACTIVE");
    expect(nextStatus("ACTIVE", "disable")).toBe("DISABLED");
    expect(nextStatus("DISABLED", "enable")).toBe("ACTIVE");
    expect(nextStatus("ACTIVE", "approve")).toBeNull();
    expect(nextStatus("PENDING", "disable")).toBeNull();
    expect(nextStatus("DISABLED", "reject")).toBeNull();
  });
});
