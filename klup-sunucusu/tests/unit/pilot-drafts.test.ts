import path from"node:path";
import{it,expect}from"vitest";
import{auditPilotDrafts}from"@/server/academy/draft-audit";
it("contains all 28 bilingual lesson drafts and 7 lab drafts without fabricating review approval",()=>{
 const result=auditPilotDrafts(path.resolve(__dirname,"../../content/pilot"));
 expect(result.problems).toEqual([]);expect(result.lessons).toBe(28);expect(result.labs).toBe(7);expect(result.bilingualPairs).toBe(35);expect(result.activityKinds).toHaveLength(8);expect(result.reviewedPairs).toBe(0);expect(result.publishable).toBe(false);
});
