import { describe, expect, it } from "vitest";
import { visibleHeaderEntries } from "@/lib/header-layout";
describe("header overflow navigation", () => {
  it("keeps all links when they fit, including at the exact boundary", () => {
    expect(visibleHeaderEntries([90, 120, 100], 310, 80)).toBe(3);
  });
  it("reserves space for the overflow button instead of covering account controls", () => {
    expect(visibleHeaderEntries([90, 120, 100, 110], 350, 80)).toBe(2);
  });
  it("preserves menu order and can place all groups in the overflow menu", () => {
    expect(visibleHeaderEntries([200, 80, 80], 180, 80)).toBe(0);
  });
  it("recalculates for wider text and a translated overflow trigger", () => {
    expect(visibleHeaderEntries([130, 160, 150], 400, 120)).toBe(1);
    expect(visibleHeaderEntries([90, 100, 100], 400, 120)).toBe(3);
  });
});
