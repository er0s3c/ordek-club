import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { createIssue, issueSchema, listIssues, myIssues } from "@/server/issues";
import { isStaff } from "@/server/auth/policy";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  const url = new URL(req.url);
  if (url.searchParams.get("scope") === "all" && isStaff(actor.role)) return json({ issues: await listIssues(actor, url.searchParams.get("status") ?? undefined) });
  return json({ issues: await myIssues(actor) });
});
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  return json(await createIssue(actor, await readJson(req, issueSchema)), { status: 201 });
});
