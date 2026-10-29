import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";
import { acceptCookies } from "../utils";
import { deletePost } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

async function setUpEditor(page: Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });
  await editor.insertBlock({
    name: "kotlinskidev/protected-content",
    attributes: { content: "team@example.com" },
  });
  await editor.openDocumentSettingsSidebar();

  return { editor, admin };
}

test.describe("Protected content — Site Editor (kotlinskidev/protected-content)", () => {
  test("enabling Use Protection reveals the Protection Type control and a canvas indicator, and saves both attributes", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Protected A");

    await expect(page.getByRole("combobox", { name: "Protection Type" })).toHaveCount(0);
    await expect(editor.canvas.locator(".protection-indicator")).toHaveCount(0);

    await page.getByRole("checkbox", { name: "Use Protection" }).click();

    await expect(page.getByRole("combobox", { name: "Protection Type" })).toBeVisible();
    await expect(editor.canvas.locator(".protection-indicator")).toBeVisible();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"useProtection":true');
  });

  test("changing Protection Type updates the saved attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Protected B");

    await page.getByRole("checkbox", { name: "Use Protection" }).click();
    await page.getByRole("combobox", { name: "Protection Type" }).selectOption("phone");

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"protectionType":"phone"');
  });

  test("enabling HTML Mode swaps the rich text field for a raw HTML textarea", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Protected C");

    await expect(editor.canvas.locator("textarea")).toHaveCount(0);

    await page.getByRole("checkbox", { name: "HTML Mode" }).click();

    await expect(editor.canvas.locator("textarea")).toBeVisible();
    const content = await editor.getEditedPostContent();
    expect(content).toContain('"isHtmlMode":true');
  });

  test("publishing a protected email renders and decrypts correctly on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Protected Frontend");

    await page.getByRole("checkbox", { name: "Use Protection" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext();
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const protectedEl = anonymousPage.locator('main [data-protection-type="email"]');
        await expect(protectedEl).toHaveClass(/protection-loaded/);
        await expect(protectedEl.locator("a")).toHaveAttribute("href", "mailto:team@example.com");
      } finally {
        await anonymousContext.close();
      }
    } finally {
      if (postId) {
        deletePost(postId);
      }
    }
  });
});
