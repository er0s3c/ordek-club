import fs from "node:fs";
import path from "node:path";
import{loadAcademy}from"./content";
import{auditPilotDrafts}from"./draft-audit";
import{coreReadiness}from"@/lib/academy-curriculum";
import{env}from"@/server/env";
// Pilot hazırlığı iki ayrı soruyu yanıtlar: (1) SK-101 canlı akademide yayında mı, (2) editör taslakları
// (content/pilot) ne durumda. Taslaklar inceleme onayı olmadan canlıya alınmaz; bu yüzden ikisi ayrı gösterilir.
export function pilotReadiness(){
  const loaded=loadAcademy(env().academyDir);
  const live=coreReadiness(loaded.tracks.filter(t=>t.code==="SK-101").flatMap(t=>t.lessons));
  const draftDir=path.join(path.dirname(env().academyDir),"pilot");
  const drafts=fs.existsSync(path.join(draftDir,"sk101"))?auditPilotDrafts(draftDir):null;
  return{...live,contentProblems:loaded.problems,drafts};
}
