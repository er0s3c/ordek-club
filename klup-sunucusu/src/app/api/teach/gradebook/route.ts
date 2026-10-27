import { memberContext } from "@/server/api-auth";
import { route } from "@/server/http";
import { gradebookCsv } from "@/server/classroom/grading";

// Not çizelgesi: görev × öğrenci puanları, Excel uyumlu (UTF-8 BOM, noktalı virgül).
export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  const group = new URL(req.url).searchParams.get("group") ?? undefined;
  const csv = await gradebookCsv(actor, group);
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-cizelgesi-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
});
