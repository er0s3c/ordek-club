import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { isStaff } from "@/server/auth/policy";
import { listCircles, listPosts, thanksCount } from "@/server/study/buddies";
import { BuddyBoard } from "./BuddyBoard";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Çalışma arkadaşları") };
}

export default async function BuddiesPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("study");
  const actor = { id: user.id, role: user.role, status: user.status };
  const [posts, circles, thanks] = await Promise.all([listPosts(actor), listCircles(actor), thanksCount(user.id)]);
  return (
    <div className="stack fade-up">
      <header className="page-head">
        <div className="eyebrow">{t("Kulüp · Birlikte çalış")}</div>
        <h1 className="page-title">{t("Çalışma arkadaşları")}</h1>
        <p className="page-sub">{t("“Linux çalışıyorum, birlikte tekrar yapacak birini arıyorum” gibi bir ilan aç ya da 2–5 kişilik çalışma grubuna katıl. Yazışma platform içinde kalır; iletişim bilgisi paylaşılmaz.")}</p>
      </header>
      <BuddyBoard posts={posts} circles={circles} staff={isStaff(user.role)} thanks={thanks} />
    </div>
  );
}
