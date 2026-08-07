import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";
import { acceptCookies, openBlockSettingsTab } from "../utils";
import { deletePost } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const IMAGE_URL =
  "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp";

async function setUpEditor(page: Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });

  return { editor, admin };
}

test.describe("Cover/Image lazy loading override — Site Editor (kotlinskidev/cover-lazy-loading)", () => {
  test("toggling Skip Lazy Loading on an image updates the saved attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Lazy Image A");

    await editor.insertBlock({ name: "core/image", attributes: { url: IMAGE_URL, alt: "team" } });
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await page.getByRole("button", { name: /Lazy Loading Settings/ }).click();
    await page.getByRole("checkbox", { name: "Skip Lazy Loading" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"kotlinskidevSkipLazy":true');
  });

  test("toggling Skip Lazy Loading on a cover updates the saved attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Lazy Cover B");

    await editor.insertBlock({ name: "core/cover", attributes: { url: IMAGE_URL } });
    await editor.canvas.locator(".wp-block-cover").click();
    await page.getByRole("button", { name: "Cover", exact: true }).click();
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await page.getByRole("button", { name: /Lazy Loading Settings/ }).click();
    await page.getByRole("checkbox", { name: "Skip Lazy Loading" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"kotlinskidevSkipLazy":true');
  });

  test("the panel is not shown for an unsupported block", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Lazy Unsupported C");

    await editor.insertBlock({ name: "core/paragraph", attributes: { content: "hello" } });
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await expect(page.getByRole("button", { name: /Lazy Loading Settings/ })).toHaveCount(0);
  });

  test("publishing an image with Skip Lazy Loading enabled renders eager-loaded on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Lazy Frontend D");

    await editor.insertBlock({ name: "core/image", attributes: { url: IMAGE_URL, alt: "team" } });
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);
    await page.getByRole("button", { name: /Lazy Loading Settings/ }).click();
    await page.getByRole("checkbox", { name: "Skip Lazy Loading" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext();
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const img = anonymousPage.locator("main .wp-block-image img");
        await expect(img).toHaveAttribute("loading", "eager");
        await expect(img).toHaveAttribute("fetchpriority", "high");
        await expect(img).toHaveClass(/\bno-lazy-loading\b/);
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
