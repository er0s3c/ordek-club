import path from"node:path";
import{auditPilotDrafts}from"../src/server/academy/draft-audit";
const result=auditPilotDrafts(path.resolve("content/pilot"));
console.log(JSON.stringify(result,null,2));
if(result.problems.length)process.exitCode=1;
