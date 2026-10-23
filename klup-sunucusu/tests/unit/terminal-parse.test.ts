import { describe, expect, it } from "vitest";
import { parseShell, SHELL_LANGS } from "@/components/ui/terminal-parse";

describe("parseShell", () => {
  it("istemsiz liste: her satır komut, açıklama ve boş satır sönük çıktı", () => {
    const lines = parseShell("whoami\n# yorum\n\nls -la\n", "bash");
    expect(lines).toEqual([
      { kind: "cmd", text: "whoami", symbol: "$" },
      { kind: "out", text: "# yorum", comment: true },
      { kind: "out", text: "", comment: true },
      { kind: "cmd", text: "ls -la", symbol: "$" },
    ]);
  });

  it("PowerShell listesinde istem PS>", () => {
    expect(parseShell("Get-Process", "powershell")).toEqual([{ kind: "cmd", text: "Get-Process", symbol: "PS>" }]);
  });

  it("istemli oturum: user@host:yol$ komut ve çıktı satırları", () => {
    const lines = parseShell("ogrenci@lab:~$ id\nuid=1000(ogrenci)\n$ pwd\n/home/ogrenci", "console");
    expect(lines).toEqual([
      { kind: "cmd", user: "ogrenci", host: "lab", path: "~", symbol: "$", text: "id" },
      { kind: "out", text: "uid=1000(ogrenci)" },
      { kind: "cmd", symbol: "$", text: "pwd" },
      { kind: "out", text: "/home/ogrenci" },
    ]);
  });

  it("root istemi (#) komuttur ama tek kelimelik # açıklaması çıktı kalır", () => {
    const lines = parseShell("$ sudo -i\n# whoami root\n# bitti", "bash");
    expect(lines[1]).toEqual({ kind: "cmd", symbol: "#", text: "whoami root" });
    expect(lines[2]).toEqual({ kind: "out", text: "# bitti" });
  });

  it("kabuk dilleri tanınır, diğerleri tanınmaz", () => {
    expect(SHELL_LANGS.has("bash")).toBe(true);
    expect(SHELL_LANGS.has("ps1")).toBe(true);
    expect(SHELL_LANGS.has("python")).toBe(false);
  });
});
