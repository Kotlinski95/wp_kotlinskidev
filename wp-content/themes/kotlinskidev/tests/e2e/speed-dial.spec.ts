import { test, expect, type Locator, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";

const ROOT = ".kt-speed-dial";
const TOGGLE = ".kt-speed-dial__toggle";
const LIST = ".kt-speed-dial__list";
const ITEM_CONTROL = ".kt-speed-dial__item :is(a, button)";
const MIN_TARGET = 44;

async function expectMinimumTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(MIN_TARGET);
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TARGET);
}

async function rectsOverlap(first: Locator, second: Locator): Promise<boolean> {
  const a = await first.boundingBox();
  const b = await second.boundingBox();
  if (!a || !b) {
    return false;
  }
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function openDial(page: Page) {
  await page.locator(TOGGLE).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(TOGGLE)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(LIST)).toBeVisible();
}

test.describe("Speed Dial (kotlinskidev/speed-dial) — footer placement and behaviour", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("is rendered by the footer template part, outside .main-wrapper", async ({ page }) => {
    const dial = page.locator(ROOT);
    await expect(dial).toHaveCount(1);
    await expect(page.locator(`.main-wrapper ${ROOT}`)).toHaveCount(0);
    await expect(
      page.locator(`footer ${ROOT}, .wp-site-blocks > ${ROOT}, .kotlinskidev-footer ${ROOT}`)
    ).toHaveCount(1);
  });

  test("toggle is a collapsed, visible, named button wired to its list", async ({ page }) => {
    const toggle = page.locator(TOGGLE);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const controls = await toggle.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveAttribute("hidden", "");
    expect(((await toggle.getAttribute("aria-label")) ?? "").trim().length).toBeGreaterThan(0);
    await expectMinimumTarget(toggle);
  });

  test("toggle sits at the configured corner of the viewport", async ({ page }) => {
    const box = await page.locator(TOGGLE).boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;
    const horizontalEdge = Math.min(centerX, viewport.width - centerX);
    const verticalEdge = Math.min(centerY, viewport.height - centerY);
    expect(horizontalEdge).toBeLessThan(viewport.width / 4);
    expect(verticalEdge).toBeLessThan(viewport.height / 4);
  });

  test("keyboard: Tab reaches the toggle, Enter opens, ArrowUp focuses an item, Escape closes and refocuses the toggle", async ({
    page,
  }) => {
    const toggle = page.locator(TOGGLE);
    let reached = false;
    for (let i = 0; i < 80 && !reached; i += 1) {
      await page.keyboard.press("Tab");
      reached = await toggle.evaluate((el) => el === el.ownerDocument.activeElement);
    }
    expect(reached).toBe(true);

    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("ArrowUp");
    const focusedInsideList = await page
      .locator(LIST)
      .evaluate((list) => list.contains(list.ownerDocument.activeElement));
    expect(focusedInsideList).toBe(true);

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page.locator(LIST)).toBeHidden();
  });

  test("every open item target is at least 44x44 and phone/email links have the right scheme", async ({
    page,
  }) => {
    await openDial(page);
    const controls = page.locator(ITEM_CONTROL);
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expectMinimumTarget(controls.nth(i));
    }
    const hrefs = await page
      .locator(`${LIST} a[href]`)
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (/^(tel|mailto):/i.test(href)) {
        expect(href).toMatch(/^(tel:\+?[\d\s().-]+|mailto:[^\s@]+@[^\s@]+)/i);
      }
    }
  });

  test("an outside pointer press closes the open dial", async ({ page }) => {
    await openDial(page);
    await page.mouse.click(2, 2);
    await expect(page.locator(TOGGLE)).toHaveAttribute("aria-expanded", "false");
  });

  test("accessibility plugin item opens the plugin panel and closing returns focus to the toggle", async ({
    page,
  }) => {
    const trigger = page.locator('.kt-speed-dial__item [data-ka11y="open"]').first();
    test.skip((await trigger.count()) === 0, "No accessibility item is present in the speed dial");
    await openDial(page);
    await trigger.click();
    const panel = page.locator("#ka11y-panel");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.locator(TOGGLE)).toBeFocused();
  });
});

test.describe("Speed Dial — motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("opens and closes through the transition and ends in the correct state", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookies(page);
    const dial = page.locator(ROOT);
    const toggle = page.locator(TOGGLE);
    const list = page.locator(LIST);

    await toggle.click();
    await expect(dial).toHaveClass(/is-open/);
    await expect(dial).toHaveClass(/is-visible/);
    await expect(list).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(dial).not.toHaveClass(/is-visible/);
    await expect(list).toBeHidden();
    await expect(dial).not.toHaveClass(/is-open/);
  });
});

test.describe("Speed Dial — mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("does not overlap the mobile footer nav, scroll-to-top or the consent button", async ({
    page,
  }) => {
    const toggle = page.locator(TOGGLE);
    await expect(toggle).toBeVisible();
    for (const selector of [
      ".mobile-footer-nav",
      ".kt-scroll-to-top--fixed-arrow",
      ".cmplz-manage-consent",
    ]) {
      const other = page.locator(selector).first();
      if ((await other.count()) > 0 && (await other.isVisible())) {
        expect(await rectsOverlap(toggle, other), `${selector} overlaps the toggle`).toBe(false);
      }
    }
  });

  test("scrolling down lowers the dial together with the hidden mobile nav", async ({ page }) => {
    const dial = page.locator(ROOT);
    const before = await page.locator(TOGGLE).boundingBox();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.mouse.wheel(0, 400);
    await expect(dial).toHaveClass(/mobile-nav-hidden/);
    const after = await page.locator(TOGGLE).boundingBox();
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(after!.y).toBeGreaterThanOrEqual(before!.y);
  });
});
