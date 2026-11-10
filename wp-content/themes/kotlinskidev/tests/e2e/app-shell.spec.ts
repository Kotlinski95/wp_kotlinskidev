import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test.describe("Mobile app shell", () => {
  test.use({ viewport: { width: 428, height: 746 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await page.waitForTimeout(500);
  });

  test("the root never scrolls, the container does, and the nav stays on the viewport bottom", async ({
    page,
  }) => {
    const initial = await page.evaluate(() => ({
      shell: document.body.classList.contains("kt-app-shell"),
      rootScrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      navBottom: document.querySelector("#mobile-footer-menu")?.getBoundingClientRect().bottom,
    }));
    expect(initial.shell).toBe(true);
    expect(initial.rootScrollHeight).toBeLessThanOrEqual(initial.innerHeight);
    expect(initial.navBottom).toBe(initial.innerHeight);

    await page.evaluate(() =>
      document.querySelector(".wp-site-blocks")?.scrollTo({ top: 1200, behavior: "instant" })
    );
    await page.waitForTimeout(500);

    const scrolled = await page.evaluate(() => ({
      containerTop: document.querySelector(".wp-site-blocks")?.scrollTop ?? 0,
      windowY: window.scrollY,
      rootScrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(scrolled.containerTop).toBeGreaterThan(300);
    expect(scrolled.windowY).toBe(0);
    expect(scrolled.rootScrollHeight).toBeLessThanOrEqual(scrolled.innerHeight);
  });

  test("keeps the container scroll position across a breakpoint change", async ({ page }) => {
    await page.evaluate(() =>
      document.querySelector(".wp-site-blocks")?.scrollTo({ top: 600, behavior: "instant" })
    );
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    const desktopY = await page.evaluate(() => window.scrollY);
    expect(desktopY).toBeGreaterThan(300);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.querySelector(".wp-site-blocks") as Element).overflowY
      )
    ).toBe("visible");
  });
});

test.describe("Desktop layout is unchanged by the app shell", () => {
  test("the window scrolls and .wp-site-blocks does not", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => ({
      y: window.scrollY,
      overflowY: getComputedStyle(document.querySelector(".wp-site-blocks") as Element).overflowY,
    }));
    expect(state.y).toBeGreaterThan(300);
    expect(state.overflowY).toBe("visible");
  });
});
