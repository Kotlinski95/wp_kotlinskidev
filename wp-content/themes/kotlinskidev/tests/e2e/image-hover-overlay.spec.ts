import { test, expect, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";
import { decodePng, getPixel } from "./png-pixel";

const IMAGE_WIDTH = 200;
const IMAGE_HEIGHT = 150;
const IMAGE_URL = "/wp-content/themes/kotlinskidev/assets/images/service_icon.webp";
const SHORT_DESCRIPTION = "See the full case study.";
const LONG_DESCRIPTION =
  "This description is deliberately long so that, if the overlay were not " +
  "properly clipped to the image bounds, the text would visibly spill out " +
  "past the edges of a small two-hundred by one-hundred-fifty pixel image " +
  "and this test would be able to catch it.";

function buildImageOverlayContent(description: string): string {
  const attrs = {
    sizeSlug: "large",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    kotlinskidevOverlayEnabled: true,
    kotlinskidevOverlayHeading: "Our Work",
    kotlinskidevOverlayDescription: description,
  };

  return (
    `<div style="height:600px">Spacer</div>` +
    `<!-- wp:image ${JSON.stringify(attrs)} -->` +
    `<figure class="wp-block-image size-large" style="width:${IMAGE_WIDTH}px;height:${IMAGE_HEIGHT}px">` +
    `<img src="${IMAGE_URL}" alt="" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" ` +
    `style="width:${IMAGE_WIDTH}px;height:${IMAGE_HEIGHT}px;object-fit:cover"/>` +
    `</figure>` +
    `<!-- /wp:image -->`
  );
}

async function getBoxes(page: Page) {
  const figure = await page.locator(".kt-image-hover-overlay").boundingBox();
  const img = await page.locator(".kt-image-hover-overlay img").boundingBox();
  const content = await page.locator(".kt-image-hover-overlay__content").boundingBox();
  expect(figure).not.toBeNull();
  expect(img).not.toBeNull();
  expect(content).not.toBeNull();
  return { figure: figure!, img: img!, content: content! };
}

test.describe("Image hover overlay (core/image + kotlinskidevOverlayEnabled) — containment, realistic description", () => {
  const slug = "e2e-fixture-image-hover-overlay-short";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Image Hover Overlay Short",
      buildImageOverlayContent(SHORT_DESCRIPTION)
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("the figure clips overflow, so the overlay can never paint outside it", async ({ page }) => {
    await expect(page.locator(".kt-image-hover-overlay")).toHaveCSS("overflow", "hidden");
  });

  test("the overlay content box matches the image's own box exactly, before and after hover", async ({
    page,
  }) => {
    const figure = page.locator(".kt-image-hover-overlay");
    await figure.scrollIntoViewIfNeeded();

    const { figure: figureBox, img: imgBox, content: contentBoxBefore } = await getBoxes(page);

    expect(figureBox.width).toBeCloseTo(imgBox.width, 0);
    expect(figureBox.height).toBeCloseTo(imgBox.height, 0);
    expect(contentBoxBefore.x).toBeCloseTo(figureBox.x, 0);
    expect(contentBoxBefore.y).toBeCloseTo(figureBox.y, 0);
    expect(contentBoxBefore.width).toBeCloseTo(figureBox.width, 0);
    expect(contentBoxBefore.height).toBeCloseTo(figureBox.height, 0);

    await figure.hover();

    const { figure: figureBoxAfter, content: contentBoxAfter } = await getBoxes(page);

    expect(contentBoxAfter.x).toBeCloseTo(figureBoxAfter.x, 0);
    expect(contentBoxAfter.y).toBeCloseTo(figureBoxAfter.y, 0);
    expect(contentBoxAfter.width).toBeCloseTo(figureBoxAfter.width, 0);
    expect(contentBoxAfter.height).toBeCloseTo(figureBoxAfter.height, 0);
  });

  test("a realistic heading and description fit fully within the image on all sides", async ({
    page,
  }) => {
    const figure = page.locator(".kt-image-hover-overlay");
    await figure.scrollIntoViewIfNeeded();
    await figure.hover();

    const figureBox = (await figure.boundingBox())!;
    const heading = page.locator(".kt-image-hover-overlay__heading");
    const description = page.locator(".kt-image-hover-overlay__description");
    const headingBox = (await heading.boundingBox())!;
    const descriptionBox = (await description.boundingBox())!;

    for (const box of [headingBox, descriptionBox]) {
      expect(box.x).toBeGreaterThanOrEqual(figureBox.x - 1);
      expect(box.y).toBeGreaterThanOrEqual(figureBox.y - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(figureBox.x + figureBox.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(figureBox.y + figureBox.height + 1);
    }
  });
});

test.describe("Image hover overlay (core/image + kotlinskidevOverlayEnabled) — excessively long description", () => {
  const slug = "e2e-fixture-image-hover-overlay-long";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Image Hover Overlay Long",
      buildImageOverlayContent(LONG_DESCRIPTION)
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("the overlay content container itself never grows taller or wider than the image", async ({
    page,
  }) => {
    const figure = page.locator(".kt-image-hover-overlay");
    await figure.scrollIntoViewIfNeeded();
    await figure.hover();

    const { figure: figureBox, content: contentBox } = await getBoxes(page);

    expect(contentBox.height).toBeLessThanOrEqual(figureBox.height + 1);
    expect(contentBox.width).toBeLessThanOrEqual(figureBox.width + 1);
  });

  test("text too tall to fit is clipped only at the bottom, never spills above the top edge", async ({
    page,
  }) => {
    // Regression test: justify-content: center on an overflowing flex column
    // centers the overflow across BOTH edges by default, meaning long text
    // could render starting above the image's own top edge. `safe center`
    // (src/styles/image-hover-overlay.scss) anchors overflow to the top
    // instead, so the worst case is bottom clipping (still fully contained,
    // since the figure has overflow:hidden), never a top spillover.
    const figure = page.locator(".kt-image-hover-overlay");
    await figure.scrollIntoViewIfNeeded();
    await figure.hover();

    const figureBox = (await figure.boundingBox())!;
    const heading = page.locator(".kt-image-hover-overlay__heading");
    const description = page.locator(".kt-image-hover-overlay__description");
    const headingBox = (await heading.boundingBox())!;
    const descriptionBox = (await description.boundingBox())!;

    for (const box of [headingBox, descriptionBox]) {
      expect(box.x).toBeGreaterThanOrEqual(figureBox.x - 1);
      expect(box.y).toBeGreaterThanOrEqual(figureBox.y - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(figureBox.x + figureBox.width + 1);
    }
  });
});

test.describe("Image hover overlay (core/image + kotlinskidevOverlayEnabled) — background paints and stays painted", () => {
  const slug = "e2e-fixture-image-hover-overlay-paint";
  const OVERLAY_COLOR: [number, number, number] = [0, 255, 0];
  let fixtureUrl: string;

  test.beforeAll(() => {
    const attrs = {
      sizeSlug: "large",
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      kotlinskidevOverlayEnabled: true,
      kotlinskidevOverlayHeading: "Our Work",
      kotlinskidevOverlayDescription: SHORT_DESCRIPTION,
    };
    // The --kt-overlay-bg custom property is normally baked into the figure's
    // saved markup by the editor-side blocks.getSaveContent.extraProps filter
    // (src/blocks/image-hover-overlay/index.tsx) when a color is picked — a
    // hand-written fixture has to set it directly to simulate that, same as
    // the content-tabs fixtures do for their own style attrs.
    const content =
      `<div style="height:600px">Spacer</div>` +
      `<!-- wp:image ${JSON.stringify(attrs)} -->` +
      `<figure class="wp-block-image size-large" style="width:${IMAGE_WIDTH}px;height:${IMAGE_HEIGHT}px;--kt-overlay-bg:rgb(${OVERLAY_COLOR.join(",")})">` +
      `<img src="${IMAGE_URL}" alt="" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" ` +
      `style="width:${IMAGE_WIDTH}px;height:${IMAGE_HEIGHT}px;object-fit:cover"/>` +
      `</figure>` +
      `<!-- /wp:image -->`;

    fixtureUrl = createFixturePage(slug, "E2E Fixture — Image Hover Overlay Paint", content).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("the background tint is actually painted, and stays painted well after the reveal transition settles", async ({
    page,
  }) => {
    // Regression test: `.kt-image-hover-overlay__content` had no explicit
    // z-index, so it only formed a stacking context while its opacity
    // transition was mid-flight (opacity < 1 is a stacking-context trigger).
    // Once the transition settled at opacity: 1, that context dissolved and
    // the background layer's `z-index: -1` escaped to the nearest ANCESTOR
    // stacking context instead of staying scoped under its own parent —
    // rendering behind the image instead of over it. Caught by sampling real
    // painted pixels (getComputedStyle never showed any difference — this
    // class of bug is invisible to CSSOM inspection, only visible in the
    // actual compositor output). Fixed with an explicit `z-index: 0` on
    // `.kt-image-hover-overlay__content`, unconditionally creating a stacking
    // context (position:absolute + explicit z-index, regardless of opacity).
    const figure = page.locator(".kt-image-hover-overlay");
    await figure.scrollIntoViewIfNeeded();
    const box = (await figure.boundingBox())!;
    // Sample near the top-left corner, inside the padding, away from the
    // centered text — this point should only ever show the tint or the raw
    // image, never any text glyph.
    const sampleX = Math.round(box.x + 8);
    const sampleY = Math.round(box.y + 8);

    await figure.hover();

    async function samplePixel() {
      const buffer = await page.screenshot({
        clip: { x: sampleX, y: sampleY, width: 2, height: 2 },
      });
      const png = decodePng(buffer);
      return getPixel(png, 0, 0);
    }

    const soonAfterHover = await samplePixel();
    await page.waitForTimeout(2000);
    const wellAfterHover = await samplePixel();

    for (const [r, g, b] of [soonAfterHover, wellAfterHover]) {
      expect(r).toBeLessThan(40);
      expect(g).toBeGreaterThan(200);
      expect(b).toBeLessThan(40);
    }
  });
});
