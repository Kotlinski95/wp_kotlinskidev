import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-scroll-animations";

function buildContent(): string {
  return `<!-- wp:group {"scrollAnimation":"fade-up-on-scroll"} -->
<div class="wp-block-group fade-up-on-scroll" style="height:60px"><!-- wp:paragraph -->
<p>In view content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:spacer {"height":"1800px"} -->
<div style="height:1800px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {"scrollAnimation":"flip-left-on-scroll","scrollAnimationTranslate":"translate-lg"} -->
<div class="wp-block-group flip-left-on-scroll translate-lg" style="height:60px"><!-- wp:paragraph -->
<p>Below fold content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
}

test.describe("Scroll animations (kotlinskidev/scroll-animations block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Scroll Animations", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("shows animated elements immediately at full opacity when reduced motion is preferred (default)", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const inView = page.locator("main .fade-up-on-scroll");
    await expect(inView).toHaveCSS("opacity", "1");
    await expect(inView).toHaveCSS("transform", "none");

    const belowFold = page.locator("main .flip-left-on-scroll");
    await expect(belowFold).toHaveCSS("opacity", "1");
    await expect(belowFold).toHaveCSS("transform", "none");
  });

  test.describe("with motion allowed", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("an in-viewport fade-up element becomes visible shortly after load", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const inView = page.locator("main .fade-up-on-scroll");
      await expect(inView).toHaveClass(/\bvisible\b/, { timeout: 5000 });
      await expect(inView).toHaveCSS("opacity", "1", { timeout: 5000 });
      await expect(inView).toHaveCSS("transform", "none");
    });

    test("a below-the-fold flip element stays hidden until scrolled into view, then reveals", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const belowFold = page.locator("main .flip-left-on-scroll");
      await expect(belowFold).not.toHaveClass(/\bvisible\b/);
      await expect(belowFold).toHaveCSS("opacity", "0");
      const transformBefore = await belowFold.evaluate((el) => getComputedStyle(el).transform);
      expect(transformBefore).not.toBe("none");

      await belowFold.scrollIntoViewIfNeeded();

      await expect(belowFold).toHaveClass(/\bvisible\b/, { timeout: 5000 });
      await expect(belowFold).toHaveCSS("opacity", "1", { timeout: 5000 });
    });
  });
});
