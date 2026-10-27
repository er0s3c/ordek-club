import fs from "node:fs";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
const read = (file: string) => YAML.parse(fs.readFileSync(file, "utf8"));
describe("Docker lab trust boundaries", () => {
  it("keeps Docker control outside the Club application", () => {
    for (const file of ["compose.yaml", "compose.lab-client.yaml"]) {
      const app = read(file).services.app;
      expect(JSON.stringify(app.volumes ?? [])).not.toContain("docker.sock");
      expect(app.privileged).not.toBe(true);
      expect(app.network_mode).not.toBe("host");
    }
  });
  it("runs the controller without root, added capabilities or privileged mode", () => {
    const runner = read("compose.lab.yaml").services["lab-runner"];
    expect(runner.user).toBe("1000:1000");
    expect(runner.privileged).not.toBe(true);
    expect(runner.cap_drop).toEqual(["ALL"]);
    expect(runner.read_only).toBe(true);
    expect(runner.security_opt).toContain("no-new-privileges:true");
    expect(runner.volumes).toHaveLength(1);
    expect(runner.volumes[0].target).toBe("/var/run/docker.sock");
    expect(runner.volumes[0].bind.create_host_path).toBe(false);
  });
  it("never mounts the CA private key or server private key into Club", () => {
    const lab = read("compose.lab.yaml"), client = read("compose.lab-client.yaml");
    expect(JSON.stringify(lab.secrets)).not.toContain("ca-key.pem");
    expect(JSON.stringify(client.secrets)).not.toContain("ca-key.pem");
    expect(JSON.stringify(client.secrets)).not.toContain("server-key.pem");
    expect(client.services.app.secrets).toEqual(["lab_ca", "lab_club_cert", "lab_club_key"]);
  });
  it("binds locally by default and uses mutual TLS for controller health", () => {
    const runner = read("compose.lab.yaml").services["lab-runner"];
    expect(runner.ports).toEqual(["${LAB_BIND_IP:-127.0.0.1}:9443:9443"]);
    expect(runner.healthcheck.test).toEqual(["CMD", "node", "healthcheck.mjs"]);
    expect(runner.environment.LAB_HEALTH_KEY).toBe("/run/secrets/lab_probe_key");
    expect(runner.stop_grace_period).toBe("8m");
  });
});
