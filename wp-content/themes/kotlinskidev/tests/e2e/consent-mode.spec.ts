import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    dataLayer?: unknown[][];
  }
}

type ConsentSignals = {
  ad_storage: string;
  ad_user_data: string;
  ad_personalization: string;
  analytics_storage: string;
};

const ALL_DENIED: ConsentSignals = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

const ALL_GRANTED: ConsentSignals = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

function lastConsentUpdate(page: Page) {
  return page.evaluate(() => {
    const dataLayer = window.dataLayer ?? [];
    const entry = [...dataLayer]
      .reverse()
      .find((item) => item[0] === "consent" && item[1] === "update");
    return entry?.[2] as ConsentSignals | undefined;
  });
}

// This suite deliberately does not call the shared acceptCookies() beforeEach hook —
// each test drives the Complianz consent banner itself to assert the resulting gtag state.
test.describe("GA4 Consent Mode v2 (functions/tracking-scripts.php)", () => {
  test("loads gtag.js unconditionally with every consent signal denied by default", async ({
    page,
  }) => {
    await page.goto("/en/home/");

    const state = await page.evaluate(() => {
      const dataLayer = window.dataLayer ?? [];
      const defaultEntry = dataLayer.find((item) => item[0] === "consent" && item[1] === "default");
      const configEntry = dataLayer.find((item) => item[0] === "config");
      return {
        gtagType: typeof window.gtag,
        defaultConsent: defaultEntry?.[2],
        measurementId: configEntry?.[1],
      };
    });

    expect(state.gtagType).toBe("function");
    expect(state.defaultConsent).toEqual(ALL_DENIED);
    expect(state.measurementId).toMatch(/^G-[A-Z0-9]+$/);
  });

  test("grants every consent signal live when the visitor accepts all, with no reload", async ({
    page,
  }) => {
    await page.goto("/en/home/");

    await page.locator(".cmplz-btn.cmplz-accept").click();

    await expect.poll(() => lastConsentUpdate(page)).toEqual(ALL_GRANTED);
  });

  test("keeps every consent signal denied when the visitor denies all", async ({ page }) => {
    await page.goto("/en/home/");

    await page.locator(".cmplz-btn.cmplz-deny").click();

    await expect.poll(() => lastConsentUpdate(page)).toEqual(ALL_DENIED);
  });

  test("grants only analytics_storage when just the statistics category is accepted, leaving marketing denied", async ({
    page,
  }) => {
    await page.goto("/en/home/");

    await page.locator(".cmplz-btn.cmplz-view-preferences").click();
    await page.locator(".cmplz-consent-checkbox.cmplz-statistics").check();
    await page.locator(".cmplz-btn.cmplz-save-preferences").click();

    await expect
      .poll(() => lastConsentUpdate(page))
      .toEqual({
        ...ALL_DENIED,
        analytics_storage: "granted",
      });
  });

  test("grants only ad signals when just the marketing category is accepted, leaving analytics_storage denied", async ({
    page,
  }) => {
    await page.goto("/en/home/");

    await page.locator(".cmplz-btn.cmplz-view-preferences").click();
    await page.locator(".cmplz-consent-checkbox.cmplz-marketing").check();
    await page.locator(".cmplz-btn.cmplz-save-preferences").click();

    await expect
      .poll(() => lastConsentUpdate(page))
      .toEqual({
        ...ALL_GRANTED,
        analytics_storage: "denied",
      });
  });
});
