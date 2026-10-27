"use client";
// v86: öğrencinin tarayıcısında, WebAssembly ile çalışan küçük bir Linux sanal makinesi. Ağ kartı yoktur
// (dışarıya trafik çıkamaz); kapatınca her şey silinir. BIOS ve disk görüntüleri lisansları gereği depoya
// eklenmez: yönetici public/vendor/v86-images altına koyar ve manifest.json ile tanımlar.
import { useEffect, useRef, useState } from "react";
import { Power, RotateCcw } from "lucide-react";
import { useT } from "@/i18n/client";

type Manifest = { title: string; bios: string; vgaBios: string; cdrom?: string; hda?: string; memoryMb?: number; notes?: string };
type Emulator = { destroy: () => Promise<void> | void; restart: () => void; add_listener: (ev: string, fn: () => void) => void; keyboard_send_text?: (s: string) => void };

const BASE = "/vendor/v86-images/";
const RUNTIME = "/vendor/v86/libv86.mjs";
// Görüntü yolları yalnız bu klasörün içinden, düz dosya adı olabilir.
const safe = (f?: string) => (f && /^[\w.-]+$/.test(f) ? BASE + f : undefined);

export function BrowserLinux() {
  const t = useT();
  const screen = useRef<HTMLDivElement>(null);
  const emu = useRef<Emulator | null>(null);
  const [manifest, setManifest] = useState<Manifest | null | "missing">(null);
  const [state, setState] = useState<"idle" | "booting" | "running" | "error">("idle");

  useEffect(() => {
    let live = true;
    fetch(`${BASE}manifest.json`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((m: Manifest | null) => live && setManifest(m && safe(m.bios) && safe(m.vgaBios) && (safe(m.cdrom) || safe(m.hda)) ? m : "missing")).catch(() => live && setManifest("missing"));
    return () => { live = false; void emu.current?.destroy(); emu.current = null; };
  }, []);

  async function start() {
    if (!manifest || manifest === "missing" || !screen.current) return;
    setState("booting");
    try {
      const { V86 } = (await import(/* webpackIgnore: true */ RUNTIME)) as { V86: new (o: object) => Emulator };
      const e = new V86({
        wasm_path: "/vendor/v86/v86.wasm",
        memory_size: Math.min(512, Math.max(64, manifest.memoryMb ?? 128)) * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
        screen_container: screen.current,
        bios: { url: safe(manifest.bios) },
        vga_bios: { url: safe(manifest.vgaBios) },
        ...(manifest.cdrom ? { cdrom: { url: safe(manifest.cdrom) } } : { hda: { url: safe(manifest.hda), async: true } }),
        autostart: true,
        disable_speaker: true,
      });
      e.add_listener("emulator-ready", () => setState("running"));
      emu.current = e;
    } catch {
      setState("error");
    }
  }

  async function stop() { await emu.current?.destroy(); emu.current = null; setState("idle"); screen.current?.querySelector("canvas")?.getContext("2d")?.reset?.(); }

  if (manifest === null) return <div className="skeleton" style={{ height: 120 }} />;
  if (manifest === "missing") return (
    <section className="card card-b stack-sm">
      <strong>{t("Tarayıcıda Linux henüz kurulmadı")}</strong>
      <p className="small muted" style={{ margin: 0 }}>{t("Yönetici, v86 için BIOS (SeaBIOS, VGA BIOS) ve küçük bir Linux görüntüsünü")}{" "}<code>public/vendor/v86-images/</code>{" "}{t("klasörüne koyup")}{" "}<code>manifest.json</code>{" "}{t("ekleyince bu laboratuvar açılır. Ayrıntılar:")}{" "}<code>docs/V86-LAB.md</code>.</p>
    </section>
  );
  return (
    <section className="card stack-sm" aria-label={t("Tarayıcıda Linux")}>
      <div className="card-h">
        <h2>{manifest.title}</h2>
        <div className="row">
          {state === "idle" || state === "error" ? <button type="button" className="btn btn-sm btn-primary" onClick={start}><Power size={14} aria-hidden />{" "}{t("Başlat")}</button> : (
            <><button type="button" className="btn btn-sm" onClick={() => emu.current?.restart()}><RotateCcw size={14} aria-hidden />{" "}{t("Yeniden başlat")}</button><button type="button" className="btn btn-sm btn-ghost" onClick={stop}><Power size={14} aria-hidden />{" "}{t("Kapat")}</button></>
          )}
        </div>
      </div>
      <div className="card-b stack-sm">
        <span className="tiny faint" role="status">{state === "booting" ? t("Açılıyor… (ilk açılış görüntü boyutuna göre birkaç saniye sürer)") : state === "running" ? t("Çalışıyor · ağ bağlantısı yok · kapatınca sıfırlanır") : state === "error" ? t("Başlatılamadı; tarayıcın WebAssembly'yi desteklemiyor olabilir.") : t("Kapalı")}{manifest.notes ? ` · ${manifest.notes}` : ""}</span>
        <div ref={screen} className="v86-screen" tabIndex={0} aria-label={t("Sanal makine ekranı; yazmak için tıkla")}>
          <div style={{ whiteSpace: "pre", font: "14px monospace", lineHeight: "14px" }} />
          <canvas style={{ display: "none" }} />
        </div>
      </div>
    </section>
  );
}
