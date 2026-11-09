// Canlı sınıf skor tablosu (sınıf modu). Öğrenci → kendi sınıfı; öğretmen → tüm sınıfları.
// Flag sayısına göre sıralı (rankStudents). ⚠ FLAG/secret YOK — yalnız sayılar + adlar.
import { getSession } from "@/lib/session";
import { getUserById, studentsOfClass, studentsOfTeacher } from "@/lib/accounts";
import { getAllUserProgress } from "@/lib/progress";
import { rankStudents } from "@/app/labLogic";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (process.env.LAB_MODE !== "class") return Response.json({ rows: [], meId: null, role: null });
  const sess = getSession(req);
  if (!sess) return Response.json({ error: "yetkisiz" }, { status: 403 });
  const me = getUserById(sess.userId);
  if (!me) return Response.json({ error: "yetkisiz" }, { status: 403 });

  const students = me.role === "teacher" ? studentsOfTeacher(me.id) : (me.classId ? studentsOfClass(me.classId) : []);

  // Performance optimization: Batch load all student progress once with getAllUserProgress()
  // to avoid N synchronous fs.readFileSync + JSON.parse operations inside the loop.
  // Note: getAllUserProgress() returns { [userId]: { [slug]: [levels] } }, so
  // allProgress[s.id] is equivalent to getUserProgress(s.id).solved.
  // Reduces disk I/O from O(N) to O(1) reads per leaderboard request.
  const allProgress = getAllUserProgress();

  const rows = students.map((s) => {
    // allProgress[s.id] is the map of { [slug]: [levels] }, identical to getUserProgress(s.id).solved
    const userEntry = allProgress && allProgress[s.id];
    const solved = (userEntry && typeof userEntry === "object" ? (userEntry.solved || userEntry) : {});
    const count = Object.values(solved).reduce((a, ls) => a + (Array.isArray(ls) ? ls.length : 0), 0);
    return { id: s.id, name: s.displayName || s.username, count, classId: s.classId };
  });
  return Response.json({ rows: rankStudents(rows), meId: me.id, role: me.role });
}
