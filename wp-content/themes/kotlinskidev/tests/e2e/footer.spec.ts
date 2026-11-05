import { test, expect, type Page, type Locator } from "@playwright/test";
import { acceptCookies, clickAndExpectNavigation, getFirstLiveLink } from "./utils";

function getBrand(page: Page): Locator {
  return page.locator(".kotlinskidev-footer__brand");
}

function getFooterNavGroups(page: Page): Locator {
  return page.locator(".kotlinskidev-footer__nav .kt-nav-list__group");
}

function getCopyrights(page: Page): Locator {
  return page.locator(".copyrights-container");
}

function getScrollToTopButton(page: Page): Locator {
  return page.locator("#scroll-to-top");
}

function getScrollToTopWrapper(page: Page): Locator {
  return page.locator(".scroll-to-top-wrapper");
}

function getMobileFooterNav(page: Page): Locator {
  return page.locator(".mobile-footer-nav");
}

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("brand block exposes at least one external social link", async ({ page }) => {
    const brand = getBrand(page);
    await expect(brand).toBeVisible();

    const link = brand.locator("a[href]").first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href, "footer brand link must have a real href").toMatch(/^https?:\/\//);
  });

  test("footer navigation lists at least one group of links", async ({ page }) => {
    const groups = getFooterNavGroups(page);
    await expect(groups.first()).toBeVisible();
    await expect(groups.first().locator("a[href]").first()).toBeVisible();
  });

  test("clicking a footer navigation link navigates to that page", async ({ page }) => {
    const groups = getFooterNavGroups(page);
    await clickAndExpectNavigation(page, getFirstLiveLink(groups.first()));
  });

  test("copyrights section displays the current year", async ({ page }) => {
    const copyrights = getCopyrights(page);
    await expect(copyrights).toBeVisible();

    const currentYear = new Date().getFullYear().toString();
    await expect(copyrights).toContainText(currentYear);
    await expect(copyrights).toContainText("©");
  });

  test.describe("scroll-to-top", () => {
    test("is hidden until the page is scrolled past the threshold", async ({ page }) => {
      const wrapper = getScrollToTopWrapper(page);
      await expect(wrapper).not.toHaveClass(/show/);

      await page.evaluate(() => window.scrollTo(0, 400));

      await expect(wrapper).toHaveClass(/show/);
      await expect(getScrollToTopButton(page)).toBeVisible();
    });

    test("clicking it scrolls back to top and moves focus to the main content", async ({
      page,
    }) => {
      await page.evaluate(() => window.scrollTo(0, 1200));
      await expect(getScrollToTopWrapper(page)).toHaveClass(/show/);

      await getScrollToTopButton(page).click();

      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await expect(page.locator("main")).toBeFocused();
    });
  });

  test("mobile footer navigation bar stays hidden at desktop width", async ({ page }) => {
    await expect(getMobileFooterNav(page)).toBeHidden();
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("mobile footer navigation bar is visible with links that navigate correctly", async ({
      page,
    }) => {
      const nav = getMobileFooterNav(page);
      await expect(nav).toBeVisible();

      await clickAndExpectNavigation(page, getFirstLiveLink(nav));
    });

    test("mobile footer navigation bar hides on scroll down and reappears on scroll up, in sync with the header", async ({
      page,
    }) => {
      const nav = getMobileFooterNav(page);
      const header = page.locator("header");
      await expect(nav).not.toHaveClass(/nav-hidden/);

      await page.evaluate(() => window.scrollTo(0, 600));

      await expect(nav).toHaveClass(/nav-hidden/);
      await expect(header).toHaveClass(/nav-hidden/);

      await page.evaluate(() => window.scrollTo(0, 300));

      await expect(nav).not.toHaveClass(/nav-hidden/);
      await expect(header).not.toHaveClass(/nav-hidden/);
    });
  });
});
