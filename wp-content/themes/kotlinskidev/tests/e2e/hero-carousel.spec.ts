import { test, expect, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

function buildSlide(imageName: string): string {
  const url = `/wp-content/themes/kotlinskidev/assets/images/${imageName}.webp`;
  return `<!-- wp:kotlinskidev/hero-carousel-slide {"bgImageUrl":"${url}"} /-->`;
}

function buildHeroCarouselContent(attrs: Record<string, unknown>): string {
  const attrsJson = JSON.stringify(attrs);
  const slides = ["team", "about", "testimonial"].map(buildSlide).join("\n");
  return (
    `<div style="height:1400px">Spacer</div>` +
    `<!-- wp:kotlinskidev/hero-carousel ${attrsJson} -->\n${slides}\n<!-- /wp:kotlinskidev/hero-carousel -->`
  );
}

async function getActiveSlideIndex(page: Page): Promise<string | null> {
  return page
    .locator(".hero-carousel .swiper-slide-active")
    .first()
    .getAttribute("data-swiper-slide-index");
}

test.describe("Hero carousel (kotlinskidev/hero-carousel) — autoplay pause on drag", () => {
  const slug = "e2e-fixture-hero-carousel-autoplay";
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Hero Carousel Autoplay",
      buildHeroCarouselContent({
        minHeight: 10,
        autoplay: true,
        autoplayDelay: 1000,
        loop: true,
        draggable: true,
        showArrows: false,
        showPagination: false,
        lazyLoad: true,
      })
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("dragging by hand and releasing the mouse while still over the carousel keeps autoplay paused", async ({
    page,
  }) => {
    const carousel = page.locator(".hero-carousel");
    await carousel.scrollIntoViewIfNeeded();
    await expect(page.locator(".hero-carousel__swiper")).toHaveClass(/swiper-initialized/);
    const box = await carousel.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(center.x - 60, center.y, { steps: 10 });
    await page.mouse.move(center.x - 120, center.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const indexAfterRelease = await getActiveSlideIndex(page);

    await page.waitForTimeout(1800);
    const indexAfterHold = await getActiveSlideIndex(page);

    expect(indexAfterHold).toBe(indexAfterRelease);
  });

  test("dragging by hand and releasing the mouse outside the carousel resumes autoplay", async ({
    page,
  }) => {
    const carousel = page.locator(".hero-carousel");
    await carousel.scrollIntoViewIfNeeded();
    await expect(page.locator(".hero-carousel__swiper")).toHaveClass(/swiper-initialized/);
    const box = await carousel.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(10, center.y, { steps: 10 });
    await page.mouse.move(10, 10, { steps: 10 });
    await page.mouse.up();
    const indexAfterRelease = await getActiveSlideIndex(page);

    await expect
      .poll(async () => getActiveSlideIndex(page), { timeout: 3000 })
      .not.toBe(indexAfterRelease);
  });
});
