import { test, expect, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

function buildNavLink(label: string): string {
  const attrs = {
    label,
    style: {
      border: { color: "#1a1a2e", width: "2px", style: "solid", radius: "0.5rem" },
      spacing: { padding: { top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" } },
    },
    backgroundColor: "primary",
    textColor: "white",
  };
  return `<!-- wp:kotlinskidev/content-tabs-nav-link ${JSON.stringify(attrs)} /-->`;
}

function buildItem(label: string, panelText: string): string {
  const itemAttrs = {
    style: {
      border: { color: "#dddddd", width: "1px", style: "solid", radius: "0.25rem" },
    },
    backgroundColor: "surface-light",
  };
  return (
    `<!-- wp:kotlinskidev/content-tabs-item ${JSON.stringify(itemAttrs)} -->\n` +
    buildNavLink(label) +
    `\n<!-- wp:paragraph --><p>${panelText}</p><!-- /wp:paragraph -->\n` +
    `<!-- /wp:kotlinskidev/content-tabs-item -->`
  );
}

function buildContentTabsContent(navPosition: string): string {
  return buildContentTabsContentWithAttrs({ navPosition });
}

function buildContentTabsContentWithAttrs(attrs: Record<string, unknown>): string {
  const items = [
    buildItem("One", "Panel one content"),
    buildItem("Two", "Panel two content"),
    buildItem("Three", "Panel three content"),
  ].join("\n");
  return (
    `<div style="height:600px">Spacer</div>` +
    `<!-- wp:kotlinskidev/content-tabs ${JSON.stringify(attrs)} -->\n${items}\n<!-- /wp:kotlinskidev/content-tabs -->`
  );
}

async function getVisiblePanelText(page: Page): Promise<string | null> {
  return page.locator(".kt-content-tabs__panel:not([hidden])").first().textContent();
}

async function getNavAndPanelsBoxes(page: Page) {
  const nav = await page.locator(".kt-content-tabs__nav").boundingBox();
  const panels = await page.locator(".kt-content-tabs__panels").boundingBox();
  expect(nav).not.toBeNull();
  expect(panels).not.toBeNull();
  return { nav: nav!, panels: panels! };
}

test.describe("Content Tabs (kotlinskidev/content-tabs) — horizontal (top)", () => {
  const slug = "e2e-fixture-content-tabs-top";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Top",
      buildContentTabsContent("top")
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("renders a tablist with three tabs and shows only the first panel initially", async ({
    page,
  }) => {
    const tablist = page.locator('.kt-content-tabs__nav[role="tablist"]');
    await expect(tablist).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(3);

    const first = page.getByRole("tab", { name: "One" });
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "false");

    await expect(page.locator(".kt-content-tabs__panel:not([hidden])")).toHaveCount(1);
    expect(await getVisiblePanelText(page)).toContain("Panel one content");
  });

  test("clicking a tab switches the visible panel and updates aria-selected", async ({ page }) => {
    await page.getByRole("tab", { name: "Two" }).click();

    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "false");
    expect(await getVisiblePanelText(page)).toContain("Panel two content");
    await expect(page.locator(".kt-content-tabs__panel:not([hidden])")).toHaveCount(1);
  });

  test("ArrowRight moves to the next tab and wraps from the last to the first", async ({
    page,
  }) => {
    const first = page.getByRole("tab", { name: "One" });
    await first.focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first).toBeFocused();
  });

  test("Home and End jump to the first and last tab", async ({ page }) => {
    await page.getByRole("tab", { name: "Two" }).focus();

    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  });

  test("applies the configured background, text color, and border to the active nav-link", async ({
    page,
  }) => {
    const activeTab = page.getByRole("tab", { name: "One" });
    const styledLabel = activeTab.locator(".wp-block-kotlinskidev-content-tabs-nav-link");

    await expect(styledLabel).toHaveCSS("background-color", "rgb(130, 9, 211)");
    await expect(styledLabel).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(styledLabel).toHaveCSS("border-top-width", "2px");
    await expect(styledLabel).toHaveCSS("border-top-color", "rgb(26, 26, 46)");
  });

  test("applies the configured background and border to the panel wrapper", async ({ page }) => {
    const panel = page.locator(".kt-content-tabs__panel:not([hidden])");

    await expect(panel).toHaveCSS("border-top-width", "1px");
    await expect(panel).toHaveCSS("border-top-color", "rgb(221, 221, 221)");
  });

  test("places the nav row above the panels", async ({ page }) => {
    const { nav, panels } = await getNavAndPanelsBoxes(page);

    expect(nav.y).toBeLessThan(panels.y);
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — horizontal (bottom)", () => {
  const slug = "e2e-fixture-content-tabs-bottom";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Bottom",
      buildContentTabsContent("bottom")
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("exposes a horizontal orientation and the bottom modifier class", async ({ page }) => {
    await expect(page.locator(".kt-content-tabs__nav")).toHaveAttribute(
      "aria-orientation",
      "horizontal"
    );
    await expect(page.locator(".kt-content-tabs")).toHaveClass(/kt-content-tabs--bottom/);
  });

  test("places the nav row below the panels", async ({ page }) => {
    const { nav, panels } = await getNavAndPanelsBoxes(page);

    expect(nav.y).toBeGreaterThan(panels.y);
  });

  test("ArrowRight/ArrowLeft still move between tabs when the nav is at the bottom", async ({
    page,
  }) => {
    const first = page.getByRole("tab", { name: "One" });
    await first.focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowLeft");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — vertical (left)", () => {
  const slug = "e2e-fixture-content-tabs-left";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Left",
      buildContentTabsContent("left")
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("exposes a vertical orientation on the tablist", async ({ page }) => {
    await expect(page.locator(".kt-content-tabs__nav")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
    await expect(page.locator(".kt-content-tabs")).toHaveClass(/kt-content-tabs--left/);
  });

  test("ArrowDown/ArrowUp move between tabs instead of ArrowRight/ArrowLeft", async ({ page }) => {
    const first = page.getByRole("tab", { name: "One" });
    await first.focus();

    await page.keyboard.press("ArrowRight");
    await expect(first).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowUp");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });

  test("places the nav column to the left of the panels", async ({ page }) => {
    const { nav, panels } = await getNavAndPanelsBoxes(page);

    expect(nav.x).toBeLessThan(panels.x);
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — vertical (right)", () => {
  const slug = "e2e-fixture-content-tabs-right";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Right",
      buildContentTabsContent("right")
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("exposes a vertical orientation and the right modifier class", async ({ page }) => {
    await expect(page.locator(".kt-content-tabs__nav")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
    await expect(page.locator(".kt-content-tabs")).toHaveClass(/kt-content-tabs--right/);
  });

  test("places the nav column to the right of the panels", async ({ page }) => {
    const { nav, panels } = await getNavAndPanelsBoxes(page);

    expect(nav.x).toBeGreaterThan(panels.x);
  });

  test("ArrowDown/ArrowUp move between tabs when the nav is on the right", async ({ page }) => {
    const first = page.getByRole("tab", { name: "One" });
    await first.focus();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowUp");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — responsive nav position", () => {
  const slug = "e2e-fixture-content-tabs-responsive";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Responsive",
      buildContentTabsContentWithAttrs({ navPosition: "left", navPositionMobile: "bottom" })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("desktop viewport keeps the nav on the left, vertical", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const { nav, panels } = await getNavAndPanelsBoxes(page);
    expect(nav.x).toBeLessThan(panels.x);
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("switches to the bottom position and lays the nav out in one scrollable line", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const { nav, panels } = await getNavAndPanelsBoxes(page);
      expect(nav.y).toBeGreaterThan(panels.y);

      const navEl = page.locator(".kt-content-tabs__nav");
      await expect(navEl).toHaveCSS("flex-wrap", "nowrap");
      await expect(navEl).toHaveCSS("overflow-x", "auto");

      const tabBoxes = await Promise.all(
        (await page.getByRole("tab").all()).map((tab) => tab.boundingBox())
      );
      const firstTop = tabBoxes[0]!.y;
      for (const box of tabBoxes) {
        expect(Math.abs(box!.y - firstTop)).toBeLessThan(2);
      }
    });
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — nav gap per breakpoint", () => {
  const slug = "e2e-fixture-content-tabs-gap";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Gap",
      buildContentTabsContentWithAttrs({
        navPosition: "top",
        navGap: { desktop: 32, mobile: 4 },
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("applies the desktop gap on a desktop viewport", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    await expect(page.locator(".kt-content-tabs__nav")).toHaveCSS("gap", "32px");
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("applies the mobile gap instead", async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      await expect(page.locator(".kt-content-tabs__nav")).toHaveCSS("gap", "4px");
    });
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — active tab style: text color only", () => {
  const slug = "e2e-fixture-content-tabs-active-color";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Active Color",
      buildContentTabsContentWithAttrs({
        navPosition: "top",
        activeTabUnderline: false,
        activeTabTextColorEnabled: true,
        activeTabColor: "#ff0000",
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("colors only the active tab trigger, not the inactive ones, and skips the underline", async ({
    page,
  }) => {
    const activeTrigger = page.locator('.kt-content-tabs__nav-trigger[aria-selected="true"]');
    const inactiveTrigger = page
      .locator('.kt-content-tabs__nav-trigger[aria-selected="false"]')
      .first();

    await expect(activeTrigger).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(activeTrigger).toHaveCSS("text-decoration-line", "none");
    await expect(inactiveTrigger).not.toHaveCSS("color", "rgb(255, 0, 0)");
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — active tab style: background only", () => {
  const slug = "e2e-fixture-content-tabs-active-bg";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Active Background",
      buildContentTabsContentWithAttrs({
        navPosition: "top",
        activeTabUnderline: false,
        activeTabBackgroundEnabled: true,
        activeTabBackgroundColor: "#8209d3",
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("applies the background to the active tab trigger only, leaving text color untouched since its own toggle is off", async ({
    page,
  }) => {
    const activeTrigger = page.locator('.kt-content-tabs__nav-trigger[aria-selected="true"]');
    const inactiveTrigger = page
      .locator('.kt-content-tabs__nav-trigger[aria-selected="false"]')
      .first();

    await expect(activeTrigger).toHaveCSS("background-color", "rgb(130, 9, 211)");
    await expect(inactiveTrigger).not.toHaveCSS("background-color", "rgb(130, 9, 211)");
    await expect(activeTrigger).toHaveCSS(
      "color",
      await inactiveTrigger.evaluate((el) => getComputedStyle(el).color)
    );
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — active tab style: underline + text color + background combined", () => {
  const slug = "e2e-fixture-content-tabs-active-combined";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Active Combined",
      buildContentTabsContentWithAttrs({
        navPosition: "top",
        activeTabUnderline: true,
        activeTabTextColorEnabled: true,
        activeTabColor: "#ffffff",
        activeTabBackgroundEnabled: true,
        activeTabBackgroundColor: "#8209d3",
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("applies underline, text color, and background all at once on the active tab", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const activeTrigger = page.locator('.kt-content-tabs__nav-trigger[aria-selected="true"]');

    await expect(activeTrigger).toHaveCSS("text-decoration-line", "underline");
    await expect(activeTrigger).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(activeTrigger).toHaveCSS("background-color", "rgb(130, 9, 211)");
  });
});

test.describe("Content Tabs (kotlinskidev/content-tabs) — active tab text color as a gradient", () => {
  const slug = "e2e-fixture-content-tabs-active-text-gradient";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Content Tabs Active Text Gradient",
      buildContentTabsContentWithAttrs({
        navPosition: "top",
        activeTabUnderline: false,
        activeTabTextColorEnabled: true,
        activeTabColor: "linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)",
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("renders the gradient as a real text-clipped background on the active tab label, not a solid color", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    const activeLabel = page
      .locator('.kt-content-tabs__nav-trigger[aria-selected="true"]')
      .locator(".wp-block-kotlinskidev-content-tabs-nav-link");

    await expect(activeLabel).toHaveCSS("background-image", /gradient/);
    // Chromium reports the computed -webkit-text-fill-color for the
    // `transparent` keyword using the element's own underlying color
    // channels with alpha forced to 0 (not a fixed rgba(0,0,0,0)) — assert
    // on the alpha channel only, regardless of which color it's tinted by.
    await expect(activeLabel).toHaveCSS("-webkit-text-fill-color", /rgba\(\d+, \d+, \d+, 0\)/);
  });
});
