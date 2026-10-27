import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { translationDetail } from "@/server/teaching/translations";

// Tek dersin iki dili (inceleme ekranı için).
export const GET = route(async (req, { params }: { params: Promise<{ slug: string }> }) => {
  await memberContext(req);
  await requireFeature("teacher-plus");
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return json({ error: { code: "BAD_REQUEST", message: "Geçersiz ders kimliği." } }, { status: 400 });
  return json(await translationDetail(slug));
});
