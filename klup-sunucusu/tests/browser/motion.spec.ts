import { test, expect } from "@playwright/test";

test("tabs, accordion and native drawer retain data and focus", async ({ page }) => {
  await page.goto("/dashboard?long=1");
  const note = page.locator("#persist-note");
  await note.fill("Korunan kişisel not");
  await page.getByRole("tab", { name: "Terimler · TR/EN" }).click();
  await page.getByRole("tab", { name: "Terimler · TR/EN" }).press("Home");
  await expect(note).toHaveValue("Korunan kişisel not");
  await page.locator("#module-note").fill("Modül içinde korunan not");
  const moduleTrigger = page.getByRole("button", { name: "Modül 1 · Güvenliğe giriş" });
  await moduleTrigger.click();
  await expect(page.locator(".module-accordion-content").first()).toHaveAttribute("inert", "");
  await moduleTrigger.click();
  await expect(page.locator("#module-note")).toHaveValue("Modül içinde korunan not");
  await page.locator("#open-drawer").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator("#drawer-note").fill("Panel notu");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#open-drawer")).toBeFocused();
  await page.locator("#open-drawer").click();
  await expect(page.locator("#drawer-note")).toHaveValue("Panel notu");
  await page.locator("#close-drawer").click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Ara", exact: true }).getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("all seven original Rive poses render under strict CSP without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (["error", "warning"].includes(m.type())) errors.push(m.text()); });
  page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1:3189/")) external.push(r.url()); });
  await page.goto("/dashboard");
  await page.locator("#pose").scrollIntoViewIfNeeded();
  for (const pose of ["wave", "cheer", "search", "sleep", "level", "streak", "encourage"]) {
    await page.locator("#pose").selectOption(pose);
    await expect(page.locator(".duck-mascot")).toHaveAttribute("data-ready", "true");
    await expect(page.locator(".duck-mascot canvas")).toBeVisible();
    if (pose === "cheer") {
      const firstFrame = await page.locator(".duck-mascot canvas").evaluate(n => (n as HTMLCanvasElement).toDataURL());
      await expect.poll(() => page.locator(".duck-mascot canvas").evaluate(n => (n as HTMLCanvasElement).toDataURL()), { timeout: 2000 }).not.toBe(firstFrame);
    }
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  await page.screenshot({ path: "test-results/motion-desktop.png", fullPage: true });
});

test("list changes, progress updates and OS/account reduced movement", async ({ page }) => {
  await page.goto("/dashboard");
  await page.locator("#add-row").click();
  await expect(page.locator("#animated-rows > [data-row]")).toHaveCount(4);
  await page.getByRole("button", { name: "Görev 2 sil", exact: true }).click();
  await expect(page.locator("#animated-rows > [data-row]")).toHaveCount(3);
  await page.locator("#progress-up").click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "48");
  await page.locator("#reduce").check();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.locator(".duck-mascot canvas")).toHaveCount(0);
  await page.locator("#reduce").uncheck();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".duck-mascot canvas")).toHaveCount(0);
  await page.locator("#progress-up").click();
  await expect.poll(() => page.locator("[data-motion-fill]").evaluate(n => Math.round(n.getBoundingClientRect().width / n.parentElement!.clientWidth * 100))).toBe(60);
  await page.locator("#reduce").check();
  await expect(page.locator(".duck-mascot")).toHaveAttribute("data-animation-state", "static");
});

test("personal workspace tabs retain unsaved plans and learning preferences", async ({ page }) => {
  await page.goto("/dashboard?workspace=1");
  await page.getByRole("tab", { name: "Takvim", exact: true }).click();
  await page.getByPlaceholder("DNS dersini tekrar et").fill("Henüz kaydetmediğim plan");
  await page.getByRole("tab", { name: "Notlar ve kayıtlar", exact: true }).click();
  await expect(page.getByText("Kontrol sırasında korunan not")).toBeVisible();
  await page.getByRole("tab", { name: "Takvim", exact: true }).click();
  await expect(page.getByPlaceholder("DNS dersini tekrar et")).toHaveValue("Henüz kaydetmediğim plan");
  await page.getByRole("tab", { name: "Tercihler", exact: true }).click();
  await page.getByLabel("Günlük etkinlik hedefi").selectOption("3");
  await page.getByRole("tab", { name: "Özet", exact: true }).click();
  await page.getByRole("tab", { name: "Tercihler", exact: true }).click();
  await expect(page.getByLabel("Günlük etkinlik hedefi")).toHaveValue("3");
});

test("Rive asset failure falls back to the original SVG", async ({ page }) => {
  await page.route("**/animations/**", route => route.abort());
  await page.goto("/dashboard");
  await page.locator("#pose").scrollIntoViewIfNeeded();
  await expect(page.locator(".duck-mascot")).toHaveAttribute("data-animation-state", "fallback");
  await expect(page.locator(".duck-mascot > svg")).toBeVisible();
  await expect(page.locator(".duck-mascot canvas")).toHaveCount(0);
});

test("long header, keyboard menus, mobile layouts and no horizontal overflow", async ({ page }) => {
  for (const width of [320, 375, 768, 1180, 1200, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/dashboard?long=1&locale=en");
    await page.waitForFunction(() => document.fonts.status === "loaded");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const more = page.locator('[data-menu-trigger="__more"]');
    if (await more.isVisible()) {
      await more.press("ArrowDown");
      const popup = page.locator('[data-header-popup]:not([inert])');
      await expect(popup).toBeVisible();
      await expect.poll(async () => popup.evaluate(n => { const r = n.getBoundingClientRect(); return r.left >= 10 && r.right <= document.documentElement.clientWidth - 10; })).toBe(true);
      await page.keyboard.press("End");
      await page.keyboard.press("Escape");
      await expect(more).toBeFocused();
    } else {
      const burger = page.locator(".hdr-burger");
      await burger.click();
      await expect(page.locator("#mnav")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(burger).toBeFocused();
      await expect(page.locator("#mnav")).toHaveCount(0);
    }
    if (width === 375) await page.screenshot({ path: "test-results/motion-mobile.png", fullPage: true });
  }
});
