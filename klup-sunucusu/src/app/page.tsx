import { redirect } from "next/navigation";
import { currentSession } from "@/server/auth/page-guard";
import { isSetupComplete } from "@/server/settings";

export default async function Index() {
  if (!(await isSetupComplete())) redirect("/setup");
  redirect((await currentSession()) ? "/dashboard" : "/login");
}
