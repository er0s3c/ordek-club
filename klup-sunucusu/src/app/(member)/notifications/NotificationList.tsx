"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, CheckCheck, ClipboardList, Inbox, Megaphone, Star, Upload } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";

type Item = { id: string; type: string; title: string; body: string; link: string; unread: boolean; at: string };
const ICON = { ANNOUNCEMENT: Megaphone, ASSIGNMENT: ClipboardList, REVIEW: Star, SUBMISSION: Upload, SYSTEM: Bell } as Record<string, typeof Bell>;

export function NotificationList({ items }: { items: Item[] }) {
  const toast = useToast();
  const router = useRouter();
  const [read, setRead] = useState<Set<string>>(new Set());
  const unread = items.filter((n) => n.unread && !read.has(n.id));

  async function mark(ids: string[] | "all") {
    try {
      await api("/api/notifications", { body: { ids } });
      setRead((r) => new Set([...r, ...(ids === "all" ? items.map((n) => n.id) : ids)]));
      router.refresh(); // menü sayacı
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  return (
    <section className="card">
      <div className="card-h">
        <h2>{unread.length ? `${unread.length} okunmamış` : "Hepsi okundu"}</h2>
        {unread.length > 0 && <button className="btn btn-sm" onClick={() => mark("all")}><CheckCheck size={14} aria-hidden /> Tümünü okundu say</button>}
      </div>
      {!items.length ? (
        <div className="empty"><Inbox size={28} aria-hidden /><div>Bildirim yok.</div></div>
      ) : (
        items.map((n) => {
          const Icon = ICON[n.type] ?? Bell;
          const isUnread = n.unread && !read.has(n.id);
          return (
            <div key={n.id} className={isUnread ? "notif is-unread" : "notif"}>
              <span className="notif-icon" aria-hidden><Icon size={15} /></span>
              <div className="notif-body">
                {n.link ? <Link href={n.link} onClick={() => isUnread && void mark([n.id])}><strong>{n.title}</strong></Link> : <strong>{n.title}</strong>}
                {n.body && <div className="small muted" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{n.body}</div>}
                <div className="tiny faint">{n.at}</div>
              </div>
              {isUnread && <button className="btn btn-sm btn-ghost" onClick={() => mark([n.id])} aria-label="Okundu say"><CheckCheck size={14} aria-hidden /></button>}
            </div>
          );
        })
      )}
    </section>
  );
}
