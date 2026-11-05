import { test, expect, type Page } from "@playwright/test";

async function acceptCookies(page: Page) {
  const acceptButton = page.getByRole("button", { name: "Akceptuję" });
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("loads with the Polish locale by default", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "pl-PL");
    await expect(page).toHaveTitle(/Kotlinskidev/);
  });

  test("main navigation is visible", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "Nawigacja główna" })).toBeVisible();
  });

  test("switching to English navigates to the English homepage", async ({ page }) => {
    await page.getByRole("button", { name: "PL", exact: true }).click();
    await page.locator('a:visible:has-text("English")').first().click();

    await expect(page).toHaveURL(/\/en\/home\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });

  test("theme toggle switches between light and dark mode", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Toggle light and dark theme" });
    await expect(toggle).toBeVisible();

    const initialIsDark = await page.evaluate(() => document.body.classList.contains("dark-mode"));

    await toggle.click();

    await expect
      .poll(() => page.evaluate(() => document.body.classList.contains("dark-mode")))
      .toBe(!initialIsDark);
  });
});
