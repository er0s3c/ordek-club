import type { PublicSettings } from "@/server/settings";

// Kulüp logosu: yönetimden yüklenmişse o, değilse kulübün varsayılan işareti (public/brand/club-mark.png).
// Logo URL'sine sürüm eklenir (önbellek kırma).
export function BrandMark({ settings, size }: { settings: Pick<PublicSettings, "clubName" | "hasLogo" | "logoVersion">; size?: number }) {
  const style = size ? { width: size, height: size } : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="brand-logo" style={style} src={settings.hasLogo ? `/api/branding/logo?v=${settings.logoVersion}` : "/brand/club-mark.png"} alt="" />;
}
