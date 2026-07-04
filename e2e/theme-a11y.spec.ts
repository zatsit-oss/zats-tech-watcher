import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/config.ts";

test.describe("Dark Mode", () => {
  test("default theme is light", async ({ page }) => {
    await page.goto("/");
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("light");
  });

  test("theme toggle switches to dark", async ({ page }) => {
    await page.goto("/");
    await page.click("#theme-toggle");
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");
  });

  test("theme persists across navigation", async ({ page }) => {
    await page.goto("/");
    await page.click("#theme-toggle");
    await page.goto("/stats/");
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");
  });

  test("theme persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.click("#theme-toggle");
    await page.reload();
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");
  });
});

test.describe("Accessibility", () => {
  test("skip link is present and focusable", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    // Tab to focus the skip link
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
  });

  test("main content landmark exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("nav has aria-label", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="Navigation principale"]');
    await expect(nav).toBeAttached();
  });

  test("external links have rel=noopener noreferrer", async ({ page }) => {
    await page.goto("/");
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const rel = await externalLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });

  test("mobile menu button has aria-expanded", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#mobile-menu-btn");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("page has lang=fr", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("fr");
  });

  test("heading hierarchy: h1 is present on each page", async ({ page }) => {
    const pages = [
      "/",
      ...(siteConfig.showRanking ? ["/contributors/"] : []),
      "/timeline/",
      "/stats/",
      "/tags/",
      "/activity/",
    ];
    for (const url of pages) {
      await page.goto(url);
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();
    }
  });
});
