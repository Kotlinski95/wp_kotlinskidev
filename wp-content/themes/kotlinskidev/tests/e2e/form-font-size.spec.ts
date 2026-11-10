import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

const PAGES = ["/", "/kontakt/", "/?s=test"];

test.describe("Mobile form controls", () => {
  test.use({ viewport: { width: 428, height: 746 }, hasTouch: true });

  for (const path of PAGES) {
    test(`text controls are at least 16px on ${path}`, async ({ page }) => {
      await page.goto(path);
      await acceptCookies(page);
      await page.waitForTimeout(500);

      const tooSmall = await page.evaluate(() => {
        const skippedTypes = new Set([
          "checkbox",
          "radio",
          "hidden",
          "range",
          "color",
          "file",
          "image",
          "submit",
          "button",
          "reset",
        ]);
        return Array.from(document.querySelectorAll("input, textarea, select"))
          .filter((el) => {
            const type = (el.getAttribute("type") ?? "text").toLowerCase();
            const editorSet =
              /font-size/.test(el.getAttribute("style") ?? "") ||
              /font-size/.test(String(el.className));
            return !(el.tagName === "INPUT" && skippedTypes.has(type)) && !editorSet;
          })
          .map((el) => ({
            control: `${el.tagName.toLowerCase()}#${el.id}.${String(el.className).slice(0, 40)}`,
            fontSize: parseFloat(getComputedStyle(el).fontSize),
          }))
          .filter((entry) => entry.fontSize < 16);
      });

      expect(tooSmall).toEqual([]);
    });
  }
});
