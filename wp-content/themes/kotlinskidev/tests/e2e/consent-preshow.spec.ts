import { test, expect } from "@playwright/test";

const BANNER = "#cmplz-cookiebanner-container .cmplz-cookiebanner";

test.describe("Consent banner pre-show (src/critical/consent-preshow.ts)", () => {
  test("shows the banner with its backdrop before the Complianz script runs", async ({ page }) => {
    await page.route("**/complianz-gdpr/**", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveClass(/kt-cmplz-pending/);
    await expect(page.locator(BANNER)).toBeVisible();
    const backdrop = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement, "::after");
      return { position: style.position, background: style.backgroundColor };
    });
    expect(backdrop.position).toBe("fixed");
    expect(backdrop.background).toBe("rgba(0, 0, 0, 0.7)");
  });

  test("keeps the analytics tag blocked until consent", async ({ page }) => {
    await page.goto("/");
    const blocked = await page
      .locator('script[type="text/plain"][data-cmplz-src*="googletagmanager"]')
      .count();
    expect(blocked).toBeGreaterThan(0);
    expect(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count()).toBe(0);
  });

  test("accept works right after the script loads and releases the pre-show state", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.locator(".cmplz-btn.cmplz-accept").click();

    await expect(page.locator(BANNER)).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/kt-cmplz-pending/);
    const cookies = await page.context().cookies();
    expect(cookies.some((cookie) => cookie.name === "cmplz_banner-status")).toBe(true);
  });

  test("deny works right after the script loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.locator(".cmplz-btn.cmplz-deny").click();

    await expect(page.locator(BANNER)).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/kt-cmplz-pending/);
  });

  test("does not show the pre-show state for a visitor who already answered", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "cmplz_banner-status",
        value: "dismissed",
        url: new URL("/", page.url() === "about:blank" ? "http://kotlinskidev.local" : page.url())
          .href,
      },
    ]);
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveClass(/kt-cmplz-pending/);
    await expect(page.locator(BANNER)).toBeHidden();
  });

  test("pauses hero autoplay while the dialog is open", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const active = page.locator(".hero-carousel .swiper-slide-active").first();
    if ((await active.count()) === 0) {
      test.skip(true, "no hero carousel on the homepage");
    }
    const before = await active.getAttribute("data-swiper-slide-index");
    await page.waitForTimeout(7000);
    const after = await page
      .locator(".hero-carousel .swiper-slide-active")
      .first()
      .getAttribute("data-swiper-slide-index");
    expect(after).toBe(before);
  });
});

test.describe("Critical bundle layout stability", () => {
  test("causes no layout shift on a throttled mobile load", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 823 },
      isMobile: true,
      hasTouch: true,
      locale: "pl-PL",
      extraHTTPHeaders: { "Accept-Language": "pl-PL" },
    });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      const holder = window as unknown as { __cls: number };
      holder.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number;
          hadRecentInput: boolean;
        }>) {
          if (!entry.hadRecentInput) {
            holder.__cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/o-mnie/", { waitUntil: "load" });
    await page.waitForTimeout(4000);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    await context.close();
    expect(cls).toBeLessThanOrEqual(0.01);
  });
});
