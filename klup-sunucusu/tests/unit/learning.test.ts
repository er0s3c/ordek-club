import { describe, expect, it } from "vitest";
import { learningCalendar, nextReview, weekOf } from "@/server/learning/calendar";
describe("learning calendar", () => {
  it("protects once per Monday-based week without inventing active days", () => {
    const r=learningCalendar(["2026-10-19","2026-10-21"],"2026-10-23","2026-10-19");
    expect(r.days.find(d=>d.day==="2026-10-20")?.state).toBe("protected");
    expect(r.days.find(d=>d.day==="2026-10-22")?.state).toBe("missed");
    expect(r.current).toBe(0);expect(r.longest).toBe(2);expect(r.remainingProtection).toBe(0);
  });
  it("does not reset today's streak before the day ends", () => {
    expect(learningCalendar(["2026-10-22"],"2026-10-23","2026-10-23").current).toBe(1);
  });
  it("does not retroactively protect historical gaps", () => {
    const r=learningCalendar(["2026-10-19","2026-10-21"],"2026-10-21","2026-10-21");expect(r.current).toBe(1);expect(r.longest).toBe(1);
  });
  it("exam protection preserves but never grows a streak or spends weekly allowance",()=>{
    const r=learningCalendar(["2026-10-19"],"2026-10-23","2026-10-19",[{startsOn:"2026-10-20",endsOn:"2026-10-23"}]);expect(r.current).toBe(1);expect(r.remainingProtection).toBe(1);expect(r.days.filter(d=>d.state==="exam")).toHaveLength(3);
  });
  it("handles year boundaries and duplicate dates",()=>{
    expect(weekOf("2027-01-01")).toBe("2026-12-28");
    expect(learningCalendar(["2026-12-31","2026-12-31","2027-01-01"],"2027-01-01","2026-12-31").current).toBe(2);
  });
  it("does not create a streak for someone who never studied",()=>expect(learningCalendar([],"2026-10-23","2026-10-19").current).toBe(0));
});
describe("review intervals",()=>{
  const now=new Date("2026-10-23T10:00:00Z");
  it("schedules 3/10/30-day intervals and resets after a mistake",()=>{
    expect(nextReview(false,1,now).dueAt.toISOString()).toBe("2026-10-26T10:00:00.000Z");
    expect(nextReview(true,0,now).dueAt.toISOString()).toBe("2026-11-02T10:00:00.000Z");
    expect(nextReview(true,1,now)).toMatchObject({closed:true,consecutive:2});
    expect(nextReview(true,1,now).dueAt.toISOString()).toBe("2026-11-22T10:00:00.000Z");
  });
});
