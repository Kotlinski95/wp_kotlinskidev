import path from "node:path";
import { test, expect } from "@playwright/test";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

test.describe("Site Editor", () => {
  test("loads as an authenticated admin instead of redirecting to login", async ({ page }) => {
    await page.goto("/wp-admin/site-editor.php");

    await expect(page).toHaveURL(/site-editor\.php/);
    await expect(page.locator("#loginform")).toHaveCount(0);
  });
});
