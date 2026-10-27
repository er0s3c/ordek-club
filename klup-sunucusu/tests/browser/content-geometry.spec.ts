// İçerik yerleşimi: çizgi roman balonları panel sınırında mı, birbirine biniyor mu? Bu test gerçek
// sayfalarda ölçer (geliştirme sunucusu + test hesabı gerekir). Ortam değişkenleri yoksa atlanır:
//   CLUB_E2E_BASE=http://127.0.0.1:3100 CLUB_E2E_USER=... CLUB_E2E_PASS=...
// Çalıştırma: npx playwright test --config playwright.content.config.ts
import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.CLUB_E2E_BASE;
const USER = process.env.CLUB_E2E_USER;
const PASS = process.env.CLUB_E2E_PASS;
const ready = !!(BASE && USER && PASS);
test.skip(!ready, "CLUB_E2E_BASE / CLUB_E2E_USER / CLUB_E2E_PASS tanımlı değil");

const CONTENT = path.resolve(__dirname, "../../content/academy");
function lessonSlugs() {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "gorseller" && e.name !== "lab") walk(p);
      } else if (e.name.endsWith(".md") && !e.name.endsWith(".en.md") && dir !== CONTENT) {
        const m = fs.readFileSync(p, "utf8").match(/^id:\s*(\S+)/m);
        if (m) out.push(m[1]!);
      }
    }
  };
  walk(CONTENT);
  return out.sort();
}

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="login"]', USER!);
  await page.fill('input[name="password"]', PASS!);
  await page.press('input[name="password"]', "Enter");
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
}

// Bir paneldeki metin kutularının panel içinde kaldığını ve çakışmadığını ölçer.
async function measure(page: Page) {
  return page.evaluate(() => {
    const problems: string[] = [];
    let panels = 0;
    for (const fig of document.querySelectorAll("section[lang] figure")) {
      const fb = fig.getBoundingClientRect();
      if (fb.width < 40 || fb.height < 40) continue;
      panels++;
      const boxes = [...fig.querySelectorAll("figcaption, [class*=bubble], [class*=sfx]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { cls: String(el.className).split(" ")[0] ?? "?", x: r.x - fb.x, y: r.y - fb.y, w: r.width, h: r.height, text: (el.textContent ?? "").trim().slice(0, 30) };
      });
      boxes.forEach((b, i) => {
        if (b.x < -1 || b.y < -1 || b.x + b.w > fb.width + 1 || b.y + b.h > fb.height + 1)
          problems.push(`taşma: ${b.cls} "${b.text}" (${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}) panel ${Math.round(fb.width)}x${Math.round(fb.height)}`);
        for (let j = i + 1; j < boxes.length; j++) {
          const c = boxes[j]!;
          const ox = Math.min(b.x + b.w, c.x + c.w) - Math.max(b.x, c.x);
          const oy = Math.min(b.y + b.h, c.y + c.h) - Math.max(b.y, c.y);
          if (ox > 2 && oy > 2) problems.push(`çakışma: "${b.text}" ↔ "${c.text}" (${Math.round(ox)}x${Math.round(oy)}px)`);
        }
      });
    }
    return { panels, problems };
  });
}

const VIEWPORTS = [
  { name: "mobil", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 900 },
  { name: "masaüstü", width: 1280, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`çizgi roman balonları panel içinde (${vp.name})`, async ({ page }) => {
    test.setTimeout(15 * 60_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await login(page);
    const slugs = lessonSlugs();
    expect(slugs.length).toBeGreaterThan(170);
    const failures: string[] = [];
    for (const slug of slugs) {
      for (const lang of ["tr", "en"]) {
        await page.goto(`${BASE}/academy/lesson/${slug}?lang=${lang}`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");
        // Panel animasyonları görünüm alanına bağlı; hepsini görünür kılıp ölçüyoruz.
        await page.evaluate(() => document.querySelectorAll("section[lang]").forEach((s) => s.scrollIntoView()));
        await page.waitForTimeout(150);
        const r = await measure(page);
        if (r.problems.length) failures.push(`${slug} (${lang}): ${r.problems.slice(0, 3).join(" | ")}`);
      }
    }
    expect(failures, failures.slice(0, 15).join("\n")).toEqual([]);
  });
}

test("ders diyagramları İngilizce metin gösterir", async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  const samples = ["m05-04", "m05-10", "a-11", "e-09"];
  for (const slug of samples) {
    await page.goto(`${BASE}/academy/lesson/${slug}?lang=en`, { waitUntil: "domcontentloaded" });
    const fig = page.locator("figure.lesson-anim").first();
    if ((await fig.count()) === 0) continue;
    await fig.scrollIntoViewIfNeeded();
    const text = (await fig.innerText()).replace(/\s+/g, " ");
    expect(text, slug).not.toMatch(/[ğĞışŞ]/);
    expect(text.length, slug).toBeGreaterThan(20);
  }
});
