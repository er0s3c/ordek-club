import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { completeLesson } from "@/server/academy/service";
import { slugParam } from "@/server/academy/params";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  return json(await completeLesson(actor, slugParam.parse((await params).slug)));
});
