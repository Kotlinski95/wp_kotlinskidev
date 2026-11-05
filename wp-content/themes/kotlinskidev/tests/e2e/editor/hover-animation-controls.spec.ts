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

  return { editor, admin };
}

test.describe("Hover animation controls — Site Editor (kotlinskidev/hover-animation-controls block extension)", () => {
  test("choosing an animation type adds the class and saved attribute to the block markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Hover A");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "Heading" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Hover Animations/ }).click();
    await page.getByRole("combobox", { name: "Animation Type" }).selectOption("hover-jump");

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"hoverAnimation":"hover-jump"');
    expect(content).toContain('class="wp-block-heading hover-jump"');
  });

  test("switching back to No Animation removes the class and attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Hover B");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "Heading" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Hover Animations/ }).click();

    const select = page.getByRole("combobox", { name: "Animation Type" });
    await select.selectOption("hover-jump");
    await select.selectOption("");

    const content = await editor.getEditedPostContent();
    expect(content).not.toContain("hoverAnimation");
    expect(content).not.toContain("hover-jump");
  });

  test("the Hover Animations panel is not shown for an excluded block", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Hover C");

    await editor.insertBlock({ name: "core/code", attributes: { content: "const x = 1;" } });
    await editor.openDocumentSettingsSidebar();

    await expect(page.getByRole("button", { name: /Hover Animations/ })).toHaveCount(0);
  });

  test("publishing a block with a hover animation reacts to hover on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Hover Frontend");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "Heading" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Hover Animations/ }).click();
    await page.getByRole("combobox", { name: "Animation Type" }).selectOption("hover-jump");

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ reducedMotion: "no-preference" });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const heading = anonymousPage.locator(".hover-jump");
        await expect(heading).toHaveCSS("transform", "none");

        await heading.hover();

        await expect(heading).not.toHaveCSS("transform", "none");
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
