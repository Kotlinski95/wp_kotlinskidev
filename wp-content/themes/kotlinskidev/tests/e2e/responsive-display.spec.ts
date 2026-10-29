import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-responsive-display";

function buildContent(): string {
  const responsiveDisplay = {
    desktop: { display: "flex", justifyContent: "justify-content-center" },
    tablet: { display: "block" },
    mobile: { display: "grid" },
  };

  return `<!-- wp:group ${JSON.stringify({ responsiveDisplay })} -->
<div class="wp-block-group rd-target" style="height:60px"><!-- wp:paragraph -->
<p>RD content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group rd-plain" style="height:60px"><!-- wp:paragraph -->
<p>Plain content</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->`;
}

test.describe("Responsive display (kotlinskidev/responsive-display block extension)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Responsive Display", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.describe("desktop viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("applies the desktop display and justify-content overrides", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .rd-target");
      await expect(target).toHaveCSS("display", "flex");
      await expect(target).toHaveCSS("justify-content", "center");
    });
  });

  test.describe("tablet viewport", () => {
    test.use({ viewport: { width: 900, height: 800 } });

    test("applies the tablet display override instead", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .rd-target");
      await expect(target).toHaveCSS("display", "block");
    });
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("applies the mobile display override instead", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const target = page.locator("main .rd-target");
      await expect(target).toHaveCSS("display", "grid");
    });
  });

  test("a block without responsiveDisplay attributes is left untouched at any width", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const plain = page.locator("main .rd-plain");
    await expect(plain).toHaveCSS("display", "block");
  });
});
