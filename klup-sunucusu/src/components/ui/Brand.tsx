import type { PublicSettings } from "@/server/settings";

// Kulüp logosu (yüklenmişse) ya da baş harf rozeti. Logo URL'sine sürüm eklenir (önbellek kırma).
export function BrandMark({ settings, size }: { settings: Pick<PublicSettings, "clubName" | "hasLogo" | "logoVersion">; size?: number }) {
  const style = size ? { width: size, height: size } : undefined;
  if (settings.hasLogo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="brand-logo" style={style} src={`/api/branding/logo?v=${settings.logoVersion}`} alt="" />;
  }
  return (
    <span className="brand-logo" style={style} aria-hidden>
      {settings.clubName.trim().charAt(0).toLocaleUpperCase("tr") || "Ö"}
    </span>
  );
}
