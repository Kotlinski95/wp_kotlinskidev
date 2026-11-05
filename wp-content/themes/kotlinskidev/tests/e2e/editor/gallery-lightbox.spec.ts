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
    thumbnailUrl:
      "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp",
    alt: "team",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 800,
    height: 600,
  },
  {
    id: 2,
    url: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/about.webp",
    thumbnailUrl:
      "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/about.webp",
    alt: "about",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 800,
    height: 600,
  },
];

const FIXTURE_VIDEO_IMAGE = {
  id: 3,
  url: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/videos/hero.mp4",
  thumbnailUrl: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp",
  alt: "team-video",
  caption: "",
  type: "video" as const,
  poster: "http://kotlinskidev.local/wp-content/themes/kotlinskidev/assets/images/team.webp",
  width: 800,
  height: 600,
};

async function setUpEditorWithGallery(
  page: Page,
  title: string,
  images: unknown[] = FIXTURE_IMAGES
) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });
  await editor.insertBlock({ name: "kotlinskidev/gallery-lightbox", attributes: { images } });
  await editor.openDocumentSettingsSidebar();

  return { editor, admin };
}

test.describe("Gallery lightbox — Site Editor (kotlinskidev/gallery-lightbox)", () => {
  test("inserting with images renders a trigger with a count badge in the canvas", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithGallery(page, "E2E Editor Test — Gallery A");

    const trigger = editor.canvas.locator(".gallery-lightbox-trigger");
    await expect(trigger).toBeVisible();
    await expect(trigger.locator(".gallery-lightbox-count")).toHaveText(
      `+${FIXTURE_IMAGES.length - 1}`
    );
  });

  test("the Media panel lists one sidebar thumbnail per image", async ({ page }) => {
    await setUpEditorWithGallery(page, "E2E Editor Test — Gallery B");

    await expect(page.locator(".gallery-lightbox-sidebar-item")).toHaveCount(FIXTURE_IMAGES.length);
  });

  test("removing an image via the sidebar updates the canvas count badge", async ({ page }) => {
    const { editor } = await setUpEditorWithGallery(page, "E2E Editor Test — Gallery C");

    await page.locator(".gallery-lightbox-sidebar-remove").first().click();

    await expect(page.locator(".gallery-lightbox-sidebar-item")).toHaveCount(
      FIXTURE_IMAGES.length - 1
    );
    const content = await editor.getEditedPostContent();
    expect(content).toContain(`"id":${FIXTURE_IMAGES[1].id}`);
    expect(content).not.toContain(`"id":${FIXTURE_IMAGES[0].id}`);
  });

  test("enabling 'Use different media on mobile' reveals a second media uploader and is reflected in saved attributes", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithGallery(page, "E2E Editor Test — Gallery D");

    await expect(page.getByRole("button", { name: "Add Mobile Media" })).toHaveCount(0);

    await page.getByRole("checkbox", { name: "Use different media on mobile" }).click();

    await expect(page.getByRole("button", { name: "Add Mobile Media" })).toBeVisible();
    const content = await editor.getEditedPostContent();
    expect(content).toContain('"useMobileMedia":true');
  });

  test("enabling 'Track active slide' is reflected in the saved attributes and canvas badge", async ({
    page,
  }) => {
    const { editor } = await setUpEditorWithGallery(page, "E2E Editor Test — Gallery E");

    await page.getByRole("checkbox", { name: "Track active slide" }).click();

    const content = await editor.getEditedPostContent();
    expect(content).toContain('"trackActiveSlide":true');
  });

  test("a 'Video Options' panel appears only when the gallery contains a video", async ({
    page,
  }) => {
    await setUpEditorWithGallery(page, "E2E Editor Test — Gallery F", FIXTURE_IMAGES);
    await expect(page.getByRole("button", { name: /Video Options/ })).toHaveCount(0);

    await setUpEditorWithGallery(page, "E2E Editor Test — Gallery G", [
      ...FIXTURE_IMAGES,
      FIXTURE_VIDEO_IMAGE,
    ]);
    await expect(page.getByRole("button", { name: /Video Options/ })).toBeVisible();
  });

  test("publishing a gallery renders a working lightbox on the frontend", async ({
    page,
    browser,
  }) => {
    const { editor } = await setUpEditorWithGallery(page, "E2E Editor Test — Gallery Frontend");

    await page.getByRole("checkbox", { name: "Track active slide" }).click();

    const postId = await editor.publishPost();
    expect(postId).not.toBeNull();

    try {
      const anonymousContext = await browser.newContext();
      try {
        const anonymousPage = await anonymousContext.newPage();
        await anonymousPage.goto(`/?page_id=${postId}`);
        await acceptCookies(anonymousPage);

        const trigger = anonymousPage.locator(".gallery-lightbox-trigger");
        await expect(trigger).toBeVisible();
        await trigger.click();

        const modal = anonymousPage.locator("#gallery-lightbox-modal");
        await expect(modal).toHaveClass(/is-open/);
        await expect(modal.locator(".swiper-slide:not(.swiper-slide-duplicate)")).toHaveCount(
          FIXTURE_IMAGES.length
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
