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

// Regression: a page with several `scroll-section` blocks stacks several GSAP ScrollTriggers,
// each pinning the same `.main-wrapper`. This made such a page impossible to scroll through —
// scrollY would repeatedly snap back to an earlier point instead of progressing to the real
// bottom — and separately, the footer would overlap page content for long stretches mid-scroll.
//
// Root cause of the scroll reset: `scroll-trigger-refresh.ts`'s natural-height reconciliation loop
// mutates `.main-wrapper`'s own inline height every frame while following, which is safe with one
// pin but destabilizes GSAP's cross-trigger bookkeeping when several pins share the same target.
// Fixed by checking `getComputedStyle(...).position` directly and never mutating `.main-wrapper`
// while it's actually pin-fixed.
//
// Root cause of the overlap (a second, separate bug caught after the reset fix landed): while a
// pin is engaged, `.main-wrapper` freezes at one on-screen position for that trigger's entire
// range — only the track's own internal transform pans horizontally. The footer, an ordinary
// sibling in normal flow, keeps climbing up the screen the whole time scrollY increases,
// unaffected by the pin, so the worst moment for overlap within any one pin is scrollY ===
// trigger.end. Fixed by topping up `.pin-spacer`'s document-relative bottom to clear
// `trigger.end + .main-wrapper's own frozen on-screen bottom` for every pinned trigger, checked
// continuously — including a fix to restart the reconciliation loop on scroll while pin-fixed even
// when nothing else (scrollHeight, a watched element's box) changed, since entering a pin changes
// neither and the loop would otherwise sit stopped for the whole overlap window.
//
// This can't be reproduced with a small hand-authored fixture — confirmed by testing one: the
// destabilization only showed up on a page with real, substantial section content (matching the
// scale of an actual authored page), not a couple of short synthetic slides. So this searches
// live content for a page that actually has the shape the bug needs, per this project's
// content-agnostic testing convention, rather than hardcoding which page.
function findMultiScrollSectionPageUrl(): string | null {
  const result = wpEval(`
    $posts = get_posts(['post_type' => 'any', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids']);
    foreach ($posts as $id) {
        $content = get_post_field('post_content', $id);
        $count = preg_match_all('/<!-- wp:kotlinskidev\\/scroll-section(?!-item)\\b/', $content);
        if ($count >= 2) {
            echo get_permalink($id);
            exit;
        }
    }
    echo '';
  `);
  return result.length > 0 ? result : null;
}

test.describe("scroll-section block — a page with several sections pinning the same element", () => {
  let pageUrl: string | null;

  test.beforeAll(() => {
    pageUrl = findMultiScrollSectionPageUrl();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(pageUrl === null, "no published page currently has 2+ scroll-section blocks");
    if (!pageUrl) {
      return;
    }
    await page.goto(pageUrl);
    await acceptCookies(page);
    await page.waitForTimeout(500);
  });

  test("reaches the real bottom of the document without scroll position ever moving backward", async ({
    page,
  }) => {
    let maxScrollable = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    expect(maxScrollable).toBeGreaterThan(1000);

    let previousScrollY = -1;
    let minObservedDelta = Infinity;
    let currentScrollY = 0;
    // This project's usual convention (see testing.md) is to set scroll position with
    // window.scrollTo(), not mouse.wheel() — but confirmed live (real browser, not this harness)
    // that this specific regression only reproduces under real wheel-driven scrolling: GSAP's
    // ScrollTrigger apparently tracks incremental wheel-driven scroll differently than a
    // scrollTo() jump, and a scrollTo()-based version of this exact test passed even against the
    // known-broken code. Wheel is the deliberate, necessary choice here, not an oversight.
    //
    // A hard iteration cap, not just the target check, is what stands in for a timeout here — the
    // regression this test guards against is scrollY getting permanently stuck, which would
    // otherwise turn the loop's own exit condition into an infinite loop.
    for (let i = 0; i < 1000 && currentScrollY < maxScrollable - 5; i += 1) {
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(20);
      currentScrollY = await page.evaluate(() => window.scrollY);
      if (previousScrollY >= 0) {
        minObservedDelta = Math.min(minObservedDelta, currentScrollY - previousScrollY);
      }
      previousScrollY = currentScrollY;
      maxScrollable = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight
      );
    }

    // A real backward reset shows up as a large negative delta between consecutive steps — a
    // pinned trigger legitimately holding scroll briefly (clamping to its own start while
    // engaging) never moves scrollY *backward* by more than a few px of jitter.
    expect(minObservedDelta).toBeGreaterThan(-5);
    expect(currentScrollY).toBeGreaterThanOrEqual(maxScrollable - 5);
  });

  test("never lets the footer overlap .main-wrapper at any point while scrolling to the bottom, not just once fully scrolled", async ({
    page,
  }) => {
    // Checking only the final, fully-scrolled state previously missed this: the footer overlapped
    // for a long stretch in the *middle* of the scroll (while inside a pin's engaged range) and
    // only stopped once the last pin released near the very end — a real, visible bug that a
    // bottom-only check can't catch.
    let maxScrollable = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    let currentScrollY = 0;
    let maxOverlap = -Infinity;
    for (let i = 0; i < 1000 && currentScrollY < maxScrollable - 5; i += 1) {
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(20);
      currentScrollY = await page.evaluate(() => window.scrollY);
      maxScrollable = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight
      );
      const overlap = await page.evaluate(() => {
        const mainWrapperBottom =
          document.querySelector(".main-wrapper")?.getBoundingClientRect().bottom ?? 0;
        const footerTop = document.querySelector("footer")?.getBoundingClientRect().top ?? 0;
        return mainWrapperBottom - footerTop;
      });
      maxOverlap = Math.max(maxOverlap, overlap);
    }

    expect(maxOverlap).toBeLessThan(5);
  });
});
