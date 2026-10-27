import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { EMPTY_TASK } from "@/components/classroom/form-values";
import { TaskForm } from "../TaskForm";
import { taskGroupOptions, taskXpDefaults } from "../xp";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Yeni görev") };
}

export default async function NewTaskPage() {
  const t = await getT();
  await requirePageSession(STAFF_ROLES);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach/tasks">{t("Görev yönetimi")}</Link></div>
        <h1 className="page-title">{t("Yeni görev")}</h1>
      </div>
      <TaskForm initial={EMPTY_TASK} xpDefaults={await taskXpDefaults()} groups={await taskGroupOptions()} />
    </div>
  );
}
