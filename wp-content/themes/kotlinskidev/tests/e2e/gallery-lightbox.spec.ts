import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

interface FixtureMedia {
  url: string;
  alt: string;
  type: "image" | "video";
  width: number;
  height: number;
  poster?: string;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function buildGalleryContent(
  images: FixtureMedia[],
  options: { trackActiveSlide?: boolean; mobileImages?: FixtureMedia[] } = {}
): string {
  const { trackActiveSlide = false, mobileImages } = options;
  const settings = { showArrows: true, showPagination: true, loop: true, trackActiveSlide };

  const toDataMedia = (items: FixtureMedia[]) =>
    JSON.stringify(
      items.map((m) => ({
        src: m.url,
        alt: m.alt,
        type: m.type,
        poster: m.poster ?? "",
        width: m.width,
        height: m.height,
      }))
    );

  const dataImages = escapeAttr(toDataMedia(images));
  const dataMobileImages = mobileImages ? escapeAttr(toDataMedia(mobileImages)) : null;
  const dataSettings = escapeAttr(JSON.stringify(settings));

  const [first, ...rest] = images;
  const totalLabel = String(images.length).padStart(2, "0");
  let countBadge = "";
  if (images.length > 1) {
    countBadge = trackActiveSlide
      ? `<span class="gallery-lightbox-count" aria-hidden="true"><span class="gallery-lightbox-count__current">01</span> / ${totalLabel}</span>`
      : `<span class="gallery-lightbox-count" aria-hidden="true">+${rest.length}</span>`;
  }
  const videoBadge =
    first.type === "video"
      ? '<span class="gallery-lightbox-video-badge" aria-hidden="true">&#9654;</span>'
      : "";
  let ariaLabelSuffix = "";
  if (images.length > 1) {
    ariaLabelSuffix = trackActiveSlide ? ` 01 / ${totalLabel}` : ` +${rest.length}`;
  }

  const blockAttrs = JSON.stringify({
    images,
    ...(mobileImages ? { useMobileMedia: true, mobileImages } : {}),
    ...settings,
  });

  return `<!-- wp:kotlinskidev/gallery-lightbox ${blockAttrs} -->
<div class="wp-block-kotlinskidev-gallery-lightbox" data-gallery-lightbox="" data-images="${dataImages}"${dataMobileImages ? ` data-mobile-images="${dataMobileImages}"` : ""} data-settings="${dataSettings}">
<button class="gallery-lightbox-trigger" type="button" aria-label="${escapeAttr((first.alt || "Open gallery") + ariaLabelSuffix)}">
<img src="${first.type === "video" ? first.poster || first.url : first.url}" alt="${escapeAttr(first.alt)}" width="${first.width}" height="${first.height}" loading="eager" decoding="async"/>
${videoBadge}
${countBadge}
</button>
</div>
<!-- /wp:kotlinskidev/gallery-lightbox -->`;
}

const IMAGES: FixtureMedia[] = ["team", "about", "testimonial"].map((name) => ({
  url: `/wp-content/themes/kotlinskidev/assets/images/${name}.webp`,
  alt: name,
  type: "image",
  width: 800,
  height: 600,
}));

test.describe("Gallery lightbox (kotlinskidev/gallery-lightbox)", () => {
  test.describe("default gallery", () => {
    const slug = "e2e-fixture-gallery-default";
    let fixtureUrl: string;

    test.beforeAll(() => {
      fixtureUrl = createFixturePage(
        slug,
        "E2E Fixture — Gallery Default",
        buildGalleryContent(IMAGES)
      ).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);
    });

    test("the trigger shows the first image with a count badge", async ({ page }) => {
      const trigger = page.locator(".gallery-lightbox-trigger");
      await expect(trigger).toBeVisible();
      await expect(trigger.locator(".gallery-lightbox-count")).toHaveText(`+${IMAGES.length - 1}`);
    });

    test("clicking the trigger opens a modal dialog with all slides and focuses its close button", async ({
      page,
    }) => {
      await page.locator(".gallery-lightbox-trigger").click();

      const modal = page.locator("#gallery-lightbox-modal");
      await expect(modal).toHaveClass(/is-open/);
      await expect(modal).toHaveAttribute("role", "dialog");
      await expect(modal).toHaveAttribute("aria-modal", "true");
      await expect(modal.locator(".swiper-slide:not(.swiper-slide-duplicate)")).toHaveCount(
        IMAGES.length
      );
      await expect(page.locator(".gallery-lightbox-close")).toBeFocused();
    });

    test("the next button navigates to the next slide", async ({ page }) => {
      await page.locator(".gallery-lightbox-trigger").click();
      await page.locator(".swiper-button-next").click();

      const activeImg = page.locator("#gallery-lightbox-modal .swiper-slide-active img");
      await expect(activeImg).toHaveAttribute("src", /about\.webp/);
    });

    test("Escape closes the modal and returns focus to the trigger", async ({ page }) => {
      const trigger = page.locator(".gallery-lightbox-trigger");
      await trigger.click();
      await expect(page.locator("#gallery-lightbox-modal")).toHaveClass(/is-open/);

      await page.keyboard.press("Escape");

      await expect(page.locator("#gallery-lightbox-modal")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  });

  test.describe("gallery with track active slide", () => {
    const slug = "e2e-fixture-gallery-track-active";
    let fixtureUrl: string;

    test.beforeAll(() => {
      fixtureUrl = createFixturePage(
        slug,
        "E2E Fixture — Gallery Track Active",
        buildGalleryContent(IMAGES, { trackActiveSlide: true })
      ).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);
    });

    test("the trigger's count updates to the last-viewed slide after closing", async ({ page }) => {
      const trigger = page.locator(".gallery-lightbox-trigger");
      await expect(trigger.locator(".gallery-lightbox-count")).toContainText("01");

      await trigger.click();
      await page.locator(".swiper-button-next").click();
      await page.keyboard.press("Escape");

      await expect(trigger.locator(".gallery-lightbox-count")).toContainText("02");
    });
  });

  test.describe("gallery with a video slide", () => {
    const slug = "e2e-fixture-gallery-video";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const media: FixtureMedia[] = [
        {
          url: "/wp-content/themes/kotlinskidev/assets/images/team.webp",
          alt: "team-video",
          type: "video",
          width: 800,
          height: 600,
          poster: "/wp-content/themes/kotlinskidev/assets/images/about.webp",
        },
      ];
      fixtureUrl = createFixturePage(
        slug,
        "E2E Fixture — Gallery Video",
        buildGalleryContent(media)
      ).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test("shows a video badge on the trigger and a real video element in the modal", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      await expect(page.locator(".gallery-lightbox-video-badge")).toBeVisible();

      await page.locator(".gallery-lightbox-trigger").click();

      await expect(page.locator("#gallery-lightbox-modal video")).toHaveCount(1);
    });
  });

  test.describe("mobile media variant", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    const slug = "e2e-fixture-gallery-mobile-media";
    let fixtureUrl: string;

    test.beforeAll(() => {
      const mobileOnly: FixtureMedia[] = [
        {
          url: "/wp-content/themes/kotlinskidev/assets/images/logo.webp",
          alt: "mobile-only",
          type: "image",
          width: 400,
          height: 400,
        },
      ];
      fixtureUrl = createFixturePage(
        slug,
        "E2E Fixture — Gallery Mobile Media",
        buildGalleryContent(IMAGES, { mobileImages: mobileOnly })
      ).url;
    });

    test.afterAll(() => {
      deleteFixturePage(slug);
    });

    test("uses the mobile-only image on the trigger and in the modal at mobile width", async ({
      page,
    }) => {
      await page.goto(fixtureUrl);
      await acceptCookies(page);

      const trigger = page.locator(".gallery-lightbox-trigger img");
      await expect(trigger).toHaveAttribute("src", /mobile-only|logo\.webp/);

      await page.locator(".gallery-lightbox-trigger").click();

      const modalImg = page.locator("#gallery-lightbox-modal img").first();
      await expect(modalImg).toHaveAttribute("src", /logo\.webp/);
    });
  });
});
