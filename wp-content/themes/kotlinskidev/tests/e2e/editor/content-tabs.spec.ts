import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, expect, type Page } from "@playwright/test";
import { Admin, Editor, PageUtils } from "@wordpress/e2e-test-utils-playwright";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

async function setUpEditor(page: Page, title: string, attributes: Record<string, unknown> = {}) {
  const pageUtils = new PageUtils({ page });
  const editor = new Editor({ page });
  const admin = new Admin({ page, pageUtils, editor });

  await admin.createNewPost({ postType: "page", title, showWelcomeGuide: false });
  await editor.insertBlock({ name: "kotlinskidev/content-tabs", attributes });

  return { editor };
}

test.describe("Content Tabs — Site Editor live preview (kotlinskidev/content-tabs)", () => {
  test("nav links render inside the real nav slot, in tab order, and only the active tab's panel content renders inside the panels slot", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs A");
    const wrapper = editor.canvas.locator(".kt-content-tabs-editor");
    await expect(wrapper).toHaveAttribute("data-active-tab", "0");

    const navLinks = editor.canvas.locator(
      ".kt-content-tabs__nav .kt-content-tabs-nav-link-editor"
    );
    await expect(navLinks).toHaveCount(3);
    expect(await navLinks.allTextContents()).toEqual([
      "Creating Websites",
      "Performance Analysis",
      "Website Optimization",
    ]);

    const panelParagraphs = editor.canvas.locator(
      ".kt-content-tabs__panels [data-type='core/paragraph']"
    );
    await expect(panelParagraphs).toHaveCount(1);
  });

  test("clicking a tab's nav link switches the active tab and moves that tab's panel content into the panels slot", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs B");
    const wrapper = editor.canvas.locator(".kt-content-tabs-editor");

    const navLinks = editor.canvas.locator(
      ".kt-content-tabs__nav .kt-content-tabs-nav-link-editor"
    );
    await navLinks.nth(2).click();

    await expect(wrapper).toHaveAttribute("data-active-tab", "2");
    await expect(navLinks.nth(2)).toHaveClass(/kt-content-tabs-nav-link-editor--active/);

    const panelParagraphs = editor.canvas.locator(
      ".kt-content-tabs__panels [data-type='core/paragraph']"
    );
    await expect(panelParagraphs).toHaveCount(1);
  });

  test("selecting a tab's block in the Document Overview (list view) switches the active tab", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs C");
    const wrapper = editor.canvas.locator(".kt-content-tabs-editor");

    await page.getByRole("button", { name: "Document Overview" }).click();
    await page.getByRole("link", { name: "Content Tabs" }).click();
    await page.keyboard.press("ArrowRight");

    const tabRows = page.getByRole("link", { name: /Content Tab$/ });
    await expect(tabRows).toHaveCount(3);
    await tabRows.nth(1).click();

    await expect(wrapper).toHaveAttribute("data-active-tab", "1");

    const panelParagraphs = editor.canvas.locator(
      ".kt-content-tabs__panels [data-type='core/paragraph']"
    );
    await expect(panelParagraphs).toHaveCount(1);
  });

  test("shows both a gradient text color and a gradient background on the active tab at once, without either clobbering the other", async ({
    page,
  }) => {
    // Regression test: both rules originally set the `background` CSS
    // property on the same editor element (the gradient-text technique needs
    // `background: <gradient>; background-clip: text;` on the label itself),
    // so whichever modifier class came later in the stylesheet silently won
    // and the other effect vanished. A first fix moved the background paint
    // to an absolutely positioned ::before — but a child pseudo-element
    // always paints on top of its own parent's background regardless of
    // z-index, so the opaque ::before fully hid the gradient-clipped text
    // glyphs underneath it (confirmed visually via screenshot, not just
    // computed style — getComputedStyle reported the correct values on both
    // elements even while the text was invisible on screen). The real fix
    // composites both gradients as two layers of the *same* `background`
    // property on the label itself (`background-clip: text, border-box`),
    // so there's no child element able to paint over anything.
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs D", {
      activeTabUnderline: false,
      activeTabTextColorEnabled: true,
      activeTabColor: "linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)",
      activeTabBackgroundEnabled: true,
      activeTabBackgroundColor: "linear-gradient(90deg,#000000 0%,#ffffff 100%)",
    });

    const activeLabel = editor.canvas.locator(".kt-content-tabs-nav-link-editor--active");

    const backgroundImage = await activeLabel.evaluate(
      (el) => getComputedStyle(el).backgroundImage
    );
    const gradientLayerCount = (backgroundImage.match(/gradient\(/g) || []).length;
    expect(gradientLayerCount).toBe(2);

    await expect(activeLabel).toHaveCSS("-webkit-text-fill-color", /rgba\(\d+, \d+, \d+, 0\)/);

    const beforeContent = await activeLabel.evaluate(
      (el) => getComputedStyle(el, "::before").content
    );
    expect(beforeContent).toBe("none");
  });

  test("shows a gradient text color over a solid (non-gradient) background on the active tab, without the background hiding the text", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs D2", {
      activeTabUnderline: false,
      activeTabTextColorEnabled: true,
      activeTabColor: "linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)",
      activeTabBackgroundEnabled: true,
      activeTabBackgroundColor: "#111827",
    });

    const activeLabel = editor.canvas.locator(".kt-content-tabs-nav-link-editor--active");

    await expect(activeLabel).toHaveCSS("background-color", "rgb(17, 24, 39)");
    await expect(activeLabel).toHaveCSS("background-image", /gradient/);
    await expect(activeLabel).toHaveCSS("-webkit-text-fill-color", /rgba\(\d+, \d+, \d+, 0\)/);

    const beforeContent = await activeLabel.evaluate(
      (el) => getComputedStyle(el, "::before").content
    );
    expect(beforeContent).toBe("none");
  });

  test("lays the nav out to the left of the panels — a real side-by-side split, not a vertical approximation — when navPosition is left", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs E", {
      navPosition: "left",
    });

    const navBox = await editor.canvas.locator(".kt-content-tabs__nav").boundingBox();
    const panelsBox = await editor.canvas.locator(".kt-content-tabs__panels").boundingBox();

    expect(navBox).not.toBeNull();
    expect(panelsBox).not.toBeNull();
    expect(navBox!.x).toBeLessThan(panelsBox!.x);
  });

  test("lays the nav out above the panels when navPosition is top", async ({ page }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs F", {
      navPosition: "top",
    });

    const navBox = await editor.canvas.locator(".kt-content-tabs__nav").boundingBox();
    const panelsBox = await editor.canvas.locator(".kt-content-tabs__panels").boundingBox();

    expect(navBox).not.toBeNull();
    expect(panelsBox).not.toBeNull();
    expect(navBox!.y).toBeLessThan(panelsBox!.y);
  });

  test("carries the mobile nav position class on the editor wrapper, matching the frontend", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs Mobile", {
      navPositionMobile: "bottom",
    });

    const wrapper = editor.canvas.locator(".kt-content-tabs-editor");
    await expect(wrapper).toHaveClass(/kt-content-tabs--mobile-bottom/);
  });

  test("keeps the block toolbar correctly positioned over a selected, portaled nav-link", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs G", {
      navPosition: "left",
    });

    const navLink = editor.canvas
      .locator(".kt-content-tabs__nav .kt-content-tabs-nav-link-editor")
      .first();
    await navLink.click();

    const toolbar = page.getByRole("toolbar", { name: "Block tools" });
    await expect(toolbar).toBeVisible();

    const toolbarBox = await toolbar.boundingBox();
    const navLinkBox = await navLink.boundingBox();
    expect(toolbarBox).not.toBeNull();
    expect(navLinkBox).not.toBeNull();
    // The toolbar floats just above/around the selected block's own real
    // rendered position — if portaling had broken Gutenberg's own selection
    // measurement, this would land far away from the nav-link (e.g. at the
    // original, now-empty item position instead).
    expect(Math.abs(toolbarBox!.x - navLinkBox!.x)).toBeLessThan(200);
  });

  test("saves the exact same block markup as before portaling — item/nav-link order and attributes are untouched", async ({
    page,
  }) => {
    const { editor } = await setUpEditor(page, "E2E Editor Test — Content Tabs H");

    const content = await editor.getEditedPostContent();

    expect(content).toContain('"label":"Creating Websites"');
    expect(content).toContain('"label":"Performance Analysis"');
    expect(content).toContain('"label":"Website Optimization"');
    expect(
      content.indexOf("Creating Websites") < content.indexOf("Performance Analysis") &&
        content.indexOf("Performance Analysis") < content.indexOf("Website Optimization")
    ).toBe(true);
  });

  test("applies a Content Tab item's own padding and border to its portaled panel content in the editor, matching the frontend", async ({
    page,
  }) => {
    // Regression test: the item's own <div {...blockProps}> (which carries
    // its padding/border/color block-supports styles) used to stay behind
    // in its now-invisible original InnerBlocks position, since only its
    // *children* were portaled into the panels slot — so any padding/border
    // set on the "Content Tab" item itself had no visible effect in the
    // editor even though render.php wraps the exact same panel content in
    // that same styled wrapper on the frontend. The item now portals its
    // own wrapper (not just its children), carrying those styles with it.
    const content = `<!-- wp:kotlinskidev/content-tabs {"navPosition":"left"} -->
<!-- wp:kotlinskidev/content-tabs-item {"style":{"spacing":{"padding":{"top":"40px","right":"40px","bottom":"40px","left":"40px"}},"border":{"width":"3px","color":"#ff0000"}}} -->
<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Creating Websites"} /-->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>Hello from a Group block</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- /wp:kotlinskidev/content-tabs-item -->
<!-- /wp:kotlinskidev/content-tabs -->`;

    const postId = execFileSync(
      "wp",
      [
        "post",
        "create",
        "--post_type=page",
        "--post_title=E2E Editor Test — Content Tabs Item Padding",
        "--post_status=draft",
        `--post_content=${content}`,
        "--porcelain",
        "--path=../../..",
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    )
      .toString()
      .trim();

    try {
      await page.goto(`/wp-admin/post.php?post=${postId}&action=edit`);
      await page.waitForSelector("iframe[name='editor-canvas']");
      const canvas = page.frameLocator("iframe[name='editor-canvas']");

      const itemWrapper = canvas.locator(".kt-content-tabs__panels .kt-content-tabs-item-editor");
      await itemWrapper.waitFor({ state: "visible" });

      await expect(itemWrapper).toHaveCSS("padding", "40px");
      await expect(itemWrapper).toHaveCSS("border-top-width", "3px");
      await expect(itemWrapper).toHaveCSS("border-top-color", "rgb(255, 0, 0)");

      const groupInsideItem = canvas.locator(
        ".kt-content-tabs__panels .kt-content-tabs-item-editor .wp-block-group"
      );
      await expect(groupInsideItem).toHaveCount(1);
    } finally {
      execFileSync("wp", ["post", "delete", postId, "--force", "--path=../../.."], {
        stdio: ["ignore", "pipe", "ignore"],
      });
    }
  });
});
