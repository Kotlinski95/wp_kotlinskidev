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
