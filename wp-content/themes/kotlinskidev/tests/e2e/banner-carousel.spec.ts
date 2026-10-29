import { test, expect } from "@playwright/test";
import type { CarouselSettings } from "../../src/utils/carousel/types";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

interface FixtureImage {
  url: string;
  alt: string;
}

const FIXTURE_IMAGES: FixtureImage[] = ["team", "about", "testimonial"].map((name) => ({
  url: `/wp-content/themes/kotlinskidev/assets/images/${name}.webp`,
  alt: name,
}));

function buildCarouselContent(images: FixtureImage[], settings: CarouselSettings): string {
  const settingsJson = JSON.stringify(settings).replace(/"/g, "&quot;");
  const slides = images
    .map(
      (img, i) =>
        `<div class="swiper-slide"><img src="${img.url}" alt="${img.alt}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" style="width:100%"/></div>`
    )
    .join("");

  const showCustomNav =
    settings.showArrows &&
    (settings.arrowsPosition !== "sides" || settings.navPlacement === "outside");

  const customNav = showCustomNav
    ? `<div class="carousel-nav carousel-nav--${settings.navPlacement === "outside" ? "outside " : ""}carousel-nav--${settings.arrowsPosition}"><div class="swiper-button-prev"></div><span class="carousel-nav__counter"></span><div class="swiper-button-next"></div></div>`
    : "";
  const inlineNav =
    settings.showArrows && !showCustomNav
      ? `<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>`
      : "";

  const blockAttrs = JSON.stringify({ images, ...settings });
  const insideNav = showCustomNav && settings.navPlacement === "inside" ? customNav : "";
  const outsideNav = showCustomNav && settings.navPlacement === "outside" ? customNav : "";

  return `<!-- wp:kotlinskidev/banner-carousel ${blockAttrs} -->
<div class="wp-block-kotlinskidev-banner-carousel banner-carousel"><div class="swiper" data-carousel-settings="${settingsJson}"><div class="swiper-wrapper">${slides}</div>${insideNav}${inlineNav}<div class="swiper-pagination"></div><div class="swiper-scrollbar"></div></div>${outsideNav}</div>
<!-- /wp:kotlinskidev/banner-carousel -->`;
}

const DEFAULT_SETTINGS: CarouselSettings = {
  showArrows: true,
  showPagination: true,
  showScrollbar: false,
  loop: false,
  autoplay: false,
  autoplayDelay: 3000,
  lazyLoad: false,
  arrowsPosition: "sides",
  navColor: "",
  navColorOnHover: false,
  navPlacement: "inside",
  trackActiveSlide: false,
  slidesPerView: 1,
  slidesPerMobile: 1,
  slidesPerTablet: 1,
  slidesPerDesktop: 1,
};

test.describe("Banner carousel (kotlinskidev/banner-carousel)", () => {
  test.describe("default settings (inline side arrows, pagination)", () => {
    const slug = "e2e-fixture-banner-carousel-default";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const fixture = createFixturePage(
        slug,
        "E2E Fixture — Banner Carousel Default",
        buildCarouselContent(FIXTURE_IMAGES, DEFAULT_SETTINGS)
      );
      fixtureUrl = fixture.url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);
    });

    test("initializes with all slides present and the first slide active", async ({ page }) => {
      const swiper = page.locator(".swiper");
      await expect(swiper).toHaveClass(/swiper-initialized/);
      await expect(page.locator(".swiper-slide")).toHaveCount(FIXTURE_IMAGES.length);
      await expect(page.locator(".swiper-slide").first()).toHaveClass(/swiper-slide-active/);
    });

    test("the previous button is disabled at the first slide (loop off)", async ({ page }) => {
      await expect(page.locator(".swiper-button-prev")).toHaveClass(/swiper-button-disabled/);
    });

    test("the next button is disabled at the last slide (loop off)", async ({ page }) => {
      for (let i = 0; i < FIXTURE_IMAGES.length - 1; i++) {
        await page.locator(".swiper-button-next").click();
      }
      await expect(page.locator(".swiper-button-next")).toHaveClass(/swiper-button-disabled/);
    });

    test("clicking the next button advances to the next slide", async ({ page }) => {
      await page.locator(".swiper-button-next").click();

      await expect(page.locator(".swiper-slide").nth(1)).toHaveClass(/swiper-slide-active/);
      await expect(page.locator(".swiper-button-prev")).not.toHaveClass(/swiper-button-disabled/);
    });

    test("clicking a pagination bullet jumps to that slide", async ({ page }) => {
      await page.locator(".swiper-pagination-bullet").nth(2).click();

      await expect(page.locator(".swiper-slide").nth(2)).toHaveClass(/swiper-slide-active/);
      await expect(page.locator(".swiper-pagination-bullet").nth(2)).toHaveClass(
        /swiper-pagination-bullet-active/
      );
    });

    test("arrow keys navigate slides when the carousel is focused", async ({ page }) => {
      await page.locator(".swiper").click();
      await page.locator(".swiper-button-next").click();

      await page.keyboard.press("ArrowLeft");

      await expect(page.locator(".swiper-slide").first()).toHaveClass(/swiper-slide-active/);
    });
  });

  test.describe("custom outside navigation with slide counter", () => {
    const slug = "e2e-fixture-banner-carousel-custom-nav";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const fixture = createFixturePage(
        slug,
        "E2E Fixture — Banner Carousel Custom Nav",
        buildCarouselContent(FIXTURE_IMAGES, {
          ...DEFAULT_SETTINGS,
          arrowsPosition: "bottom-center",
          navPlacement: "outside",
        })
      );
      fixtureUrl = fixture.url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);
    });

    test("shows a slide counter that updates as the carousel navigates", async ({ page }) => {
      const counter = page.locator(".carousel-nav__counter");
      const paddedTotal = String(FIXTURE_IMAGES.length).padStart(2, "0");

      await expect(counter).toHaveText(`01 / ${paddedTotal}`);

      await page.locator(".carousel-nav .swiper-button-next").click();

      await expect(counter).toHaveText(`02 / ${paddedTotal}`);
    });
  });
});
