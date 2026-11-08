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
  await page.getByRole("button", { name: /Responsive Order/ }).click();

  return { editor, admin };
}

test.describe("Responsive order — Site Editor (kotlinskidev/responsive-order block extension)", () => {
  test("setting a Desktop Order value updates the saved attribute and the live canvas class", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — RespOrder A");

    const desktopOrder = page.getByRole("spinbutton", { name: "Desktop Order" });
    await desktopOrder.fill("5");
    await desktopOrder.blur();

    const content = await editor.getEditedPostContent();
    expect(content).toContain("order-desktop-5");

    await expect(editor.canvas.locator(".wp-block-group")).toHaveClass(/order-desktop-5/);
  });

  test("a negative Tablet Order value is accepted and saved", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — RespOrder B");

    const tabletOrder = page.getByRole("spinbutton", { name: "Tablet Order" });
    await tabletOrder.fill("-1");
    await tabletOrder.blur();

    const content = await editor.getEditedPostContent();
    expect(content).toContain("order-tablet--1");
  });

  test("resetting Mobile Order back to 0 leaves a stale order class in the saved markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — RespOrder C");

    const mobileOrder = page.getByRole("spinbutton", { name: "Mobile Order" });
    await mobileOrder.fill("3");
    await mobileOrder.blur();
    await mobileOrder.fill("0");
    await mobileOrder.blur();

    const content = await editor.getEditedPostContent();
    expect(content).toContain("order-mobile-0");
  });

  test("publishing a group with a desktop order renders the class and CSS order on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — RespOrder Frontend");

    const desktopOrder = page.getByRole("spinbutton", { name: "Desktop Order" });
    await desktopOrder.fill("7");
    await desktopOrder.blur();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const group = anonymousPage.locator("main .wp-block-group.order-desktop-7");
        await expect(group).toHaveCount(1);
        await expect(group).toHaveCSS("order", "7");
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
