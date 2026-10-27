import { describe, expect, it } from "vitest";
import { reduceMotion, progressPercent } from "@/lib/motion-tokens";

describe("movement preferences", () => {
  it("requires both OS and account to permit motion", () => {
    expect(reduceMotion(false, false)).toBe(false);
    expect(reduceMotion(true, false)).toBe(true);
    expect(reduceMotion(false, true)).toBe(true);
    expect(reduceMotion(true, true)).toBe(true);
    expect(reduceMotion(false, false, false)).toBe(true);
  });
  it("keeps malformed progress values inside the bar", () => {
    expect(progressPercent(2, 7)).toBe(29);
    expect(progressPercent(-1, 10)).toBe(0);
    expect(progressPercent(12, 10)).toBe(100);
    expect(progressPercent(1, 0)).toBe(0);
    expect(progressPercent(NaN, 10)).toBe(0);
  });
});
