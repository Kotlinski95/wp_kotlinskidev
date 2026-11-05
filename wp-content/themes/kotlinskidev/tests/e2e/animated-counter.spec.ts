import { test, expect, type Locator } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const FIXTURE_SLUG = "e2e-fixture-animated-counter";
const FIXTURE_NUMBER = 137;
const FIXTURE_DURATION_MS = 1500;
const FIXTURE_CONTENT = `<!-- wp:heading {"enableCounter":true,"counterDuration":"${FIXTURE_DURATION_MS}","counterEasing":"linear"} -->
<h2 class="wp-block-heading animated-counter" data-counter-duration="${FIXTURE_DURATION_MS}" data-counter-easing="linear">${FIXTURE_NUMBER}%</h2>
<!-- /wp:heading -->`;

let fixtureUrl: string;

test.describe("Animated counter (kotlinskidev/animated-counter block extension)", () => {
  test.beforeAll(() => {
    const fixture = createFixturePage(
      FIXTURE_SLUG,
      "E2E Fixture — Animated Counter",
      FIXTURE_CONTENT
    );
    fixtureUrl = fixture.url;
  });

  test.afterAll(() => {
    deleteFixturePage(FIXTURE_SLUG);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("shows the final value immediately when reduced motion is preferred (default)", async ({
    page,
  }) => {
    const counter = page.locator(".animated-counter");
    await expect(counter).toBeVisible();

    await expect(counter).toHaveAttribute("data-counter-animated", "true");
    await expect(counter).toHaveText(`${FIXTURE_NUMBER}%`);
  });

  test.describe("with motion allowed", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("counts up progressively before settling on the final value", async ({ page }) => {
      async function readDisplayedNumber(counter: Locator): Promise<number | null> {
        const text = (await counter.textContent()) ?? "";
        const match = text.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      }

      const counter = page.locator(".animated-counter");
      await expect(counter).toBeVisible();

      await expect
        .poll(() => readDisplayedNumber(counter), { timeout: FIXTURE_DURATION_MS - 200 })
        .toBeLessThan(FIXTURE_NUMBER);

      await expect(counter).toHaveAttribute("data-counter-animated", "true", { timeout: 5000 });
      await expect(counter).toHaveText(`${FIXTURE_NUMBER}%`);
    });
  });

  test("preserves the non-numeric suffix text after animating", async ({ page }) => {
    const counter = page.locator(".animated-counter");
    await expect(counter).toHaveAttribute("data-counter-animated", "true");
    await expect(counter).toContainText("%");
  });
});
