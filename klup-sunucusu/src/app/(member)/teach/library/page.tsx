import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { library } from "@/server/classroom/grading";
import { listMisconceptions } from "@/server/teaching/content";
import { LibraryManager } from "./LibraryManager";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Kütüphane") };
}

export default async function LibraryPage() {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const actor = { id: user.id, role: user.role, status: user.status };
  const [lib, misconceptions] = await Promise.all([library(actor), listMisconceptions()]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen")}</div><h1 className="page-title">{t("Kütüphane")}</h1><p className="page-sub">{t("Yeniden kullanılabilir geri bildirim parçaları, rubrik şablonları ve kavram yanılgıları. Değerlendirirken ve ders hazırlarken tek tıkla eklenir.")}</p></header>
      <LibraryManager
        snippets={lib.snippets.map((s) => ({ id: s.id, label: s.label, text: s.text }))}
        rubrics={lib.rubrics}
        misconceptions={misconceptions.map((m) => ({ id: m.id, title: m.title, belief: m.belief, explanation: m.explanation, skills: m.skills, lessonSlugs: m.lessonSlugs, author: m.author?.displayName ?? "—", mine: m.authorId === user.id }))}
      />
    </div>
  );
}
