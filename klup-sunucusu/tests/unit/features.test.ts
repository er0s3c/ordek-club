import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/server/db", () => ({ db: { featureSwitch: { findUnique } } }));
import { featureEnabled, featureSwitch, requireFeature } from "@/server/learning/features";

const missingTable = (table: string) => new Prisma.PrismaClientKnownRequestError("missing table", {
  code: "P2021", clientVersion: Prisma.prismaVersion.client, meta: { table },
});

describe("feature switches during schema upgrades", () => {
  beforeEach(() => {
    findUnique.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("keeps an unconfigured feature disabled", async () => {
    findUnique.mockResolvedValue(null);
    expect(await featureEnabled("learning")).toBe(false);
    expect(findUnique).toHaveBeenCalledWith({ where: { key: "learning" } });
  });

  it("preserves the stored enablement time used by streak protection", async () => {
    const flag = { key: "learning", enabled: true, enabledAt: new Date("2026-10-24T12:00:00Z") };
    findUnique.mockResolvedValue(flag);
    expect(await featureEnabled("learning")).toBe(true);
    expect(await featureSwitch("learning")).toEqual(flag);
    findUnique.mockResolvedValue({ ...flag, enabled: false });
    expect(await featureEnabled("learning")).toBe(false);
  });

  it("fails closed for the missing feature table and still denies feature routes", async () => {
    findUnique.mockRejectedValue(missingTable("public.FeatureSwitch"));
    expect(await featureEnabled("learning")).toBe(false);
    await expect(requireFeature("learning")).rejects.toMatchObject({ status: 404 });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("npm run db:migrate"));
  });

  it("does not hide missing unrelated tables or connection failures", async () => {
    for (const error of [missingTable("public.Lesson"), new Error("connection failed")]) {
      findUnique.mockRejectedValue(error);
      await expect(featureEnabled("learning")).rejects.toBe(error);
    }
  });
});
