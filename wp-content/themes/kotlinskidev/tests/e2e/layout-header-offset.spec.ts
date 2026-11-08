import { test, expect, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-layout-header-offset";
const longTrailSlug = "e2e-fixture-layout-header-offset-long-trail";

const VALID_CSS_LENGTH = /^-?[0-9]*\.?[0-9]+(rem|px|em)$/;

async function getLayoutOffsets(page: Page) {
  return page.evaluate(() => {
    function measurePaddingTopWithFreshElement(cssValue: string): number {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.visibility = "hidden";
      el.style.paddingTop = cssValue;
      document.body.appendChild(el);
      const value = parseFloat(getComputedStyle(el).paddingTop);
      el.remove();
      return value;
    }

    const headerPx = measurePaddingTopWithFreshElement("var(--kt-header-height)");
    const breadcrumbsPx = measurePaddingTopWithFreshElement("var(--kt-breadcrumbs-height)");
    const combinedPx = measurePaddingTopWithFreshElement(
      "calc(var(--kt-header-height) + var(--kt-breadcrumbs-height))"
    );

    const rawHeaderHeight = getComputedStyle(document.body)
      .getPropertyValue("--kt-header-height")
      .trim();
    const rawBreadcrumbsHeight = getComputedStyle(document.body)
      .getPropertyValue("--kt-breadcrumbs-height")
      .trim();

    const main = document.querySelector("main.main-wrapper");
    const mainPaddingTopPx = main ? parseFloat(getComputedStyle(main).paddingTop) : null;

    return {
      headerPx,
      breadcrumbsPx,
      combinedPx,
      rawHeaderHeight,
      rawBreadcrumbsHeight,
      mainPaddingTopPx,
    };
  });
}

test.describe("Header/breadcrumbs offset CSS custom properties (--kt-header-height, --kt-breadcrumbs-height)", () => {
  let fixtureUrl: string;
  let longTrailFixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Layout Header Offset",
      "<!-- wp:paragraph --><p>Fixture content</p><!-- /wp:paragraph -->"
    ).url;
    longTrailFixtureUrl = createFixturePage(
      longTrailSlug,
      "E2E Fixture — An Extremely Long Page Title That Should Never Force The Fixed Breadcrumbs Bar To Wrap Onto A Second Line No Matter How Long The Breadcrumb Trail Text Actually Is",
      "<!-- wp:paragraph --><p>Fixture content</p><!-- /wp:paragraph -->"
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
    deleteFixturePage(longTrailSlug);
  });

  test("both custom properties resolve to valid, unit-bearing CSS lengths, never a bare unitless zero", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookies(page);

    const { rawHeaderHeight, rawBreadcrumbsHeight } = await getLayoutOffsets(page);

    expect(rawHeaderHeight).toMatch(VALID_CSS_LENGTH);
    expect(rawBreadcrumbsHeight).toMatch(VALID_CSS_LENGTH);
  });

  test("on the homepage, main content padding-top equals the header height alone, not 0px", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookies(page);

    const { headerPx, breadcrumbsPx, mainPaddingTopPx } = await getLayoutOffsets(page);

    expect(headerPx).toBeGreaterThan(0);
    expect(breadcrumbsPx).toBe(0);
    expect(mainPaddingTopPx).not.toBe(0);
    expect(mainPaddingTopPx).toBe(headerPx);
  });

  test("on a regular page showing breadcrumbs, main content padding-top equals header height plus breadcrumbs height, not 0px", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    await expect(page.locator(".kt-breadcrumbs")).toBeVisible();

    const { breadcrumbsPx, combinedPx, mainPaddingTopPx } = await getLayoutOffsets(page);

    expect(breadcrumbsPx).toBeGreaterThan(0);
    expect(mainPaddingTopPx).not.toBe(0);
    expect(mainPaddingTopPx).toBe(combinedPx);
  });

  test("main content never overlaps the fixed breadcrumbs bar on a page that shows one", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const breadcrumbs = page.locator(".kt-breadcrumbs");
    await expect(breadcrumbs).toBeVisible();

    const breadcrumbsBox = await breadcrumbs.boundingBox();
    const contentBox = await page.getByText("Fixture content").boundingBox();

    expect(breadcrumbsBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    expect(contentBox!.y).toBeGreaterThanOrEqual(breadcrumbsBox!.y + breadcrumbsBox!.height);
  });

  test("the breadcrumbs bar stays a single line and its height doesn't grow, even with a trail long enough to overflow its width", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
    const shortTrailHeight = await page.locator(".kt-breadcrumbs").boundingBox();

    await page.goto(longTrailFixtureUrl);
    const longTrailBreadcrumbs = page.locator(".kt-breadcrumbs");
    await expect(longTrailBreadcrumbs).toBeVisible();
    const longTrailHeight = await longTrailBreadcrumbs.boundingBox();

    expect(shortTrailHeight).not.toBeNull();
    expect(longTrailHeight).not.toBeNull();
    expect(longTrailHeight!.height).toBe(shortTrailHeight!.height);
  });

  test("the breadcrumbs list scrolls horizontally instead of wrapping when its trail overflows the available width", async ({
    page,
  }) => {
    await page.goto(longTrailFixtureUrl);
    await acceptCookies(page);

    const list = page.locator(".kt-breadcrumbs__list");
    await expect(list).toBeVisible();

    const overflow = await list.evaluate((el) => ({
      flexWrap: getComputedStyle(el).flexWrap,
      isScrollable: el.scrollWidth > el.clientWidth,
    }));

    expect(overflow.flexWrap).toBe("nowrap");
    expect(overflow.isScrollable).toBe(true);
  });
});
