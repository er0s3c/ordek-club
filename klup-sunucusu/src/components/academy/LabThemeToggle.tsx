"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "ciu-lab-theme";

// Ders odası varsayılan açık (C dili); koyu oda (§5A) kişisel tercih olarak açılır ve bu tarayıcıda hatırlanır.
export function LabThemeToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      setDark(localStorage.getItem(KEY) === "dark");
    } catch {
      /* depolama kapalı: açık oda */
    }
  }, []);

  useEffect(() => {
    const room = ref.current?.closest<HTMLElement>(".lab-room");
    if (!room) return;
    if (dark) room.dataset.theme = "dark";
    else delete room.dataset.theme;
  }, [dark]);

  function toggle() {
    const v = !dark;
    setDark(v);
    try {
      localStorage.setItem(KEY, v ? "dark" : "light");
    } catch {
      /* yalnız bu oturum için */
    }
  }

  return (
    <button ref={ref} type="button" className="lab-theme" aria-pressed={dark} onClick={toggle}>
      {dark ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />} {dark ? "Açık oda" : "Koyu oda"}
    </button>
  );
}
