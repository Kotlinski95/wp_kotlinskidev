import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-parallax";
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
