import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const PARENT = "kotlinskidev/speed-dial";
const ITEM = "kotlinskidev/speed-dial-item";

async function setUpEditor(page: Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });
  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });
  return { editor };
}

test.describe("Speed Dial — editor (kotlinskidev/speed-dial)", () => {
  test("inserting the block creates the three default items and serializes without an invalid-block warning", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Quick Actions A");
    await editor.insertBlock({ name: PARENT });

    const blocks = await editor.getBlocks();
    const dial = blocks.find((block) => block.name === PARENT);
    expect(dial).toBeTruthy();
    expect(dial!.innerBlocks).toHaveLength(3);
    expect(dial!.innerBlocks.every((inner) => inner.name === ITEM)).toBe(true);
    expect(dial!.innerBlocks.map((inner) => inner.attributes.action)).toEqual([
      "accessibility",
      "phone",
      "email",
    ]);

    await expect(editor.canvas.locator(".block-editor-warning")).toHaveCount(0);
    const content = await editor.getEditedPostContent();
    expect(content).toContain(`<!-- wp:${PARENT}`);
    expect(content.match(new RegExp(`<!-- wp:${ITEM}`, "g"))).toHaveLength(3);
  });

  test("a url item can be added and reordered, and the saved post reloads with no invalid block", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Quick Actions B");
    await editor.insertBlock({
      name: PARENT,
      innerBlocks: [
        { name: ITEM, attributes: { action: "phone" } },
        { name: ITEM, attributes: { action: "email" } },
        { name: ITEM, attributes: { action: "url", value: "https://example.com/" } },
      ],
    });

    const moved = await page.evaluate((parentName) => {
      interface BlockEditorStore {
        getBlocks: () => { name: string; clientId: string }[];
        getBlockOrder: (clientId: string) => string[];
      }
      interface BlockEditorActions {
        moveBlocksToPosition: (ids: string[], from: string, to: string, index: number) => void;
      }
      const wp = (
        window as unknown as {
          wp: {
            data: {
              select: (store: string) => BlockEditorStore;
              dispatch: (store: string) => BlockEditorActions;
            };
          };
        }
      ).wp;
      const select = wp.data.select("core/block-editor");
      const dial = select.getBlocks().find((block) => block.name === parentName);
      if (!dial) {
        return false;
      }
      const order = select.getBlockOrder(dial.clientId);
      wp.data
        .dispatch("core/block-editor")
        .moveBlocksToPosition([order[order.length - 1]], dial.clientId, dial.clientId, 0);
      return order.length === 3;
    }, PARENT);
    expect(moved).toBe(true);

    const reordered = await editor.getBlocks();
    const actions = reordered
      .find((block) => block.name === PARENT)!
      .innerBlocks.map((inner) => inner.attributes.action);
    expect(actions).toEqual(["url", "phone", "email"]);

    const postId = await editor.publishPost();
    expect(postId).toBeTruthy();
    await page.reload();
    await expect(editor.canvas.locator('[data-type="kotlinskidev/speed-dial"]')).toBeVisible({
      timeout: 30000,
    });
    const invalidCount = await page.evaluate(() => {
      const wp = (
        window as unknown as {
          wp: {
            data: {
              select: (store: string) => { getBlocks: () => { isValid: boolean }[] };
            };
          };
        }
      ).wp;
      return wp.data
        .select("core/block-editor")
        .getBlocks()
        .filter((block) => !block.isValid).length;
    });
    expect(invalidCount).toBe(0);
    await expect(page.locator(".block-editor-warning")).toHaveCount(0);
  });
});
