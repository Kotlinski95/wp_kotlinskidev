import { test, expect, type Page, type Locator } from "@playwright/test";
import {
  acceptCookies,
  clickAndExpectNavigation,
  getFirstLiveLink,
  NOT_CURRENT_PAGE,
} from "./utils";

function getLogo(page: Page): Locator {
  return page.locator('header a[rel="home"]');
}

function getMegaNav(page: Page): Locator {
  return page.locator("header .kt-mega-nav");
}

function getContentDropdownTriggers(nav: Locator): Locator {
  return nav.locator(
    `.kt-mega-nav__item[data-panel] > .kt-mega-nav__link:not([href="#"])${NOT_CURRENT_PAGE}`
  );
}

function getExtraLinks(nav: Locator): Locator {
  return nav.locator(`.kt-mega-nav__extras a[href]${NOT_CURRENT_PAGE}`);
}

function getOpenMegaPanel(page: Page): Locator {
  return page.locator(".kt-mega-nav__panel.is-open");
}

async function getLanguageDropdownTrigger(page: Page, nav: Locator): Promise<Locator> {
  const panelId = await page
    .locator(".kt-mega-nav__panel:has(.kt-lang-panel__list)")
    .getAttribute("data-panel");
  return nav.locator(`.kt-mega-nav__item[data-panel="${panelId}"] > .kt-mega-nav__link`);
}

async function getSearchDropdownTrigger(page: Page, nav: Locator): Promise<Locator> {
  const panelId = await page
    .locator('.kt-mega-nav__panel:has(input[type="search"])')
    .getAttribute("data-panel");
  return nav.locator(`.kt-mega-nav__item[data-panel="${panelId}"] > .kt-mega-nav__link`);
}

function getOtherLanguageLink(container: Locator): Locator {
  return container
    .locator('a.wp-block-navigation-item__content:not([aria-current="page"])')
    .first();
}

async function getControlledPanel(page: Page, trigger: Locator): Promise<Locator> {
  const id = await trigger.getAttribute("aria-controls");
  expect(
    id,
    "trigger must declare aria-controls pointing at the panel/dialog it opens"
  ).toBeTruthy();
  return page.locator(`#${id}`);
}

function getDesktopHamburger(page: Page): Locator {
  return page.locator("header .nav-desktop.kt-hamburger-desktop");
}

function getMobileHamburger(page: Page): Locator {
  return page.locator("header .nav-mobile.kt-hamburger-desktop");
}

function getOpenButton(hamburger: Locator): Locator {
  return hamburger.locator(".wp-block-navigation__responsive-container-open");
}

function getCloseButton(hamburger: Locator): Locator {
  return hamburger.locator(".wp-block-navigation__responsive-container-close");
}

function getTopLevelToggles(hamburger: Locator): Locator {
  return hamburger.locator(
    ".wp-block-navigation__container > .wp-block-navigation-item > .wp-block-navigation-submenu__toggle"
  );
}

function getPlainTopLevelLinks(hamburger: Locator): Locator {
  return hamburger.locator(
    `.wp-block-navigation__container > .wp-block-navigation-item:not(:has(> .wp-block-navigation-submenu__toggle)) > .wp-block-navigation-item__content${NOT_CURRENT_PAGE}`
  );
}

function getTopLevelLinksWithDropdown(hamburger: Locator): Locator {
  return hamburger.locator(
    ".wp-block-navigation__container > .wp-block-navigation-item:has(> .wp-block-navigation-submenu__toggle) > .wp-block-navigation-item__content"
  );
}

// Playwright locator chaining (`.locator(a).locator(':scope > b:has(...)')`) does not
// reliably combine `:scope` with a `:has()` in the *chained* fragment — confirmed
// empirically (a single combined selector string works, splitting it across two
// `.locator()` calls silently returns 0 matches). So every level below is built as
// one fully self-contained selector string, always rooted at `hamburger`, rather
// than chained off a previously-captured locator.
const TOP_ITEM_EXPANDED =
  '.wp-block-navigation__container > .wp-block-navigation-item:has(> .wp-block-navigation-submenu__toggle[aria-expanded="true"])';

function getRevealedLinksOfExpandedTopItem(hamburger: Locator): Locator {
  return hamburger.locator(
    `${TOP_ITEM_EXPANDED} > .wp-block-navigation__submenu-container a.wp-block-navigation-item__content${NOT_CURRENT_PAGE}`
  );
}

function getTopTogglesWithNestedSubmenu(hamburger: Locator): Locator {
  return hamburger.locator(
    ".wp-block-navigation__container > .wp-block-navigation-item:has(> .wp-block-navigation__submenu-container .wp-block-navigation-submenu__toggle) > .wp-block-navigation-submenu__toggle"
  );
}

function getNestedTogglesOfExpandedTopItem(hamburger: Locator): Locator {
  return hamburger.locator(
    `${TOP_ITEM_EXPANDED} > .wp-block-navigation__submenu-container .wp-block-navigation-submenu__toggle`
  );
}

const NESTED_ITEM_EXPANDED = `${TOP_ITEM_EXPANDED} > .wp-block-navigation__submenu-container .wp-block-navigation-item:has(> .wp-block-navigation-submenu__toggle[aria-expanded="true"])`;

function getRevealedLinksOfExpandedNestedItem(hamburger: Locator): Locator {
  return hamburger.locator(
    `${NESTED_ITEM_EXPANDED} > .wp-block-navigation__submenu-container a.wp-block-navigation-item__content${NOT_CURRENT_PAGE}`
  );
}

test.describe("Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test.describe("desktop viewport", () => {
    test("logo links back to the homepage", async ({ page }) => {
      const logo = getLogo(page);
      await expect(logo).toBeVisible();
      await expect(page.locator("html")).toBeVisible();
      const href = await logo.getAttribute("href");
      expect(new URL(href!).pathname).toBe("/");
    });

    test("main navigation exposes at least one dropdown item and one plain CTA link", async ({
      page,
    }) => {
      const nav = getMegaNav(page);
      await expect(nav).toBeVisible();
      await expect(getContentDropdownTriggers(nav).first()).toBeVisible();
      await expect(getExtraLinks(nav).first()).toBeVisible();
    });

    test("hovering a primary nav item reveals its mega panel", async ({ page }) => {
      const nav = getMegaNav(page);
      const trigger = getContentDropdownTriggers(nav).first();

      await trigger.hover();

      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(getOpenMegaPanel(page)).toBeVisible();
    });

    test("Escape closes an open mega panel", async ({ page }) => {
      const nav = getMegaNav(page);
      const trigger = getContentDropdownTriggers(nav).first();
      const panel = getOpenMegaPanel(page);

      await trigger.hover();
      await expect(panel).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toHaveCount(0);
    });

    test("clicking a primary nav item navigates to its page", async ({ page }) => {
      const nav = getMegaNav(page);
      await clickAndExpectNavigation(page, getContentDropdownTriggers(nav).first());
    });

    test("clicking the mega-nav's extra CTA link navigates to its own destination", async ({
      page,
    }) => {
      const nav = getMegaNav(page);
      await clickAndExpectNavigation(page, getExtraLinks(nav).first());
    });

    test("clicking a link inside an open mega panel navigates to that page", async ({ page }) => {
      const nav = getMegaNav(page);
      await getContentDropdownTriggers(nav).first().hover();

      const panel = getOpenMegaPanel(page);
      await expect(panel).toBeVisible();

      await clickAndExpectNavigation(page, getFirstLiveLink(panel));
    });

    test("search dropdown opens with a search field and at least one link", async ({ page }) => {
      const nav = getMegaNav(page);
      const trigger = await getSearchDropdownTrigger(page, nav);
      await trigger.click();

      const panel = getOpenMegaPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel.locator('input[type="search"]')).toBeVisible();
      await expect(getFirstLiveLink(panel)).toBeVisible();
    });

    test("clicking a link inside the search dropdown navigates to that page", async ({ page }) => {
      const nav = getMegaNav(page);
      const trigger = await getSearchDropdownTrigger(page, nav);
      await trigger.click();

      const panel = getOpenMegaPanel(page);
      await clickAndExpectNavigation(page, getFirstLiveLink(panel));
    });

    test("language switcher reveals a panel with a link to at least one other language", async ({
      page,
    }) => {
      const nav = getMegaNav(page);
      const trigger = await getLanguageDropdownTrigger(page, nav);
      await trigger.click();

      const panel = getOpenMegaPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel.locator('a[aria-current="page"]')).toHaveCount(1);
      await expect(getOtherLanguageLink(panel)).toBeVisible();
    });

    test("switching language via the header navigates to the other language's homepage", async ({
      page,
    }) => {
      const nav = getMegaNav(page);
      const trigger = await getLanguageDropdownTrigger(page, nav);
      await trigger.click();

      const panel = getOpenMegaPanel(page);
      const otherLanguage = getOtherLanguageLink(panel);
      const targetHref = await otherLanguage.getAttribute("href");

      await otherLanguage.click();

      await expect(page).toHaveURL(targetHref!);
      await expect(page.locator("html")).not.toHaveAttribute("lang", "pl-PL");
    });

    test("desktop hamburger opens an overlay menu and focuses its close button", async ({
      page,
    }) => {
      const hamburger = getDesktopHamburger(page);
      const openButton = getOpenButton(hamburger);
      const closeButton = getCloseButton(hamburger);

      await expect(closeButton).toBeHidden();

      await openButton.click();

      await expect(closeButton).toBeVisible();
      await expect(closeButton).toBeFocused();

      await closeButton.click();

      await expect(closeButton).toBeHidden();
    });

    test("desktop hamburger overlay: expanding a submenu reveals and navigates its child links", async ({
      page,
    }) => {
      const hamburger = getDesktopHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopLevelToggles(hamburger).first();
      await topToggle.click();
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");

      await clickAndExpectNavigation(page, getRevealedLinksOfExpandedTopItem(hamburger).first());
    });

    test("desktop hamburger overlay: expanding a nested (grandchild) submenu reveals and navigates its links", async ({
      page,
    }) => {
      const hamburger = getDesktopHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopTogglesWithNestedSubmenu(hamburger).first();
      test.skip(
        (await topToggle.count()) === 0,
        "No top-level menu item currently has a nested (grandchild) submenu to test"
      );

      await topToggle.click();
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");

      const nestedToggle = getNestedTogglesOfExpandedTopItem(hamburger).first();
      await nestedToggle.click();
      await expect(nestedToggle).toHaveAttribute("aria-expanded", "true");

      await clickAndExpectNavigation(page, getRevealedLinksOfExpandedNestedItem(hamburger).first());
    });

    test("desktop hamburger overlay: expanding a submenu collapses its open sibling at the same nesting level", async ({
      page,
    }) => {
      const hamburger = getDesktopHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopTogglesWithNestedSubmenu(hamburger).first();
      test.skip(
        (await topToggle.count()) === 0,
        "No top-level menu item currently has a nested submenu to test sibling collapse against"
      );
      await topToggle.click();

      const nestedToggles = getNestedTogglesOfExpandedTopItem(hamburger);
      test.skip(
        (await nestedToggles.count()) < 2,
        "Fewer than two nested siblings — nothing to collapse"
      );

      const firstNested = nestedToggles.nth(0);
      const secondNested = nestedToggles.nth(1);

      await firstNested.click();
      await expect(firstNested).toHaveAttribute("aria-expanded", "true");

      await secondNested.click();

      await expect(secondNested).toHaveAttribute("aria-expanded", "true");
      await expect(firstNested).toHaveAttribute("aria-expanded", "false");
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");
    });

    test("desktop hamburger overlay: expanding a top-level item collapses the previously open one", async ({
      page,
    }) => {
      const hamburger = getDesktopHamburger(page);
      await getOpenButton(hamburger).click();

      const toggles = getTopLevelToggles(hamburger);
      test.skip(
        (await toggles.count()) < 2,
        "Fewer than two top-level items with submenus — nothing to collapse"
      );

      const first = toggles.nth(0);
      const second = toggles.nth(1);

      await first.click();
      await expect(first).toHaveAttribute("aria-expanded", "true");

      await second.click();

      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });

    test("header stays pinned to the viewport top while scrolling", async ({ page }) => {
      const header = page.locator("header");
      await expect(header).toHaveCSS("position", "fixed");

      await page.evaluate(() => window.scrollTo(0, 800));

      await expect
        .poll(() => header.evaluate((el) => el.getBoundingClientRect().top))
        .toBeLessThan(20);
    });

    test("header becomes sticky past the scroll threshold and reverts near the top", async ({
      page,
    }) => {
      const header = page.locator("header");
      await expect(header).not.toHaveClass(/header-sticky/);
      const initialWidth = (await header.boundingBox())!.width;

      await page.evaluate(() => window.scrollTo(0, 400));

      await expect(header).toHaveClass(/header-sticky/);
      await expect.poll(async () => (await header.boundingBox())!.width).toBeLessThan(initialWidth);

      await page.evaluate(() => window.scrollTo(0, 0));

      await expect(header).not.toHaveClass(/header-sticky/);
    });

    test("mega panel stays correctly anchored below the header while it is sticky", async ({
      page,
    }) => {
      await page.evaluate(() => window.scrollTo(0, 400));
      await expect(page.locator("header")).toHaveClass(/header-sticky/);

      const nav = getMegaNav(page);
      await getContentDropdownTriggers(nav).first().hover();

      const panel = getOpenMegaPanel(page);
      await expect(panel).toBeVisible();

      const headerBox = (await page.locator("header").boundingBox())!;
      const panelBox = (await panel.boundingBox())!;
      const viewportSize = page.viewportSize()!;

      expect(panelBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 5);
      expect(panelBox.x).toBeGreaterThanOrEqual(0);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewportSize.width);

      await clickAndExpectNavigation(page, getFirstLiveLink(panel));
    });
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("mobile hamburger opens overlay menu and focuses its close button", async ({ page }) => {
      const hamburger = getMobileHamburger(page);
      const openButton = getOpenButton(hamburger);
      const closeButton = getCloseButton(hamburger);

      await expect(closeButton).toBeHidden();

      await openButton.click();

      await expect(closeButton).toBeVisible();
      await expect(closeButton).toBeFocused();

      await closeButton.click();

      await expect(closeButton).toBeHidden();
    });

    test("clicking a plain top-level link (no dropdown) in the mobile menu navigates directly", async ({
      page,
    }) => {
      // The homepage is usually the only "plain, no-dropdown" top-level item, and
      // beforeEach already starts on the homepage — where it's the current page and
      // therefore intentionally non-interactive (see NOT_CURRENT_PAGE). Navigate away
      // first, using a link the menu itself provides, so the test is self-bootstrapping
      // instead of assuming any specific other page exists.
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      const awayHref = await getTopLevelLinksWithDropdown(hamburger).first().getAttribute("href");
      test.skip(!awayHref, "No other top-level page found to navigate away from home first");
      await page.goto(awayHref!);
      await acceptCookies(page);

      const hamburgerAgain = getMobileHamburger(page);
      await getOpenButton(hamburgerAgain).click();

      const link = getPlainTopLevelLinks(hamburgerAgain).first();
      test.skip(
        (await link.count()) === 0,
        "No plain top-level link (without a dropdown) other than the current page exists to test"
      );

      await clickAndExpectNavigation(page, link);
    });

    test("expanding a submenu in the mobile menu reveals and navigates its child links", async ({
      page,
    }) => {
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopLevelToggles(hamburger).first();
      await topToggle.click();
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");

      await clickAndExpectNavigation(page, getRevealedLinksOfExpandedTopItem(hamburger).first());
    });

    test("mobile menu: expanding a nested (grandchild) submenu reveals and navigates its links", async ({
      page,
    }) => {
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopTogglesWithNestedSubmenu(hamburger).first();
      test.skip(
        (await topToggle.count()) === 0,
        "No top-level menu item currently has a nested (grandchild) submenu to test"
      );

      await topToggle.click();
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");

      const nestedToggle = getNestedTogglesOfExpandedTopItem(hamburger).first();
      await nestedToggle.click();
      await expect(nestedToggle).toHaveAttribute("aria-expanded", "true");

      await clickAndExpectNavigation(page, getRevealedLinksOfExpandedNestedItem(hamburger).first());
    });

    test("mobile menu: expanding a submenu collapses its open sibling at the same nesting level", async ({
      page,
    }) => {
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      const topToggle = getTopTogglesWithNestedSubmenu(hamburger).first();
      test.skip(
        (await topToggle.count()) === 0,
        "No top-level menu item currently has a nested submenu to test sibling collapse against"
      );
      await topToggle.click();

      const nestedToggles = getNestedTogglesOfExpandedTopItem(hamburger);
      test.skip(
        (await nestedToggles.count()) < 2,
        "Fewer than two nested siblings — nothing to collapse"
      );

      const firstNested = nestedToggles.nth(0);
      const secondNested = nestedToggles.nth(1);

      await firstNested.click();
      await expect(firstNested).toHaveAttribute("aria-expanded", "true");

      await secondNested.click();

      await expect(secondNested).toHaveAttribute("aria-expanded", "true");
      await expect(firstNested).toHaveAttribute("aria-expanded", "false");
      await expect(topToggle).toHaveAttribute("aria-expanded", "true");
    });

    test("mobile menu: expanding a top-level item collapses the previously open one", async ({
      page,
    }) => {
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      const toggles = getTopLevelToggles(hamburger);
      test.skip(
        (await toggles.count()) < 2,
        "Fewer than two top-level items with submenus — nothing to collapse"
      );

      const first = toggles.nth(0);
      const second = toggles.nth(1);

      await first.click();
      await expect(first).toHaveAttribute("aria-expanded", "true");

      await second.click();

      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });

    test("language switcher opens a panel and switches to another language", async ({ page }) => {
      const trigger = page.locator(".kt-lang-panel__trigger");
      await trigger.click();

      const panel = await getControlledPanel(page, trigger);
      await expect(panel).toBeVisible();

      const otherLanguage = getOtherLanguageLink(panel);
      const targetHref = await otherLanguage.getAttribute("href");

      await otherLanguage.click();

      await expect(page).toHaveURL(targetHref!);
      await expect(page.locator("html")).not.toHaveAttribute("lang", "pl-PL");
    });

    test("search dropdown opens with a search field and at least one link", async ({ page }) => {
      const trigger = page.locator(".kt-search-panel__trigger");
      await trigger.click();

      const panel = await getControlledPanel(page, trigger);
      await expect(panel).toBeVisible();
      await expect(panel.locator('input[type="search"]')).toBeVisible();
      await expect(getFirstLiveLink(panel)).toBeVisible();
    });

    test("clicking a link inside the mobile search dropdown navigates to that page", async ({
      page,
    }) => {
      const trigger = page.locator(".kt-search-panel__trigger");
      await trigger.click();

      const panel = await getControlledPanel(page, trigger);
      await clickAndExpectNavigation(page, getFirstLiveLink(panel));
    });

    test("header stays pinned to the viewport top while scrolling", async ({ page }) => {
      const header = page.locator("header");
      await expect(header).toHaveCSS("position", "fixed");

      await page.evaluate(() => window.scrollTo(0, 400));

      await expect
        .poll(() => header.evaluate((el) => el.getBoundingClientRect().top))
        .toBeLessThan(20);
    });

    test("header hides on scroll down and reappears on scroll up", async ({ page }) => {
      const header = page.locator("header");
      await expect(header).not.toHaveClass(/nav-hidden/);

      await page.evaluate(() => window.scrollTo(0, 600));

      await expect(header).toHaveClass(/nav-hidden/);
      await expect
        .poll(() => header.evaluate((el) => el.getBoundingClientRect().top))
        .toBeLessThan(-20);

      await page.evaluate(() => window.scrollTo(0, 300));

      await expect(header).not.toHaveClass(/nav-hidden/);
      await expect
        .poll(() => header.evaluate((el) => el.getBoundingClientRect().top))
        .toBeGreaterThanOrEqual(-1);
    });

    test("header stays visible while the mobile menu is open, even if the page is scrolled", async ({
      page,
    }) => {
      const hamburger = getMobileHamburger(page);
      await getOpenButton(hamburger).click();

      await page.evaluate(() => window.scrollTo(0, 400));

      await expect
        .poll(() => page.locator("header").evaluate((el) => el.getBoundingClientRect().top))
        .toBeGreaterThanOrEqual(-1);
    });
  });
});
