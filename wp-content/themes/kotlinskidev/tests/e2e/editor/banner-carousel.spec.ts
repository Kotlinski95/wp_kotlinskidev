import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";
import { acceptCookies } from "../utils";
import { deletePost } from "../wp-cli";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const FIXTURE_IMAGES = [
  {
    id: 1,
    url: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp",
    alt: "team",
  },
  {
    id: 2,
    url: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/about.webp",
    alt: "about",
  },
];

async function setUpEditorWithCarousel(page: Page, title: string) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });
  await editor.insertBlock({
    name: "kotlinskidev/banner-carousel",
    attributes: { images: FIXTURE_IMAGES },
  });
  await editor.openDocumentSettingsSidebar();

  return { editor, admin };
}

test.describe("Banner carousel — Site Editor (kotlinskidev/banner-carousel)", () => {
  test("inserting with images renders the same number of slides in the canvas", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel A");

    await expect(editor.canvas.locator(".swiper-slide")).toHaveCount(FIXTURE_IMAGES.length);
  });

  test("turning off Show Arrows removes the arrow buttons from the saved markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel B");

    await page.getByRole("checkbox", { name: "Show Arrows" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"showArrows":false');
    expect(content).not.toContain("swiper-button-prev");
    expect(content).not.toContain("swiper-button-next");
  });

  test("turning off Show Pagination removes the pagination element from the saved markup", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel C");

    await page.getByRole("checkbox", { name: "Show Pagination" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"showPagination":false');
  });

  test("enabling Loop Mode is reflected in the saved attributes", async ({ page }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel D");

    await page.getByRole("checkbox", { name: "Loop Mode" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"loop":true');
  });

  test("enabling Autoplay reveals the delay control, and changing it updates the saved delay", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel E");

    const delayInput = page.getByRole("spinbutton", { name: "Autoplay Delay (seconds)" });

    await expect(delayInput).toHaveCount(0);

    await page.getByRole("checkbox", { name: "Autoplay" }).click();
    await expect(delayInput).toBeVisible();

    await delayInput.fill("5");
    await delayInput.blur();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"autoplay":true');
    expect(content).toContain('"autoplayDelay":5000');
  });

  test("changing Arrows Position away from sides reveals the outside-navigation toggle", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel F");

    await expect(page.getByLabel("Show navigation outside carousel")).toHaveCount(0);

    await page.getByLabel("Arrows Position").selectOption({ label: "Bottom center" });
    await expect(page.getByLabel("Show navigation outside carousel")).toBeVisible();

    await page.getByLabel("Show navigation outside carousel").click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"arrowsPosition":"bottom-center"');
    expect(content).toContain('"navPlacement":"outside"');
    expect(content).toContain("carousel-nav");
    expect(content).toContain("carousel-nav__counter");
  });

  test("publishing a carousel with custom settings renders and behaves correctly on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditorWithCarousel(page, "E2E Editor Test — Carousel Frontend");

    await page.getByRole("checkbox", { name: "Loop Mode" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const swiper = anonymousPage.locator(".swiper");
        await expect(swiper).toHaveClass(/swiper-initialized/);
        await expect(anonymousPage.locator(".swiper-slide")).toHaveCount(FIXTURE_IMAGES.length);

        await expect(anonymousPage.locator(".swiper-button-prev")).not.toHaveClass(
          /swiper-button-disabled/
        );
      } finally {
        await anonymousContext.close();
      }
    } finally {
      if (postId) {
        deletePost(postId);
      }
    }
  });
});
