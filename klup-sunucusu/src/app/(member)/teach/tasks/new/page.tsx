import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { EMPTY_TASK, TaskForm } from "../TaskForm";
import { taskXpDefaults } from "../xp";

export const metadata: Metadata = { title: "Yeni görev" };

export default async function NewTaskPage() {
  await requirePageSession(STAFF_ROLES);
  return (
    <div className="stack fade-up" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach/tasks">Görev yönetimi</Link></div>
        <h1 className="page-title">Yeni görev</h1>
      </div>
      <TaskForm initial={EMPTY_TASK} xpDefaults={await taskXpDefaults()} />
    </div>
  );
}
