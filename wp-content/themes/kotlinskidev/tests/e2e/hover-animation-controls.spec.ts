import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-hover-animations";

function buildContent(): string {
  return `<!-- wp:group {"hoverAnimation":"hover-jump"} -->
<div class="wp-block-group hover-jump" style="height:80px"><!-- wp:paragraph -->
<p>Jump target</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"hoverAnimation":"constant-bounce"} -->
<div class="wp-block-group constant-bounce" style="height:80px"><!-- wp:paragraph -->
<p>Bounce target</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group hover-test-plain" style="height:80px"><!-- wp:paragraph -->
<p>Plain target</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
}

test.describe("Hover animation controls (kotlinskidev/hover-animation-controls block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Hover Animations", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("shows the final state immediately with no transform change when reduced motion is preferred (default)", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const jump = page.locator(".hover-jump");
    await jump.hover();
    await expect(jump).toHaveCSS("transform", "none");

    const bounce = page.locator(".constant-bounce");
    const animationName = await bounce.evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");
  });

  test.describe("with motion allowed", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("hovering a hover-jump element translates it upward", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const jump = page.locator(".hover-jump");
      await expect(jump).toHaveCSS("transform", "none");

      await jump.hover();

      await expect(jump).not.toHaveCSS("transform", "none");
    });

    test("a constant-bounce element animates continuously without hovering", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const bounce = page.locator(".constant-bounce");
      const animationName = await bounce.evaluate((el) => getComputedStyle(el).animationName);
      expect(animationName).toBe("constant-bounce");
    });
  });

  test("a block without a hover animation attribute is not affected", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const plain = page.locator(".hover-test-plain");
    await plain.hover();
    await expect(plain).toHaveCSS("transform", "none");
  });
});
