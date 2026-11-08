import path from "node:path";
import { test, expect } from "@playwright/test";
import { Editor } from "@wordpress/e2e-test-utils-playwright";
import { createFixturePage, deleteFixturePage, getRegisteredPatterns } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const INVALID_CONTENT_WARNING = "Block contains unexpected or invalid content.";

const patterns = getRegisteredPatterns();

test.describe("Block pattern validity", () => {
  test("registers at least one theme block pattern", () => {
    expect(patterns.length).toBeGreaterThan(0);
  });

  for (const pattern of patterns) {
    const slug = `e2e-pattern-${pattern.name.replace("kotlinskidev/", "")}`;

    test(`${pattern.name} renders without invalid/unexpected block content`, async ({ page }) => {
      const { id } = createFixturePage(
        slug,
        `E2E Pattern Validity: ${pattern.name}`,
        pattern.content
      );

      try {
        await page.goto(`/wp-admin/post.php?post=${id}&action=edit`);

        const editor = new Editor({ page });
        await editor.setPreferences("core/edit-post", {
          welcomeGuide: false,
          fullscreenMode: false,
        });

        await expect(editor.canvas.locator(".is-root-container")).toBeVisible();
        await expect(editor.canvas.getByText(INVALID_CONTENT_WARNING)).toHaveCount(0);
      } finally {
        deleteFixturePage(slug);
      }
    });
  }
});
