"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";

// Kulüp işleri ekranlarının ortak eylem çağrısı: başarıda bildirim + sayfa tazeleme.
export function useClubAction() {
  const router = useRouter();
  const toast = useToast();
  return async <T,>(body: Record<string, unknown>, ok?: string): Promise<T | null> => {
    try {
      const r = await api<T>("/api/club", { body });
      if (ok) toast("ok", ok);
      router.refresh();
      return r;
    } catch (e) {
      toast("error", (e as Error).message);
      return null;
    }
  };
}
