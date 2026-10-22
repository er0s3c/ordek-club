import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/Brand";
import { getSettings, publicSettings } from "@/server/settings";

export async function AuthCard({ title, sub, wide, children }: { title: string; sub?: ReactNode; wide?: boolean; children: ReactNode }) {
  const s = publicSettings(await getSettings());
  return (
    <div className="auth-wrap">
      <div className={`auth-card fade-up${wide ? " wide" : ""}`}>
        <div className="auth-head">
          <BrandMark settings={s} />
          <div>
            <div className="eyebrow">{s.clubName}{s.universityName ? ` · ${s.universityName}` : ""}</div>
            <h1 className="page-title">{title}</h1>
            {sub && <p className="page-sub">{sub}</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-b">{children}</div>
        </div>
      </div>
    </div>
  );
}
