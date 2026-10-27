"use client";
import { DuckMascot } from "./DuckMascot";

// The count and activity come from the server. Protected days do not trigger a reward.
export function StreakMilestone({ count, day, active }: { count: number; day: string; active: boolean }) {
  if (!active || ![3, 7, 14, 30, 60, 100, 180, 365].includes(count)) return null;
  return <DuckMascot pose="streak" size={48} eventId={`streak:${day}:${count}`} />;
}
