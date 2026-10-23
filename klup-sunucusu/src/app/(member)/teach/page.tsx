import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { listPresentations, userTemplates } from "@/server/presentations";
import { listMySessions } from "@/server/live/service";
import { getSettings } from "@/server/settings";
import { TEMPLATE_LIST } from "@/templates";
import { TeachHome } from "./TeachHome";

export const metadata: Metadata = { title: "Eğitmen paneli" };

export default async function TeachPage() {
  const { user } = await requirePageSession(STAFF_ROLES);
  const actor = { id: user.id, role: user.role, status: user.status };
  const [items, sessions, s, mine] = await Promise.all([listPresentations(actor), listMySessions(actor), getSettings(), userTemplates(actor)]);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Eğitmen paneli</div>
        <h1 className="page-title">Sunumlar ve canlı dersler</h1>
        <p className="page-sub">Hazır şablondan başla veya bir sunum dosyası içe aktar, ardından canlı dersi tek tıkla başlat.</p>
      </div>
      <TeachHome
        timezone={s.timezone}
        templates={[...TEMPLATE_LIST, ...mine]}
        items={items.map((p) => ({
          id: p.id, title: p.title, description: p.description, status: p.status, canEdit: p.canEdit,
          owner: p.owner?.displayName ?? "—", mine: p.ownerId === user.id, slides: p.currentVersion?._count.slides ?? 0,
          version: p.currentVersion?.number ?? 1, updatedAt: p.updatedAt.toISOString(),
        }))}
        sessions={sessions.map((x) => ({ id: x.id, code: x.code, title: x.title, status: x.status, startedAt: x.startedAt.toISOString(), participants: x._count.participants }))}
      />
    </div>
  );
}
