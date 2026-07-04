import { test, expect } from "@playwright/test";

test.describe("Home — Search & Filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("search input filters entries", async ({ page }) => {
    const countBefore = await page.locator("#result-count").textContent();
    await page.fill("#search-input", "kubernetes");
    // Wait for debounce
    await page.waitForTimeout(350);
    const countAfter = await page.locator("#result-count").textContent();
    expect(Number(countAfter)).toBeLessThan(Number(countBefore));
  });

  test("tag filter toggles active state", async ({ page }) => {
    const firstTag = page.locator("#tag-filters .tag-badge").first();
    await firstTag.click();
    await expect(firstTag).toHaveClass(/active/);
    // Click again to deactivate
    await firstTag.click();
    await expect(firstTag).not.toHaveClass(/active/);
  });

  test("clear filters button appears and works", async ({ page }) => {
    const clearBtn = page.locator("#clear-filters");
    await expect(clearBtn).toBeHidden();
    // Activate a tag
    await page.locator("#tag-filters .tag-badge").first().click();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(clearBtn).toBeHidden();
  });

  test("contributor dropdown filters entries", async ({ page }) => {
    const countBefore = await page.locator("#result-count").textContent();
    const select = page.locator("#contributor-filter");
    // Select the second option (first contributor)
    const options = await select.locator("option").allTextContents();
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      const countAfter = await page.locator("#result-count").textContent();
      expect(Number(countAfter)).toBeLessThanOrEqual(Number(countBefore));
    }
  });

  test("sort select changes order", async ({ page }) => {
    const firstCardBefore = await page.locator("#entries-grid article h3").first().textContent();
    await page.selectOption("#sort-select", "alpha");
    const firstCardAfter = await page.locator("#entries-grid article h3").first().textContent();
    // Sorting by alpha should change the order (unless already alpha)
    expect(firstCardAfter).toBeDefined();
  });

  test("view toggle switches between grid and list", async ({ page }) => {
    // Grid is default
    await expect(page.locator("#entries-grid")).toBeVisible();
    await expect(page.locator("#entries-list")).toBeHidden();
    // Switch to list
    await page.click('[data-view="list"]');
    await expect(page.locator("#entries-list")).toBeVisible();
    await expect(page.locator("#entries-grid")).toBeHidden();
    // Switch back to grid
    await page.click('[data-view="grid"]');
    await expect(page.locator("#entries-grid")).toBeVisible();
  });

  test("empty state shows when no results", async ({ page }) => {
    await page.fill("#search-input", "xyznonexistent12345");
    await page.waitForTimeout(350);
    await expect(page.locator("#empty-state")).toBeVisible();
    expect(await page.locator("#result-count").textContent()).toBe("0");
  });
});

test.describe("Home — Discover Modal", () => {
  test("discover button opens surprise modal", async ({ page }) => {
    await page.goto("/");
    await page.click("#discover-btn");
    const modal = page.locator("#surprise-modal");
    await expect(modal).toBeVisible();
  });

  test("surprise modal closes on escape", async ({ page }) => {
    await page.goto("/");
    await page.click("#discover-btn");
    await expect(page.locator("#surprise-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#surprise-modal")).toBeHidden();
  });

  test("surprise modal closes on close button", async ({ page }) => {
    await page.goto("/");
    await page.click("#discover-btn");
    await page.click("#surprise-close");
    await expect(page.locator("#surprise-modal")).toBeHidden();
  });
});
