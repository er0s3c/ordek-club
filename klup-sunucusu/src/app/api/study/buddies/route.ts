import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { createPost, listPosts, postSchema } from "@/server/study/buddies";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("study");
  return json({ posts: await listPosts(actor) });
});
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const p = await createPost(actor, await readJson(req, postSchema));
  return json({ id: p.id }, { status: 201 });
});
