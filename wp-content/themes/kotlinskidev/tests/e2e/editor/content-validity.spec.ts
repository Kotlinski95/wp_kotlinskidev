import path from "node:path";
import { test, expect } from "@playwright/test";
import { Editor } from "@wordpress/e2e-test-utils-playwright";
import { listPublishedContentIds } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const INVALID_CONTENT_WARNING = "Block contains unexpected or invalid content.";

const contentIds = listPublishedContentIds();

test.describe("Stored content validity", () => {
  test("finds published content to check", () => {
    expect(contentIds.length).toBeGreaterThan(0);
  });

  for (const id of contentIds) {
    test(`post ${id} opens in the editor without invalid block content`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      await page.goto(`/wp-admin/post.php?post=${id}&action=edit`);

      const editor = new Editor({ page });
      await editor.setPreferences("core/edit-post", {
        welcomeGuide: false,
        fullscreenMode: false,
      });

      await expect(editor.canvas.locator(".is-root-container")).toBeVisible();
      await expect(editor.canvas.getByText(INVALID_CONTENT_WARNING)).toHaveCount(0);
      expect(consoleErrors).toEqual([]);
    });
  }
});
