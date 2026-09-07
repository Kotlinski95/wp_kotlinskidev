import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-parallax";
const scrollSectionSlug = "e2e-fixture-parallax-scroll-section";
const IMAGE_URL = "/wp-content/themes/kotlinskidev/assets/images/team.webp";

function buildContent(): string {
  return `<!-- wp:cover {"url":"${IMAGE_URL}","enableParallax":true} -->
<div class="wp-block-cover"><div class="wp-block-cover__inner-container"><!-- wp:paragraph -->
<p>Parallax content</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->

<!-- wp:cover {"url":"${IMAGE_URL}"} -->
<div class="wp-block-cover"><div class="wp-block-cover__inner-container"><!-- wp:paragraph -->
<p>Plain content</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->`;
}

function buildStackedScrollSectionsContent(): string {
  const item = (label: string) => `<!-- wp:kotlinskidev/scroll-section-item -->
<div class="wp-block-kotlinskidev-scroll-section-item scroll-section__item"><!-- wp:paragraph -->
<p style="width:600px">${label} long enough to force horizontal overflow</p>
<!-- /wp:paragraph --></div>
<!-- /wp:kotlinskidev/scroll-section-item -->`;

  const section = () => `<!-- wp:kotlinskidev/scroll-section {"slideWidth":"auto"} -->
${item("Item one")}

${item("Item two")}

${item("Item three")}
<!-- /wp:kotlinskidev/scroll-section -->`;

  const spacer = `<!-- wp:paragraph -->
<p style="height:800px">Spacer content between sections</p>
<!-- /wp:paragraph -->`;

  // Mirrors /en/about/'s real shape (which is what actually exposed this bug — a single
  // scroll-section fixture does not): several scroll-sections stacked above the parallax cover,
  // each pinning/unpinning .main-wrapper and reflowing document height as the user scrolls past.
  return `${section()}

${spacer}

${section()}

${spacer}

<!-- wp:cover {"url":"${IMAGE_URL}","enableParallax":true} -->
<div class="wp-block-cover"><img class="wp-block-cover__image-background" alt="" src="${IMAGE_URL}" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph -->
<p>Parallax content after several scroll-sections</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->

${spacer}`;
}

function buildContentWithScrollSection(parallaxIntensity?: number): string {
  const item = (label: string) => `<!-- wp:kotlinskidev/scroll-section-item -->
<div class="wp-block-kotlinskidev-scroll-section-item scroll-section__item"><!-- wp:paragraph -->
<p style="width:600px">${label} long enough to force horizontal overflow</p>
<!-- /wp:paragraph --></div>
<!-- /wp:kotlinskidev/scroll-section-item -->`;

  const coverAttrs =
    parallaxIntensity === undefined
      ? `{"url":"${IMAGE_URL}","enableParallax":true}`
      : `{"url":"${IMAGE_URL}","enableParallax":true,"parallaxIntensity":${parallaxIntensity}}`;

  // scroll-section's own save() output is just <InnerBlocks.Content /> (no wrapper div) —
  // render.php builds the .scroll-section/.scroll-section__track wrapper itself from the block's
  // children. Hand-authoring a wrapper div here would double up: render.php wraps $content (the
  // already-serialized inner blocks) in its OWN fresh wrapper, nesting a duplicate around it.
  return `<!-- wp:kotlinskidev/scroll-section {"slideWidth":"auto"} -->
${item("Item one")}

${item("Item two")}

${item("Item three")}
<!-- /wp:kotlinskidev/scroll-section -->

<!-- wp:cover ${coverAttrs} -->
<div class="wp-block-cover"><img class="wp-block-cover__image-background" alt="" src="${IMAGE_URL}" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph -->
<p>Parallax content below a scroll-section</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->`;
}

test.describe("Parallax cover extension (kotlinskidev/parallax block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Parallax", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("a cover with parallax enabled gets the enable-parallax class and its image as a background-image style", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const cover = page.locator(".wp-block-cover.enable-parallax");
    await expect(cover).toHaveCount(1);
    const style = await cover.getAttribute("style");
    expect(style).toContain(IMAGE_URL);
  });

  test("a cover without the attribute is left untouched", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    await expect(page.locator(".wp-block-cover.enable-parallax")).toHaveCount(1);
    await expect(page.locator(".wp-block-cover:not(.enable-parallax)")).toHaveCount(1);
  });

  test("background-attachment is scroll (not fixed) when reduced motion is preferred (default)", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const cover = page.locator(".wp-block-cover.enable-parallax");
    await expect(cover).toHaveCSS("background-attachment", "scroll");
  });

  test.describe("with motion allowed", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("background-attachment is fixed, producing the real parallax effect", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const cover = page.locator(".wp-block-cover.enable-parallax");
      await expect(cover).toHaveCSS("background-attachment", "fixed");
    });
  });
});

// Regression: `scroll-section`'s GSAP ScrollTrigger pins `.main-wrapper` via `pinnedContainer`
// compensation, which leaves a persistent inline `transform` on it (even `translate(0px, 0px)`
// at rest — never reverts to `none`). Any non-`none` transform on an ancestor creates a new CSS
// containing block, which silently breaks `background-attachment: fixed` for every descendant,
// anywhere on the page, all the time — not just while a pin is actively engaged. This affects a
// parallax cover even when it sits well below the scroll-section, not nested inside it (confirmed
// live on /en/about/, where the "Implementation of a website..." banner never parallaxes because
// the page also has a scroll-section higher up). Fixed by falling back to `background-attachment:
// scroll` — the same graceful-degradation pattern already used for touch devices and
// prefers-reduced-motion — whenever `.main-wrapper` carries any inline transform, detected purely
// via CSS `:has()` so it covers any current or future GSAP effect on that shared wrapper, not just
// scroll-section by name.
test.describe("Parallax cover alongside a GSAP scroll-section (kotlinskidev/parallax + kotlinskidev/scroll-section)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      scrollSectionSlug,
      "E2E Fixture — Parallax + Scroll Section",
      buildContentWithScrollSection()
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(scrollSectionSlug);
  });

  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("background-attachment falls back to scroll when the page also has a scroll-section", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    await expect(page.locator(".scroll-section")).toHaveCount(1);
    await expect(async () => {
      const transform = await page.locator(".main-wrapper").evaluate((el) => el.style.transform);
      expect(transform).not.toBe("");
    }).toPass();

    const cover = page.locator(".wp-block-cover.enable-parallax");
    await expect(cover).toHaveCSS("background-attachment", "scroll");
  });

  // `gsap-parallax-fallback.ts` restores a real (GPU-cheap transform, not paint-triggering
  // background-position) parallax effect on pages where the CSS fallback above disables the native
  // background-attachment:fixed trick, by recomputing the cover's own (normally-hidden)
  // wp-block-cover__image-background layer's transform from a live getBoundingClientRect() on
  // every gsap.ticker frame and scroll event — not GSAP ScrollTrigger, which this module
  // deliberately avoids (see the stacked-scroll-sections describe block below for why).
  test("the parallax cover's image-background layer gets a real scroll-driven transform", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const image = page.locator(".wp-block-cover.enable-parallax .wp-block-cover__image-background");
    await expect(image).toBeVisible();

    const readTransform = () => image.evaluate((el) => getComputedStyle(el).transform);
    const initialTransform = await readTransform();

    // This project's own established convention (see scroll-section-multi-pin.spec.ts): real
    // wheel-driven scroll exercises code paths a scrollTo() jump doesn't — confirmed live that
    // scrollTo() alone can leave this module's update stalled at its initial value too.
    for (let i = 0; i < 30 && (await readTransform()) === initialTransform; i += 1) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(20);
    }

    await expect(async () => {
      const currentTransform = await readTransform();
      expect(currentTransform).not.toBe(initialTransform);
    }).toPass();
  });
});

const intensitySlug = "e2e-fixture-parallax-intensity";

// The Parallax Intensity slider (src/blocks/parallax/index.tsx) controls how far the background
// image-background layer travels via `parallaxIntensity` -> data-parallax-intensity ->
// gsap-parallax-fallback.ts's per-cover yPercent range. Confirms the attribute actually changes
// real rendered movement, not just that it round-trips through the DOM.
test.describe("Parallax Intensity control (kotlinskidev/parallax block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      intensitySlug,
      "E2E Fixture — Parallax Intensity",
      buildContentWithScrollSection(3)
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(intensitySlug);
  });

  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("a low parallaxIntensity produces a proportionally smaller transform range than the default", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const cover = page.locator(".wp-block-cover.enable-parallax");
    await expect(cover).toHaveAttribute("data-parallax-intensity", "3");

    const image = page.locator(".wp-block-cover.enable-parallax .wp-block-cover__image-background");
    const readTranslateY = async (): Promise<number> => {
      const transform = await image.evaluate((el) => getComputedStyle(el).transform);
      if (transform === "none") {
        return 0;
      }
      const match = /matrix\(([^)]+)\)/.exec(transform);
      return Number(match![1].split(",")[5]);
    };

    let maxAbsTranslateY = 0;
    for (let i = 0; i < 200; i += 1) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(15);
      maxAbsTranslateY = Math.max(maxAbsTranslateY, Math.abs(await readTranslateY()));
    }

    const imageHeight = await image.evaluate((el) => el.getBoundingClientRect().height);
    // intensity=3 on an image sized 200% of the cover -> max |translateY| should approach
    // 3% of imageHeight, nowhere near the default intensity's 15%.
    expect(maxAbsTranslateY).toBeGreaterThan(0);
    expect(maxAbsTranslateY).toBeLessThan(imageHeight * 0.08);
  });
});

const stackedScrollSectionsSlug = "e2e-fixture-parallax-stacked-scroll-sections";

// Regression: on /en/about/, the parallax cover's image-background transform reaches its extreme
// (yPercent +/-15) long before the cover is anywhere near the viewport — confirmed live by reading
// getBoundingClientRect().top (still 1298px below viewport) alongside the image's transform
// (already at the +15 extreme). A single-scroll-section fixture (the describe block above) does
// NOT reproduce this — it needs multiple scroll-sections stacked above the cover, each
// pinning/unpinning .main-wrapper and reflowing document height as the user scrolls past, which is
// /en/about/'s actual shape.
test.describe("Parallax cover after multiple stacked GSAP scroll-sections (kotlinskidev/parallax + kotlinskidev/scroll-section)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      stackedScrollSectionsSlug,
      "E2E Fixture — Parallax After Stacked Scroll Sections",
      buildStackedScrollSectionsContent()
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(stackedScrollSectionsSlug);
  });

  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the image-background transform tracks the cover's actual viewport position, not a stale trigger window", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const image = page.locator(".wp-block-cover.enable-parallax .wp-block-cover__image-background");
    await expect(image).toBeVisible();

    const readTranslateY = async (): Promise<number> => {
      const transform = await image.evaluate((el) => getComputedStyle(el).transform);
      if (transform === "none") {
        return 0;
      }
      const match = /matrix\(([^)]+)\)/.exec(transform);
      const parts = match![1].split(",").map(Number);
      return parts[5];
    };

    const readProgress = async (): Promise<number> => {
      return page.evaluate((selector) => {
        const el = document.querySelector(selector)!;
        const rect = el.getBoundingClientRect();
        const total = window.innerHeight + rect.height;
        return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
      }, ".wp-block-cover.enable-parallax");
    };

    const samples: Array<{ progress: number; translateY: number }> = [];
    for (let i = 0; i < 400; i += 1) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(15);
      const progress = await readProgress();
      const translateY = await readTranslateY();
      samples.push({ progress, translateY });
      if (progress >= 1) {
        break;
      }
    }

    const maxAbsTranslateY = Math.max(...samples.map((sample) => Math.abs(sample.translateY)));
    expect(maxAbsTranslateY).toBeGreaterThan(0);

    const midSamples = samples.filter((sample) => sample.progress > 0.4 && sample.progress < 0.6);
    expect(midSamples.length).toBeGreaterThan(0);

    // At the cover's midpoint transit through the viewport, the tween should be roughly midway
    // through its own range too — not already pinned at an extreme. A stale/mistimed trigger
    // window shows up here as translateY already at (or very near) maxAbsTranslateY while progress
    // is still only ~0.5.
    for (const sample of midSamples) {
      expect(Math.abs(sample.translateY)).toBeLessThan(maxAbsTranslateY * 0.6);
    }
  });
});
