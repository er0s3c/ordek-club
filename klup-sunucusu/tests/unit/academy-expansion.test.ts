import{describe,it,expect}from"vitest";
import{activitiesSchema,gradeActivity,publicActivity,translationCompatible,type Activity}from"@/lib/academy-activities";
import{gradePlacement,placementQuestions}from"@/server/academy/placement";
import{visibleEvidence,scenario}from"@/server/learning/operation-scenario";
import{evidenceIndex}from"@/server/learning/practice-data";
const fixtures:Activity[]=activitiesSchema.parse([
 {id:"choice",kind:"choice",prompt:"Choose",options:["a","b"],answer:1,explanation:"Why"},
 {id:"fill",kind:"fill",prompt:"Fill",answers:["DNS"],caseSensitive:false,explanation:"Why"},
 {id:"command",kind:"command",prompt:"Command",answers:["chmod 600 incident.txt"],explanation:"Why"},
 {id:"log",kind:"log",prompt:"Log",options:["success","failed"],answer:1,explanation:"Why"},
 {id:"match",kind:"match",prompt:"Match",left:["a","b"],right:["B","A"],answer:[1,0],explanation:"Why"},
 {id:"order",kind:"order",prompt:"Order",options:["second","first"],answer:[1,0],explanation:"Why"},
 {id:"http",kind:"http",prompt:"HTTP",answers:["GET / HTTP/1.1\nHost: lab.example"],explanation:"Why"},
 {id:"code",kind:"code",prompt:"Code",options:["parameter","concat"],answer:1,explanation:"Why"},
]);
describe("eight validated activity types",()=>{
 it("grades every type and accepts CRLF consistently",()=>{const answers=[["1"],["dns"],["chmod 600 incident.txt"],["1"],["1","0"],["1","0"],["GET / HTTP/1.1\r\nHost: lab.example"],["1"]];fixtures.forEach((a,i)=>expect(gradeActivity(a,answers[i]!),a.id).toBe(true));});
 it("never exposes answer keys or explanations in public payloads",()=>{for(const a of fixtures){const p=publicActivity(a);expect(Object.keys(p)).not.toContain("answer");expect(Object.keys(p)).not.toContain("answers");expect(Object.keys(p)).not.toContain("explanation");}});
 it("does not interpret shell syntax or accept extra answer fields",()=>{expect(gradeActivity(fixtures[2]!,["chmod 600 incident.txt; touch /tmp/pwn"])).toBe(false);expect(gradeActivity(fixtures[0]!,["1","0"])).toBe(false);});
 it("rejects impossible keys, duplicate identities and invalid orderings",()=>{expect(activitiesSchema.safeParse([{...fixtures[0],answer:99}]).success).toBe(false);expect(activitiesSchema.safeParse([fixtures[0],fixtures[0]]).success).toBe(false);expect(activitiesSchema.safeParse([{...fixtures[5],answer:[0,0]}]).success).toBe(false);});
 it("keeps identity and grading structure across translations",()=>{expect(translationCompatible(fixtures,fixtures.map(a=>({...a,prompt:"Translated"})))).toBe(true);expect(translationCompatible(fixtures,fixtures.slice(1))).toBe(false);expect(translationCompatible(fixtures,[{...fixtures[0]!,id:"changed"},...fixtures.slice(1)])).toBe(false);});
});
describe("placement",()=>{
 it("has ten original diagnostic items and rewards no points",()=>{expect(placementQuestions).toHaveLength(10);const result=gradePlacement(placementQuestions.map(q=>q.answer));expect(result.score).toBe(100);expect(result).not.toHaveProperty("xp");expect(result.skills.every(s=>s.correct===s.total)).toBe(true);});
 it("rejects missing, out-of-range and non-integer answers",()=>{expect(()=>gradePlacement([])).toThrow();expect(()=>gradePlacement(Array(10).fill(3))).toThrow();expect(()=>gradePlacement(Array(10).fill(.5))).toThrow();});
});
describe("operation evidence boundaries",()=>{
 it("initially exposes only a team's own evidence",()=>{for(let team=0;team<3;team++)expect(visibleEvidence(team,false,0)).toEqual([scenario.evidence[team]]);});
 it("supports a solo student and released evidence in the second stage",()=>{expect(visibleEvidence(0,true,0)).toHaveLength(3);expect(visibleEvidence(2,false,1)).toHaveLength(3);});
 it("provides a result for every valid teacher decision",()=>{expect(scenario.stages).toHaveLength(2);for(const stage of scenario.stages)expect(stage.outcomes).toHaveLength(stage.choices.length);});
});
it("daily evidence is stable during a civil day and rotates",()=>{expect(evidenceIndex("2026-10-24")).toBe(evidenceIndex("2026-10-24"));expect(evidenceIndex("2026-10-24")).not.toBe(evidenceIndex("2026-10-25"));});
