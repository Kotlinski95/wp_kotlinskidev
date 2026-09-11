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

// Regression: opening any kt-modal (not GSAP/marquee-specific — confirmed by reproducing with
// a bare `document.body.style.overflow = "hidden"` toggle, no modal or GSAP involved at all)
// clamped scrollY down once enough real content had been scrolled through, because
// scroll-lock.ts's .has-modal-open class set `overflow: hidden` on <body> in addition to
// <html>. <html> alone (the actual root scrolling element) already blocks scrolling correctly
// and is harmless; <body>'s overflow: hidden was redundant *and* the actual cause — it clips
// body's own rendered box, shrinking what <html> considers its scrollable height, which forces
// scrollY down to fit. Removing body's overflow: hidden from global.scss (keeping only
// touch-action: none there) fixes it directly. Only reproduces after reaching the marquee via
// real, continuous wheel scrolling through the page's pinned scroll-section blocks first — a
// scrollTo()-based jump straight to the marquee's position never left enough real scrollHeight
// for the clamp to have room to matter, exactly like scroll-section-multi-pin.spec's own
// documented "must be real wheel scroll" finding for a different bug in the same page shape.
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

    // .first() alone can pick a marquee item that's currently panned outside the track's own
    // clipped viewport (the marquee scrolls continuously) — Playwright's own pre-click
    // actionability check then scrolls the *document* to bring it fully into view before
    // clicking, a Playwright-side scroll unrelated to anything the site's own code does, which
    // would masquerade as a real regression here. Pick whichever item is currently horizontally
    // visible inside the track instead, matching what a real user could actually click, and
    // force the click to skip Playwright's own pre-click scroll as a second guard against the
    // same false signal.
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

    // Known open residual (tracked, not silently loosened away): a real repro here still shows
    // scrollY landing ~38px off (was ~3200px before scroll-lock.ts stopped setting `overflow:
    // hidden` on <body>, the fix that resolved this test's original failure — see global.scss).
    // Traced live to scroll-trigger-refresh.ts's own natural-height reconciliation loop
    // (confirmed via MutationObserver: .main-wrapper/.pin-spacer inline height mutating at the
    // exact ms scrollY moves) rewriting .main-wrapper's locked height ~76ms after the click,
    // most likely legitimate content-driven scroll anchoring rather than a real visible jump —
    // but not yet proven either way, so the threshold stays strict rather than papering over it.
    expect(Math.abs(scrollYRightAfterOpen - scrollYBeforeClick)).toBeLessThan(5);
    expect(Math.abs(scrollYAfterSettling - scrollYBeforeClick)).toBeLessThan(5);
  });
});
