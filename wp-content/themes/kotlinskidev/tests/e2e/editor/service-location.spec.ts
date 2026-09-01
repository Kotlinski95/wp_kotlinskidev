import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { Editor } from "@wordpress/e2e-test-utils-playwright";

test.use({
  storageState: path.join(
    process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts"),
    ".auth",
    "admin.json"
  ),
});

const WP_ROOT = path.resolve(process.cwd(), "..", "..", "..");

function wp(args: string[]): string {
  return execFileSync("wp", args, {
    cwd: WP_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

test.describe("Service Location — Site Editor template is real, separately-editable blocks", () => {
  test("the single-service_location template canvas exposes multiple distinct, individually-selectable blocks", async ({
    page,
  }) => {
    const editor = new Editor({ page });

    await page.goto("/wp-admin/site-editor.php");
    await editor.setPreferences("core/edit-site", {
      welcomeGuide: false,
      welcomeGuideStyles: false,
      welcomeGuidePage: false,
      welcomeGuideTemplate: false,
    });

    await page.goto(
      "/wp-admin/site-editor.php?p=%2Fwp_template%2Fkotlinskidev%2F%2Fsingle-service_location&canvas=edit"
    );

    const canvas = page.frameLocator('iframe[name="editor-canvas"]');

    // Several distinct native blocks are present in the canvas at once — proves
    // this is real block markup, not one opaque ServerSideRender wrapper. Each
    // block wrapper in the canvas carries role="document" (not "heading"/"group"
    // — see .claude/rules/testing.md), so target that role with its block-type name.
    await expect(canvas.getByRole("document", { name: "Block: Heading" }).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(canvas.getByRole("document", { name: "Block: Group" }).first()).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Button text" }).first()).toBeVisible();

    // Selecting one of them individually switches the sidebar to that block's
    // own settings — proves each is independently selectable/editable.
    const buttonText = canvas.getByRole("textbox", { name: "Button text" }).first();
    await buttonText.click();

    await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
  });
});

test.describe("Service Location — City Details editor panel", () => {
  test("a real service_location post loads the block editor with a non-empty City field", async ({
    page,
  }) => {
    const ids = wp([
      "post",
      "list",
      "--post_type=service_location",
      "--post_status=publish",
      "--field=ID",
      "--number=1",
    ]);
    test.skip(!ids, "no published service_location post exists to edit");
    const id = ids.split("\n")[0];

    await page.goto(`/wp-admin/post.php?post=${id}&action=edit`);

    await expect(page.frameLocator('iframe[name="editor-canvas"]').locator("body")).toBeVisible();

    const panelButton = page.getByRole("button", { name: "City Details" });
    if (await panelButton.isVisible().catch(() => false)) {
      await panelButton.click();
    }

    const cityField = page.getByLabel("City", { exact: true });
    await expect(cityField).toBeVisible();
    await expect(cityField).not.toHaveValue("");
  });
});
