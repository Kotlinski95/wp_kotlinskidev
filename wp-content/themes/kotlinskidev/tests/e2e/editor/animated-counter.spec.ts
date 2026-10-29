import path from "node:path";
import { test, expect } from "@playwright/test";
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

async function setUpEditor(page: import("@playwright/test").Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });

  return { editor, admin };
}

test.describe("Animated counter — Site Editor (kotlinskidev/animated-counter block extension)", () => {
  test("toggling Enable Counter Animation adds the class and default attributes to the block markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test A");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "250+" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Animated Counter/ }).click();
    await page.getByRole("checkbox", { name: "Enable Counter Animation" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"enableCounter":true');
    expect(content).toContain('class="wp-block-heading animated-counter"');
    expect(content).toContain('data-counter-duration="2000"');
    expect(content).toContain('data-counter-easing="easeOut"');
  });

  test("changing the duration and easing controls updates the saved attributes", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test B");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "250+" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Animated Counter/ }).click();
    await page.getByRole("checkbox", { name: "Enable Counter Animation" }).click();

    await page.getByLabel("Animation Duration").selectOption({ label: "Fast (1s)" });
    await page.getByLabel("Animation Easing").selectOption({ label: "Bounce" });

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"counterDuration":"1000"');
    expect(content).toContain('"counterEasing":"bounce"');
    expect(content).toContain('data-counter-duration="1000"');
    expect(content).toContain('data-counter-easing="bounce"');
  });

  test("toggling off removes the class and data attributes from the block markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test C");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "250+" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Animated Counter/ }).click();

    const toggle = page.getByRole("checkbox", { name: "Enable Counter Animation" });
    await toggle.click();
    await expect(page.getByLabel("Animation Duration")).toBeVisible();

    await toggle.click();

    await expect(page.getByLabel("Animation Duration")).toHaveCount(0);
    const content = await editor.getEditedPostContent();
    expect(content).not.toContain("animated-counter");
    expect(content).not.toContain('"enableCounter":true');
  });

  test("the Animated Counter panel is not shown for an unsupported block", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test D");

    await editor.insertBlock({ name: "core/separator" });
    await editor.openDocumentSettingsSidebar();

    await expect(page.getByRole("button", { name: /Animated Counter/ })).toHaveCount(0);
  });

  test("publishing a page with the counter enabled renders and animates correctly on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test Frontend");

    await editor.insertBlock({ name: "core/heading", attributes: { content: "88%" } });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Animated Counter/ }).click();
    await page.getByRole("checkbox", { name: "Enable Counter Animation" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const counter = anonymousPage.locator(".animated-counter");
        await expect(counter).toBeVisible();
        await expect(counter).toHaveAttribute("data-counter-animated", "true");
        await expect(counter).toHaveText("88%");
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
