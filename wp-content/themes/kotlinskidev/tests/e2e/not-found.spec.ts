import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

const MISSING_PATH = "/does-not-exist-xyz/";
const MISSING_PATH_EN = "/en/does-not-exist-xyz/";

test.describe("404 page", () => {
  test("returns HTTP 404 with a single h1, header and footer", async ({ page }) => {
    const response = await page.goto(MISSING_PATH);
    expect(response?.status()).toBe(404);
    await acceptCookies(page);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".kt-not-found__title")).toBeVisible();
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeAttached();
  });

  test("shows the English heading under /en/", async ({ page }) => {
    const response = await page.goto(MISSING_PATH_EN);
    expect(response?.status()).toBe(404);
    await expect(page.locator(".kt-not-found__title")).toHaveText("OOPS! Page Not Found!");
  });

  for (const width of [428, 1280]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(MISSING_PATH);
      await acceptCookies(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test.describe("mobile app shell", () => {
    test.use({ viewport: { width: 428, height: 846 } });

    test("renders the mobile footer nav and scrolls inside .wp-site-blocks", async ({ page }) => {
      await page.goto(MISSING_PATH);
      await acceptCookies(page);
      await page.waitForTimeout(500);

      await expect(page.locator("#mobile-footer-menu")).toBeAttached();
      expect(await page.evaluate(() => document.body.classList.contains("kt-app-shell"))).toBe(
        true
      );

      const result = await page.evaluate(async () => {
        const scroller = document.querySelector<HTMLElement>(".wp-site-blocks");
        if (!scroller) {
          return null;
        }
        scroller.scrollTop = 400;
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        return { containerTop: scroller.scrollTop, windowY: window.scrollY };
      });

      expect(result).not.toBeNull();
      expect(result?.containerTop).toBeGreaterThan(0);
      expect(result?.windowY).toBe(0);
    });
  });
});
