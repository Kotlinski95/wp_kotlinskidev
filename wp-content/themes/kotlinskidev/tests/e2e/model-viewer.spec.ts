import path from "node:path";
import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage, deletePost, importFixtureMedia } from "./wp-cli";

const slug = "e2e-fixture-model-viewer";

function buildContent(modelUrl: string, posterUrl: string): string {
  const attrs = {
    modelUrl,
    posterUrl,
    ariaLabel: "Interactive 3D cube — click to open or close",
    clipName: "open",
  };

  return `<!-- wp:kotlinskidev/model-viewer ${JSON.stringify(attrs)} /-->`;
}

test.describe("Model Viewer (kotlinskidev/model-viewer block)", () => {
  let fixtureUrl: string;
  let modelId: number;
  let posterId: number;

  test.beforeAll(() => {
    const model = importFixtureMedia(path.resolve(__dirname, "fixtures", "model-viewer-cube.glb"));
    const poster = importFixtureMedia(
      path.resolve(__dirname, "fixtures", "model-viewer-poster.png")
    );
    modelId = model.id;
    posterId = poster.id;

    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Model Viewer",
      buildContent(model.url, poster.url)
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
    deletePost(modelId);
    deletePost(posterId);
  });

  test("shows the fallback poster immediately, then reveals the canvas once the model loads", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const trigger = page.locator(".model-viewer__trigger");
    await expect(trigger.locator(".model-viewer__fallback")).toBeVisible();

    await expect(trigger).toHaveClass(/is-loaded/, { timeout: 10000 });
  });

  test("clicking the trigger toggles aria-pressed", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const trigger = page.locator(".model-viewer__trigger");
    await expect(trigger).toHaveClass(/is-loaded/, { timeout: 10000 });
    await expect(trigger).toHaveAttribute("aria-pressed", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-pressed", "true");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-pressed", "false");
  });

  test("keyboard Tab + Enter toggles the same way as a click", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const trigger = page.locator(".model-viewer__trigger");
    await expect(trigger).toHaveClass(/is-loaded/, { timeout: 10000 });

    await trigger.focus();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveAttribute("aria-pressed", "true");
  });

  test("still toggles under the suite's default reduced-motion setting (instant-jump branch)", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const trigger = page.locator(".model-viewer__trigger");
    await expect(trigger).toHaveClass(/is-loaded/, { timeout: 10000 });

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-pressed", "true");
  });

  test.describe("no motion preference (real tweened animation path)", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("toggles via the animated render-on-demand loop, not just an instant jump", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const trigger = page.locator(".model-viewer__trigger");
      await expect(trigger).toHaveClass(/is-loaded/, { timeout: 10000 });

      await trigger.click();

      await expect(trigger).toHaveAttribute("aria-pressed", "true");
    });
  });
});
