import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
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

// Regression: scroll-lock.ts's .has-modal-open set overflow:hidden on <body> too, which clipped body's own box and clamped scrollY down on any tall, wheel-scrolled page (not marquee/GSAP-specific) — fixed by removing it from global.scss. 2+ scroll-section blocks here is just a content-agnostic proxy for "tall enough to wheel-scroll through".
function findMarqueeAfterScrollSectionsPageUrl(): string | null {
  const result = wpEval(`
    $posts = get_posts(['post_type' => 'any', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids']);
    foreach ($posts as $id) {
        $content = get_post_field('post_content', $id);
        $scrollSectionCount = preg_match_all('/<!-- wp:kotlinskidev\\/scroll-section(?!-item)\\b/', $content);
        $hasMarquee = strpos($content, '<!-- wp:kotlinskidev/marquee ') !== false || strpos($content, '<!-- wp:kotlinskidev/marquee\\n') !== false || strpos($content, '<!-- wp:kotlinskidev/marquee-->') !== false;
        if ($scrollSectionCount >= 2 && $hasMarquee) {
            echo get_permalink($id);
            exit;
        }
    }
    echo '';
  `);
  return result.length > 0 ? result : null;
}

test.describe("kotlinskidev/marquee modal — scroll position after opening", () => {
  let pageUrl: string | null;

  test.beforeAll(() => {
    pageUrl = findMarqueeAfterScrollSectionsPageUrl();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(
      pageUrl === null,
      "no published page currently has both 2+ scroll-section blocks and a marquee block"
    );
    if (!pageUrl) {
      return;
    }
    await page.goto(pageUrl);
    await acceptCookies(page);
    await page.waitForTimeout(500);
  });

  test("opening a marquee item's modal after scrolling through the pinned sections does not snap scrollY backward", async ({
    page,
  }) => {
    const marquee = page.locator(".kt-marquee").first();

    let currentScrollY = 0;
    for (let i = 0; i < 1500; i += 1) {
      const isMarqueeVisible = await marquee.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight;
      });
      if (isMarqueeVisible) {
        break;
      }
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(20);
      currentScrollY = await page.evaluate(() => window.scrollY);
    }
    expect(currentScrollY).toBeGreaterThan(0);

    await page.waitForTimeout(300);
    const scrollYBeforeClick = await page.evaluate(() => window.scrollY);

    // .first() can pick an item currently panned outside the track's clipped viewport, triggering Playwright's own pre-click document scroll — a false signal unrelated to the site's code. Pick a currently-visible item instead, and force-click as a second guard.
    const marqueeBox = (await marquee.boundingBox())!;
    const items = await marquee.locator(".kt-marquee__item:not([aria-hidden='true'])").all();
    let clickableItem = items[0];
    for (const candidate of items) {
      const box = await candidate.boundingBox();
      if (box && box.x >= marqueeBox.x && box.x + box.width <= marqueeBox.x + marqueeBox.width) {
        clickableItem = candidate;
        break;
      }
    }
    await clickableItem.click({ force: true });

    await expect(page.locator("#kt-modal-marquee")).toHaveClass(/is-open/);

    const scrollYRightAfterOpen = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(500);
    const scrollYAfterSettling = await page.evaluate(() => window.scrollY);

    // Strict threshold deliberate — was ~3200px off before the body overflow:hidden fix; don't loosen to paper over a regression.
    expect(Math.abs(scrollYRightAfterOpen - scrollYBeforeClick)).toBeLessThan(5);
    expect(Math.abs(scrollYAfterSettling - scrollYBeforeClick)).toBeLessThan(5);
  });
});
