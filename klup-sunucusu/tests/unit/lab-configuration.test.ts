import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LAB_ENV_KEYS, labConfigurationStatus, labConnection, labRequest } from "@/server/learning/lab-client";

describe("Linux lab configuration", () => {
  beforeEach(() => { for (const key of LAB_ENV_KEYS) vi.stubEnv(key, ""); });
  afterEach(() => vi.unstubAllEnvs());

  function certificates() {
    vi.stubEnv("CLUB_LAB_CA", "missing-lab-ca.pem");
    vi.stubEnv("CLUB_LAB_CERT", "missing-lab-client.pem");
    vi.stubEnv("CLUB_LAB_KEY", "missing-lab-key.pem");
  }

  it("reports all missing names without exposing environment values", () => {
    expect(labConfigurationStatus()).toMatchObject({ configured: false, missing: [...LAB_ENV_KEYS] });
  });
  it("does not try to start a session before setup", async () => {
    await expect(labRequest("test-user", "start")).rejects.toMatchObject({ status: 503, code: "LAB_NOT_CONFIGURED" });
  });
  it.each(["not a URL", "http://lab.example:9443", "https://name:secret@lab.example", "https://lab.example/path", "https://lab.example/?token=secret"]) ("rejects an invalid endpoint without leaking it: %s", url => {
    certificates(); vi.stubEnv("CLUB_LAB_URL", url);
    expect(() => labConnection()).toThrow("Lab adresi geçersiz.");
    expect(labConfigurationStatus()).toEqual({ configured: false, missing: [], message: "Lab adresi geçersiz." });
  });
  it("reports unreadable certificates as a controlled setup error", () => {
    certificates(); vi.stubEnv("CLUB_LAB_URL", "https://lab.example:9443");
    expect(() => labConnection()).toThrow("Lab sertifikaları okunamıyor veya geçersiz.");
    const status = labConfigurationStatus();
    expect(status.configured).toBe(false);
    expect(status.message).not.toContain("missing-lab");
  });
});
