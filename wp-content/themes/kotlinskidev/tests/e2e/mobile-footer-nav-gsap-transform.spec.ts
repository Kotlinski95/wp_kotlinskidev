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

// Regression: gsap-footer-transform-sync.ts mirrors .main-wrapper's GSAP pin-compensation
// transform onto <footer> so footer content stays visually in sync with a pinned scroll-section.
// But .mobile-footer-nav (position: fixed) used to live *inside* that same <footer> element — any
// non-"none" transform on an ancestor (even the identity translate(0px, 0px) GSAP applies while
// unpinned) creates a new containing block for position:fixed descendants per the CSS spec, so the
// nav stopped being positioned relative to the viewport and instead rendered relative to <footer>'s
// own (very tall, GSAP-inflated) box — only scrolling into view at the very bottom of the page.
// Fixed by syncing the transform onto .kotlinskidev-footer (the footer's inner content wrapper)
// instead, and moving the mobile-footer navigation block to be a sibling of that wrapper rather
// than a descendant of it.
function findScrollSectionPageUrl(): string | null {
  const result = wpEval(`
    $posts = get_posts(['post_type' => 'any', 'post_status' => 'publish', 'numberposts' => -1, 'fields' => 'ids']);
    foreach ($posts as $id) {
        $content = get_post_field('post_content', $id);
        if (preg_match('/<!-- wp:kotlinskidev\\/scroll-section(?!-item)\\b/', $content)) {
            echo get_permalink($id);
            exit;
        }
    }
    echo '';
  `);
  return result.length > 0 ? result : null;
}

test.describe("Mobile footer nav stays fixed to the viewport on a page with a GSAP-pinned scroll-section", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  let pageUrl: string | null;

  test.beforeAll(() => {
    pageUrl = findScrollSectionPageUrl();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(pageUrl === null, "no published page currently has a scroll-section block");
    if (!pageUrl) {
      return;
    }
    await page.goto(pageUrl);
    await acceptCookies(page);
    await page.waitForTimeout(500);
  });

  test("renders inside the viewport at the very top of the page, not scrolled off into document flow", async ({
    page,
  }) => {
    const nav = page.locator(".mobile-footer-nav");
    await expect(nav).toBeVisible();

    const box = await nav.boundingBox();
    const viewportHeight = page.viewportSize()!.height;

    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight + 5);
  });

  test("spans the full viewport width, not shrunk to fit-content", async ({ page }) => {
    const nav = page.locator(".mobile-footer-nav");
    await expect(nav).toBeVisible();

    const box = await nav.boundingBox();
    const viewportWidth = page.viewportSize()!.width;

    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(viewportWidth * 0.9);
  });

  test("is the actual topmost element at its own center point, not obscured by pinned page content", async ({
    page,
  }) => {
    const nav = page.locator(".mobile-footer-nav");
    await expect(nav).toBeVisible();

    const isOnTop = await nav.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return !!hit && el.contains(hit);
    });

    expect(isOnTop).toBe(true);
  });

  test("no ancestor of the mobile footer nav has a transform, keeping it viewport-relative", async ({
    page,
  }) => {
    const nav = page.locator(".mobile-footer-nav");
    await expect(nav).toBeVisible();

    const transformedAncestorTags = await nav.evaluate((el) => {
      const tags: string[] = [];
      let current = el.parentElement;
      while (current) {
        if (getComputedStyle(current).transform !== "none") {
          tags.push(current.tagName);
        }
        current = current.parentElement;
      }
      return tags;
    });

    expect(transformedAncestorTags).toEqual([]);
  });
});
