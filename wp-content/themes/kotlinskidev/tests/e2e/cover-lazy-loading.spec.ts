import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const IMAGE_URL =
  "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp";
const POSTER_URL =
  "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/about.webp";

test.describe("Cover/Image lazy loading override (kotlinskidev/cover-lazy-loading block extension)", () => {
  test.describe("default (Skip Lazy Loading off)", () => {
    const slug = "e2e-fixture-lazy-default";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const content = `<!-- wp:image {"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="${IMAGE_URL}" alt="team" loading="lazy"/></figure>
<!-- /wp:image -->`;
      fixtureUrl = createFixturePage(slug, "E2E Fixture — Lazy Default", content).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test("leaves the image's lazy-loading attributes untouched", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const img = page.locator("main .wp-block-image img");
      await expect(img).toHaveAttribute("loading", "lazy");
      await expect(img).not.toHaveClass(/no-lazy-loading/);
      await expect(img).not.toHaveAttribute("fetchpriority", "high");
    });
  });

  test.describe("Skip Lazy Loading enabled on an image", () => {
    const slug = "e2e-fixture-lazy-skip-image";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const content = `<!-- wp:image {"sizeSlug":"full","kotlinskidevSkipLazy":true} -->
<figure class="wp-block-image size-full"><img src="${IMAGE_URL}" alt="team" loading="lazy" data-src="placeholder.webp"/></figure>
<!-- /wp:image -->`;
      fixtureUrl = createFixturePage(slug, "E2E Fixture — Lazy Skip Image", content).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test("forces eager loading with high fetch priority and strips lazy attributes", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const img = page.locator("main .wp-block-image img");
      await expect(img).toHaveAttribute("loading", "eager");
      await expect(img).toHaveAttribute("fetchpriority", "high");
      await expect(img).toHaveClass(/\bskip-lazy\b/);
      await expect(img).toHaveClass(/\bno-lazy-loading\b/);
      await expect(img).not.toHaveAttribute("data-src", /.+/);
    });
  });

  test.describe("Skip Lazy Loading enabled on a video cover", () => {
    const slug = "e2e-fixture-lazy-skip-cover-video";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const content = `<!-- wp:cover {"url":"${IMAGE_URL}","backgroundType":"video","kotlinskidevSkipLazy":true,"poster":"${POSTER_URL}","dimRatio":50} -->
<div class="wp-block-cover"><span class="wp-block-cover__background"></span><video class="wp-block-cover__video-background" autoplay muted loop playsinline src="${IMAGE_URL}" data-src="placeholder.webp"></video><div class="wp-block-cover__inner-container"></div></div>
<!-- /wp:cover -->`;
      fixtureUrl = createFixturePage(slug, "E2E Fixture — Lazy Skip Cover Video", content).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test("gives the background video high fetch priority and strips lazy attributes", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const video = page.locator(".wp-block-cover__video-background");
      await expect(video).toHaveAttribute("fetchpriority", "high");
      await expect(video).toHaveClass(/\bskip-lazy\b/);
      await expect(video).toHaveClass(/\bno-lazy-loading\b/);
      await expect(video).not.toHaveAttribute("data-src", /.+/);
    });

    test("preloads the video's poster image in the document head", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const preloadLink = page.locator(`link[rel="preload"][as="image"][href="${POSTER_URL}"]`);
      await expect(preloadLink).toHaveCount(1);
    });
  });
});
