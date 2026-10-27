import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { thank, thanksSchema } from "@/server/study/buddies";

export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  return json({ created: await thank(actor, await readJson(req, thanksSchema)) });
});
