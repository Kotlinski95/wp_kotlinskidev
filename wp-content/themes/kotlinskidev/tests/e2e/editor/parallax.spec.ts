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

test.describe("Parallax cover extension — Site Editor (kotlinskidev/parallax block extension)", () => {
  test("toggling Enable Parallax Effect on a cover updates the saved attribute", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Parallax A");

    await editor.insertBlock({ name: "core/cover", attributes: { url: IMAGE_URL } });
    await editor.canvas.locator(".wp-block-cover").click();
    await page.getByRole("button", { name: "Cover", exact: true }).click();
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await page.getByRole("button", { name: /Parallax Settings/ }).click();
    await page.getByRole("checkbox", { name: "Enable Parallax Effect" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"enableParallax":true');
  });

  test("changing the Parallax Intensity slider updates the saved attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Parallax Intensity");

    await editor.insertBlock({ name: "core/cover", attributes: { url: IMAGE_URL } });
    await editor.canvas.locator(".wp-block-cover").click();
    await page.getByRole("button", { name: "Cover", exact: true }).click();
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await page.getByRole("button", { name: /Parallax Settings/ }).click();
    await page.getByRole("checkbox", { name: "Enable Parallax Effect" }).click();

    // RangeControl renders both a slider and a spinbutton sharing one aria-label — scope to the
    // spinbutton to fill an exact value (see .claude/rules/testing.md).
    const intensityInput = page.getByRole("spinbutton", { name: /Parallax Intensity/ });
    await intensityInput.fill("8");
    await intensityInput.blur();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"parallaxIntensity":8');
  });

  test("the panel is not shown for an unsupported block", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Parallax B");

    await editor.insertBlock({ name: "core/paragraph", attributes: { content: "hello" } });
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);

    await expect(page.getByRole("button", { name: /Parallax Settings/ })).toHaveCount(0);
  });

  test("publishing a cover with parallax enabled renders a fixed background on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Parallax Frontend");

    await editor.insertBlock({ name: "core/cover", attributes: { url: IMAGE_URL } });
    await editor.canvas.locator(".wp-block-cover").click();
    await page.getByRole("button", { name: "Cover", exact: true }).click();
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);
    await page.getByRole("button", { name: /Parallax Settings/ }).click();
    await page.getByRole("checkbox", { name: "Enable Parallax Effect" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ reducedMotion: "no-preference" });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const cover = anonymousPage.locator(".wp-block-cover.enable-parallax");
        await expect(cover).toHaveCount(1);
        await expect(cover).toHaveCSS("background-attachment", "fixed");
      } finally {
        await anonymousContext.close();
      }
    } finally {
      if (postId) {
        deletePost(postId);
      }
    }
  });

  test("publishing a cover with a custom intensity carries it through to the frontend's data-parallax-intensity attribute", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Parallax Intensity Frontend");

    await editor.insertBlock({ name: "core/cover", attributes: { url: IMAGE_URL } });
    await editor.canvas.locator(".wp-block-cover").click();
    await page.getByRole("button", { name: "Cover", exact: true }).click();
    await editor.openDocumentSettingsSidebar();
    await openBlockSettingsTab(page);
    await page.getByRole("button", { name: /Parallax Settings/ }).click();
    await page.getByRole("checkbox", { name: "Enable Parallax Effect" }).click();

    const intensityInput = page.getByRole("spinbutton", { name: /Parallax Intensity/ });
    await intensityInput.fill("3");
    await intensityInput.blur();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      await page.goto(`/?page_id=${postId}`);
      await acceptCookies(page);

      const cover = page.locator(".wp-block-cover.enable-parallax");
      await expect(cover).toHaveAttribute("data-parallax-intensity", "3");
    } finally {
      if (postId) {
        deletePost(postId);
      }
    }
  });
});
