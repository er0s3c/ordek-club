import { z } from "zod";
import { route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { exportDeck } from "@/server/presentations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  const deck = await exportDeck(actor, z.string().min(1).max(64).parse((await params).id));
  // Dosya adı sunucuda üretilir (başlık enjeksiyonu yok); yalnız ASCII güvenli karakterler.
  const slug = deck.title.normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "sunum";
  return new Response(JSON.stringify(deck, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ordek-deck.json"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
