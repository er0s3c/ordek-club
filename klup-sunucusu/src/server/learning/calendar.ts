// Calendar arithmetic uses civil dates, never the host's local timezone.
export const shiftDay = (day: string, amount: number) => new Date(Date.parse(`${day}T12:00:00Z`) + amount * 86_400_000).toISOString().slice(0, 10);
export const weekOf = (day: string) => shiftDay(day, -((new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7));
export type DayState = "active" | "protected" | "exam" | "missed" | "pending";
export function learningCalendar(activeDays: string[], today: string, protectionStart: string, exams: { startsOn: string; endsOn: string }[] = []) {
  const active = new Set(activeDays.filter(d => d <= today));
  const first = [...active].sort()[0];
  const days: { day: string; state: DayState }[] = [];
  let current = 0, longest = 0;
  const usedWeeks = new Set<string>();
  if (first) for (let day = first; day <= today; day = shiftDay(day, 1)) {
    let state: DayState;
    if (active.has(day)) { state = "active"; current++; }
    else if (day === today) state = "pending";
    else if (current > 0 && day >= protectionStart && exams.some(e => day >= e.startsOn && day <= e.endsOn)) state = "exam";
    else if (current > 0 && day >= protectionStart && !usedWeeks.has(weekOf(day))) { state = "protected"; usedWeeks.add(weekOf(day)); }
    else { state = "missed"; current = 0; }
    longest = Math.max(longest, current);
    days.push({ day, state });
  }
  return { current, longest, remainingProtection: usedWeeks.has(weekOf(today)) ? 0 : 1, days };
}

export function nextReview(correct: boolean, consecutive: number, now: Date) {
  const next = correct ? consecutive + 1 : 0;
  return { consecutive: Math.min(next, 2), closed: next >= 2, dueAt: new Date(now.getTime() + (next >= 2 ? 30 : next === 1 ? 10 : 3) * 86_400_000) };
}
