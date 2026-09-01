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

test.describe("Hover colors on a dynamic (render.php-only) block — kotlinskidev/scroll-to-top", () => {
  // Regression test: this block's save() returns null, so it never goes
  // through blocks.getSaveContent.extraProps (the mechanism every static
  // block uses to bake hoverBackgroundColor/hoverTextColor into its saved
  // markup) — that filter only has an element to attach props to when
  // save() actually returns one. hoverAnimation classes were already
  // bridged onto dynamic blocks server-side (includes/hover-animations.php,
  // render_block filter), but the hover color/gradient CSS custom
  // properties and their has-hover-color-transition/has-hover-text-gradient
  // classes were not — silently dropped on every dynamic block, including
  // this one, regardless of what was picked in the editor.
  const dynamicBlockSlug = "e2e-fixture-hover-colors-dynamic-block";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const attrs = {
      variant: "bar",
      hoverBackgroundColor: "#8209d3",
      hoverTextColor: "linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)",
    };
    fixtureUrl = createFixturePage(
      dynamicBlockSlug,
      "E2E Fixture — Hover Colors Dynamic Block",
      `<div style="height:600px">Spacer</div><!-- wp:kotlinskidev/scroll-to-top ${JSON.stringify(attrs)} /-->`
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(dynamicBlockSlug);
  });

  test("the frontend markup carries the color-transition class and CSS custom properties", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const wrapper = page.locator("main .kt-scroll-to-top--bar");
    await expect(wrapper).toHaveClass(/has-hover-color-transition/);
    await expect(wrapper).toHaveClass(/has-hover-text-gradient/);
    expect(
      await wrapper.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--hover-bg-color"))
    ).toBe("#8209d3");
  });

  test("hovering renders the gradient as real text-clipped background, not a solid color", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const wrapper = page.locator("main .kt-scroll-to-top--bar");
    const label = wrapper.locator(".kt-scroll-to-top__trigger span");

    await wrapper.scrollIntoViewIfNeeded();
    await wrapper.hover();

    await expect(label).toHaveCSS("background-image", /gradient/);
    await expect(label).toHaveCSS("-webkit-text-fill-color", "rgba(0, 0, 0, 0)");
  });
});
