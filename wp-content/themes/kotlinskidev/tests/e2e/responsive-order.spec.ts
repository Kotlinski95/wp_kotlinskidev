import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-responsive-order";

function buildContent(): string {
  const responsiveOrder = { desktop: 5, tablet: -1, mobile: 20 };

  return `<!-- wp:group ${JSON.stringify({ responsiveOrder })} -->
<div class="wp-block-group ro-target" style="height:60px"><!-- wp:paragraph -->
<p>RO content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group ro-plain" style="height:60px"><!-- wp:paragraph -->
<p>Plain content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
}

test.describe("Responsive order (kotlinskidev/responsive-order block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Responsive Order", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.describe("desktop viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("applies the desktop order value", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .ro-target");
      await expect(target).toHaveClass(/order-desktop-5/);
      await expect(target).toHaveCSS("order", "5");
    });
  });

  test.describe("tablet viewport", () => {
    test.use({ viewport: { width: 900, height: 800 } });

    test("applies the tablet order value instead", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .ro-target");
      await expect(target).toHaveClass(/order-tablet--1/);
      await expect(target).toHaveCSS("order", "-1");
    });
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("applies the mobile order value instead", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .ro-target");
      await expect(target).toHaveClass(/order-mobile-20/);
      await expect(target).toHaveCSS("order", "20");
    });
  });

  test("a block without responsiveOrder attributes gets no order classes", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const plain = page.locator("main .ro-plain");
    await expect(plain).not.toHaveClass(/order-/);
    await expect(plain).toHaveCSS("order", "0");
  });
});
