import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";
import { createFixturePost, deleteFixturePostsByType } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const sceneSlug = "e2e-fixture-canvas-scene-editor";
const sceneTitle = "E2E Fixture Canvas Scene Editor";

async function setUpEditor(page: Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });

  return { editor, admin };
}

test.describe("Canvas background controls — Site Editor (kotlinskidev/canvas-background-controls block extension)", () => {
  test.beforeAll(() => {
    createFixturePost(
      "kt_canvas_scene",
      sceneSlug,
      sceneTitle,
      {},
      '<!-- wp:kotlinskidev/canvas-layer-noise {"opacity":0.1} /-->'
    );
  });

  test.afterAll(() => {
    deleteFixturePostsByType("kt_canvas_scene", sceneSlug);
  });

  test("picking a canvas scene saves the canvasSceneId attribute on the block", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Canvas Background A");

    await editor.insertBlock({ name: "core/group" });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Canvas Background/ }).click();

    const combobox = page.getByRole("combobox", { name: "Canvas Scene" });
    await combobox.click();
    await combobox.fill(sceneTitle);
    await page.getByRole("option", { name: sceneTitle }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"canvasSceneId"');
  });

  test("resetting the combobox removes the canvasSceneId attribute", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Canvas Background B");

    await editor.insertBlock({ name: "core/group" });
    await editor.openDocumentSettingsSidebar();
    await page.getByRole("button", { name: /Canvas Background/ }).click();

    const combobox = page.getByRole("combobox", { name: "Canvas Scene" });
    await combobox.click();
    await combobox.fill(sceneTitle);
    await page.getByRole("option", { name: sceneTitle }).click();
    await expect
      .poll(async () => (await editor.getEditedPostContent()).includes('"canvasSceneId"'))
      .toBe(true);

    await page.getByRole("button", { name: "Reset" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).not.toContain("canvasSceneId");
  });

  test("the Canvas Background panel is not shown for an excluded block", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Canvas Background C");

    await editor.insertBlock({ name: "core/code", attributes: { content: "const x = 1;" } });
    await editor.openDocumentSettingsSidebar();

    await expect(page.getByRole("button", { name: /Canvas Background/ })).toHaveCount(0);
  });
});
