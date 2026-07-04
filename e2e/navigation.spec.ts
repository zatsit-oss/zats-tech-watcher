import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/config.ts";

test.describe("Navigation", () => {
  test("home page loads and shows title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Veille Technologique");
  });

  test("home page shows entry count", async ({ page }) => {
    await page.goto("/");
    const count = page.locator("#result-count");
    await expect(count).toBeVisible();
    const text = await count.textContent();
    expect(Number(text)).toBeGreaterThan(0);
  });

  test("navigates to contributors page", async ({ page }) => {
    test.skip(!siteConfig.showRanking, "contributor ranking is disabled");
    await page.goto("/");
    await page.click('a[href="/contributors/"]');
    await expect(page.locator("h1")).toContainText("Contributeurs");
  });

  test("navigates to timeline page", async ({ page }) => {
    await page.goto("/timeline/");
    await expect(page.locator("h1")).toContainText("Timeline");
  });

  test("navigates to stats page", async ({ page }) => {
    await page.goto("/stats/");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("navigates to tags page", async ({ page }) => {
    await page.goto("/tags/");
    await expect(page.locator("h1")).toContainText("Tags");
  });

  test("navigates to activity page", async ({ page }) => {
    await page.goto("/activity/");
    await expect(page.locator("h1")).toContainText("Activité");
  });

  test("navigates to a contributor detail page", async ({ page }) => {
    test.skip(!siteConfig.showRanking, "contributor ranking is disabled");
    await page.goto("/contributors/");
    // Click on the first contributor link in the leaderboard table body
    const firstLink = page.locator("tbody a").first();
    const name = await firstLink.textContent();
    await firstLink.click();
    await expect(page.locator("h1")).toContainText(name!.trim());
  });

  test("contributor detail has back link", async ({ page }) => {
    test.skip(!siteConfig.showRanking, "contributor ranking is disabled");
    await page.goto("/contributors/");
    await page.locator("tbody a").first().click();
    const backLink = page.locator('main a[href="/contributors/"]');
    await expect(backLink).toBeVisible();
  });
});

test.describe("Header", () => {
  test("logo links to home", async ({ page }) => {
    await page.goto("/tags/");
    await page.click('a[aria-label*="Accueil"]');
    await expect(page).toHaveURL("/");
  });

  test("nav links have active state", async ({ page }) => {
    await page.goto("/stats/");
    const activeLink = page.locator('#main-nav a[aria-current="page"]');
    await expect(activeLink).toContainText("Stats");
  });
});

test.describe("Footer", () => {
  test("footer shows social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator('a[href*="blog.zatsit.fr"]')).toBeVisible();
    await expect(footer.locator('a[href*="linkedin"]')).toBeVisible();
    await expect(footer.locator('a[href*="github"]')).toBeVisible();
  });

  test("footer shows copyright", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText("zatsit");
  });
});
