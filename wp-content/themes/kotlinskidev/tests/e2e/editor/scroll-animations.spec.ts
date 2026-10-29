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
  await editor.insertBlock({ name: "core/group" });
  await editor.openDocumentSettingsSidebar();
  await page.getByRole("button", { name: /Scroll Animations/ }).click();

  return { editor, admin };
}

test.describe("Scroll animations — Site Editor (kotlinskidev/scroll-animations block extension)", () => {
  test("choosing a fade animation type reveals an Animation Distance control and saves the attribute", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — ScrollAnim A");

    await expect(page.getByRole("combobox", { name: "Animation Distance" })).toHaveCount(0);

    await page.getByRole("combobox", { name: "Animation Type" }).selectOption("fade-up-on-scroll");

    await expect(page.getByRole("combobox", { name: "Animation Distance" })).toBeVisible();
    const content = await editor.getEditedPostContent();
    expect(content).toContain("fade-up-on-scroll");
  });

  test("choosing a flip animation type hides the Animation Distance control", async ({ page }) => {
    await setUpEditor(page, "E2E Editor Test — ScrollAnim B");

    await page
      .getByRole("combobox", { name: "Animation Type" })
      .selectOption("flip-left-on-scroll");

    await expect(page.getByRole("combobox", { name: "Animation Distance" })).toHaveCount(0);
  });

  test("setting an animation delay is reflected in the saved markup", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — ScrollAnim C");

    await page.getByRole("combobox", { name: "Animation Type" }).selectOption("fade-up-on-scroll");
    await page.getByRole("combobox", { name: "Animation Delay" }).selectOption("delay-300");

    const content = await editor.getEditedPostContent();
    expect(content).toContain("delay-300");
  });

  test("publishing a block with a fade animation reveals it on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — ScrollAnim Frontend");

    await page.getByRole("combobox", { name: "Animation Type" }).selectOption("fade-up-on-scroll");

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({
        reducedMotion: "no-preference",
      });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const group = anonymousPage.locator("main .fade-up-on-scroll");
        await expect(group).toHaveClass(/\bvisible\b/, { timeout: 5000 });
        await expect(group).toHaveCSS("opacity", "1", { timeout: 5000 });
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
