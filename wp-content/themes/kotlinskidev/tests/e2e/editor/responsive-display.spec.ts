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
  await page.getByRole("button", { name: /Display & Layout/ }).click();
  await page.getByRole("checkbox", { name: "Advanced Display Settings" }).click();

  return { editor, admin };
}

function devicePanel(page: Page, name: "Desktop" | "Tablet" | "Mobile") {
  return page.getByRole("heading", { name, level: 4 }).locator("xpath=..");
}

test.describe("Responsive display — Site Editor (kotlinskidev/responsive-display block extension)", () => {
  test("Advanced Display Settings reveals a Desktop, Tablet, and Mobile panel", async ({
    page,
  }) => {
    await setUpEditor(page, "E2E Editor Test — Responsive Display A");

    await expect(devicePanel(page, "Desktop")).toBeVisible();
    await expect(devicePanel(page, "Tablet")).toBeVisible();
    await expect(devicePanel(page, "Mobile")).toBeVisible();
  });

  test("setting Desktop Display to Flex reveals Flex Direction and Justify Content scoped to that device only", async ({
    page,
  }) => {
    await setUpEditor(page, "E2E Editor Test — Responsive Display B");

    const desktop = devicePanel(page, "Desktop");
    const tablet = devicePanel(page, "Tablet");

    await expect(desktop.getByRole("combobox", { name: "Flex Direction" })).toHaveCount(0);

    await desktop.getByRole("combobox", { name: "Display" }).selectOption("flex");

    await expect(desktop.getByRole("combobox", { name: "Flex Direction" })).toBeVisible();
    await expect(desktop.getByRole("combobox", { name: "Justify Content" })).toBeVisible();
    await expect(tablet.getByRole("combobox", { name: "Flex Direction" })).toHaveCount(0);
  });

  test("changing device settings updates the saved attribute and the live canvas class", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Responsive Display C");

    await devicePanel(page, "Mobile")
      .getByRole("combobox", { name: "Display" })
      .selectOption("grid");

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"mobile":{"display":"grid"}');

    await expect(editor.canvas.locator(".wp-block-group")).toHaveClass(/mobile:grid/);
  });

  test("publishing a group with per-device display settings renders correctly on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Responsive Display Frontend");

    await devicePanel(page, "Mobile")
      .getByRole("combobox", { name: "Display" })
      .selectOption("grid");

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const group = anonymousPage.locator("main .wp-block-group.mobile\\:grid");
        await expect(group).toHaveCount(1);
        await expect(group).toHaveCSS("display", "grid");
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
