import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePost, deleteFixturePostsByType } from "./wp-cli";
import { execFileSync } from "node:child_process";
import path from "node:path";

const WP_ROOT = path.resolve(process.cwd(), "..", "..", "..");

function wpEval(script: string): string {
  return execFileSync("wp", ["eval", script], {
    cwd: WP_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

test.describe("Service Location city page (single-service_location.html) — bound content, real rendering", () => {
  const slug = "e2e-fixture-service-location";
  const cityName = "E2E Fixture City";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePost("service_location", slug, "E2E Fixture City Page", {
      city: cityName,
    }).url;
  });

  test.afterAll(() => {
    deleteFixturePostsByType("service_location", slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("resolves the city post-meta binding into real page text, not the raw placeholder", async ({
    page,
  }) => {
    const bodyText = await page.locator("main").innerText();

    expect(bodyText).toContain(cityName);
    expect(bodyText).not.toContain('{"source":"core/post-meta"');
  });

  test("applies the gradient-text treatment to exactly the three contrast-safe city headings", async ({
    page,
  }) => {
    const gradientCityElements = page.locator(`.kt-gradient-text:text("${cityName}")`);

    await expect(gradientCityElements).toHaveCount(3);
  });

  test("leaves the pill badge and the primary-background CTA heading without gradient-text", async ({
    page,
  }) => {
    const pillBadge = page.locator(`p.has-primary-background-color:text("${cityName}")`);
    const ctaHeading = page.locator(`h2.has-background-color:text("${cityName}")`);

    await expect(pillBadge).not.toHaveClass(/kt-gradient-text/);
    await expect(ctaHeading).not.toHaveClass(/kt-gradient-text/);
  });

  test("renders the city map for the fixture's own city", async ({ page }) => {
    const mapFrame = page.locator('iframe[src*="google.com/maps"]');
    const src = await mapFrame.getAttribute("src");

    expect(src).toContain(encodeURIComponent(cityName));
  });

  test("keeps the FAQ's sticky-left column visible deep into its row once the accordions on the right are opened", async ({
    page,
  }) => {
    // Regression: gsap-sticky.ts (which portals `.is-kotlinskidev-sticky` out of the transformed
    // .main-wrapper so native position:sticky works) decided visibility from its layout
    // placeholder's own rect, which only ever matches the short natural height of the sticky
    // column's own content (a heading + CTA). `.wp-block-columns` stretches every column to the
    // tallest sibling's height by default, so once the accordion column on the right grows much
    // taller, the real row stayed tall while the placeholder stayed short — hiding the sticky
    // column while the row (and its still-visible sibling column) was still on screen.
    const stickyColumn = page.locator(".is-kotlinskidev-sticky");
    // gsap-sticky.ts portals the whole `.is-kotlinskidev-sticky` column out of `.wp-block-columns`
    // and into a body-level host, leaving only an unstyled placeholder behind — so the row can no
    // longer be found via its (now-moved) sticky child, only via its other, still-in-place child.
    const row = page.locator(".wp-block-columns:has(.kt-faq-single-column)");
    const placeholder = row.locator("> div[style*='visibility: hidden']");
    const summaries = page.locator(".kt-faq-single-column .wp-block-details summary");

    const summaryCount = await summaries.count();
    for (let i = 0; i < summaryCount; i += 1) {
      await summaries.nth(i).click();
    }

    const rowBox = await row.boundingBox();
    const placeholderBox = await placeholder.boundingBox();
    if (!rowBox || !placeholderBox) {
      throw new Error("FAQ row or its layout placeholder did not render a bounding box");
    }
    // boundingBox() is viewport-relative, not page-absolute — anchor both to the current scroll
    // position so the scroll target below lands on the real page coordinate, not a mismatched one.
    const scrollYBeforeMeasuring = await page.evaluate(() => window.scrollY);
    const rowAbsoluteTop = rowBox.y + scrollYBeforeMeasuring;
    const placeholderAbsoluteBottom = rowAbsoluteTop + placeholderBox.height;
    const rowAbsoluteBottom = rowAbsoluteTop + rowBox.height;
    expect(rowAbsoluteBottom - placeholderAbsoluteBottom).toBeGreaterThan(100);

    // Scroll so the viewport's own top edge sits between the placeholder's bottom and the row's
    // real bottom: the placeholder (and its short natural height) is then fully scrolled past —
    // invisible were visibility still keyed off it — while the row (and its still-visible sibling
    // accordion column) has real content further down that hasn't scrolled out of view yet.
    const scrollTarget = (placeholderAbsoluteBottom + rowAbsoluteBottom) / 2;
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);

    await expect(stickyColumn).toBeVisible();
  });
});

test.describe("Service Location city page — Polylang language routing", () => {
  test("a published PL city page and its published EN translation render in their own language", async ({
    page,
  }) => {
    const pairJson = wpEval(`
      $pl_ids = get_posts(['post_type' => 'service_location', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids']);
      foreach ($pl_ids as $id) {
          if ('pl' !== pll_get_post_language($id)) continue;
          $translations = pll_get_post_translations($id);
          if (empty($translations['en']) || 'publish' !== get_post_status($translations['en'])) continue;
          echo wp_json_encode(['pl' => get_permalink($id), 'en' => get_permalink($translations['en'])]);
          exit;
      }
      echo 'null';
    `);
    const pair: { pl: string; en: string } | null = JSON.parse(pairJson);

    test.skip(
      pair === null,
      "no published service_location page currently has a published EN translation"
    );
    if (!pair) {
      return;
    }

    await page.goto(pair.pl);
    await acceptCookies(page);
    await expect(page.getByRole("button", { name: "Zamów bezpłatną wycenę" })).toBeVisible();

    await page.goto(pair.en);
    await acceptCookies(page);
    await expect(page.getByRole("button", { name: "Get a free quote" })).toBeVisible();
  });
});
