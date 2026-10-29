import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import {
  createFixturePage,
  deleteFixturePage,
  createFixturePost,
  deleteFixturePostsByType,
} from "./wp-cli";

const sceneSlug = "e2e-fixture-canvas-scene";
const pageSlug = "e2e-fixture-canvas-background";

test.describe("Canvas background (kt_canvas_scene + canvasSceneId render_block pipeline)", () => {
  let sceneId: number;
  let fixtureUrl: string;

  test.beforeAll(() => {
    sceneId = createFixturePost(
      "kt_canvas_scene",
      sceneSlug,
      "E2E Fixture Canvas Scene",
      {},
      '<!-- wp:kotlinskidev/canvas-layer-gradient {"angleDeg":90,"speed":0.6} /-->' +
        '<!-- wp:kotlinskidev/canvas-layer-blob {"count":2,"speed":0.8} /-->'
    ).id;

    fixtureUrl = createFixturePage(
      pageSlug,
      "E2E Fixture — Canvas Background",
      `<!-- wp:group {"canvasSceneId":${sceneId},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="position:relative;min-height:200px"><!-- wp:paragraph -->
<p>Canvas background target</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(pageSlug);
    deleteFixturePostsByType("kt_canvas_scene", sceneSlug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("renders the canvas background host with a valid data-canvas-recipe attribute", async ({
    page,
  }) => {
    const host = page.locator(".kt-canvas-bg");
    await expect(host).toHaveCount(1);

    const recipeJson = await host.getAttribute("data-canvas-recipe");
    expect(recipeJson).not.toBeNull();

    const recipe = JSON.parse(recipeJson as string);
    expect(recipe.layers).toHaveLength(2);
    expect(recipe.layers.map((layer: { type: string }) => layer.type)).toEqual([
      "gradient",
      "blob",
    ]);
  });

  test("mounts a real canvas element inside the host once scrolled into view", async ({ page }) => {
    const canvas = page.locator(".kt-canvas-bg canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("renders a single static frame and does not keep animating under reduced motion", async ({
    page,
  }) => {
    const canvas = page.locator(".kt-canvas-bg canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const first = await canvas.screenshot();
    await page.waitForTimeout(500);
    const second = await canvas.screenshot();

    expect(first.equals(second)).toBe(true);
  });

  test.describe("with motion allowed", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("keeps animating the canvas frame over time", async ({ page }) => {
      const canvas = page.locator(".kt-canvas-bg canvas");
      await expect(canvas).toBeVisible({ timeout: 10000 });

      const first = await canvas.screenshot();
      await page.waitForTimeout(500);
      const second = await canvas.screenshot();

      expect(first.equals(second)).toBe(false);
    });
  });
});
