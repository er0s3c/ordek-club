import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { listNotifications } from "@/server/classroom/notifications";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { NotificationList } from "./NotificationList";

export const metadata: Metadata = { title: "Bildirimler" };

export default async function NotificationsPage() {
  const { user } = await requirePageSession();
  const [items, s] = await Promise.all([listNotifications({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  return (
    <div className="stack fade-up" style={{ maxWidth: 860 }}>
      <div className="page-head">
        <div className="eyebrow">Hesabım</div>
        <h1 className="page-title">Bildirimler</h1>
        <p className="page-sub">Görev, değerlendirme ve duyuru bildirimlerin (son 100). E-posta bildirimleri sonraki sürümde.</p>
      </div>
      <NotificationList
        items={items.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link ?? "", unread: !n.readAt, at: formatDateTime(n.createdAt, s.timezone) }))}
      />
    </div>
  );
}
