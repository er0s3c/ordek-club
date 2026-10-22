"use client";

import type { MemberStatus, Role } from "@prisma/client";
import { useMessages } from "@/components/providers";

const STATUS_CLASS: Record<MemberStatus, string> = {
  ACTIVE: "badge badge-lime",
  PENDING: "badge badge-amber",
  REJECTED: "badge badge-red",
  DISABLED: "badge",
};
const ROLE_CLASS: Record<Role, string> = {
  OWNER: "badge badge-violet",
  ADMIN: "badge badge-blue",
  INSTRUCTOR: "badge badge-lime",
  STUDENT: "badge",
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const m = useMessages();
  return <span className={STATUS_CLASS[status]}>{m.statuses[status]}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  const m = useMessages();
  return <span className={ROLE_CLASS[role]}>{m.roles[role]}</span>;
}
