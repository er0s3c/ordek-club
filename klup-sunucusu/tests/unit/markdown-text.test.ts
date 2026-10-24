import { describe, expect, it } from "vitest";
import { decode, stripTags } from "@/components/academy/markdown-text";

describe("stripTags", () => {
  it("etiketleri siler, metni korur", () => {
    expect(stripTags("<summary>Kontrol <b>listesi</b></summary>")).toBe("Kontrol listesi");
  });

  it("iç içe, parçalı ve kodlanmış etiketlerden '<script' kalmaz", () => {
    for (const s of ["<scr<script>ipt>alert(1)</script>", "&lt;script&gt;x&lt;/script&gt;", "<<script>script>y", "a <img src=x onerror=1"]) {
      expect(stripTags(s)).not.toMatch(/<|>/);
    }
    expect(stripTags("<scr<script>ipt>alert(1)</script>")).toBe("iptalert(1)");
  });

  it("decode yalnız bilinen varlıkları çözer", () => {
    expect(decode("a &amp; b &copy;")).toBe("a & b &copy;");
  });
});
