import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

const slug = "e2e-fixture-protected-content";

function buildContent(): string {
  return `<!-- wp:kotlinskidev/protected-content {"content":"test@example.com","useProtection":true,"protectionType":"email","tagName":"p"} /-->

<!-- wp:kotlinskidev/protected-content {"content":"Plain visible text","useProtection":false,"tagName":"p"} /-->

<!-- wp:kotlinskidev/protected-content {"content":"Sensitive text value","useProtection":true,"protectionType":"text","tagName":"p"} /-->

<!-- wp:spacer {"height":"1800px"} -->
<div style="height:1800px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:kotlinskidev/protected-content {"content":"555-123-4567","useProtection":true,"protectionType":"phone","tagName":"p"} /-->`;
}

test.describe("Protected content (kotlinskidev/protected-content)", () => {
  let fixtureUrl: string;

  test.beforeAll(() => {
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Protected Content", buildContent()).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("an in-viewport protected email is decrypted and revealed as a mailto link", async ({
    page,
  }) => {
    const email = page.locator('main [data-protection-type="email"]');
    await expect(email).toHaveAttribute("data-protected", "true");

    await expect(email).toHaveClass(/protection-loaded/);
    await expect(email).not.toHaveAttribute("data-original-content", /.+/);
    await expect(email.locator("a")).toHaveAttribute("href", "mailto:test@example.com");
  });

  test("a protected text value is revealed as plain content, not auto-linked", async ({ page }) => {
    const text = page.locator('main [data-protection-type="text"]');
    await expect(text).toHaveClass(/protection-loaded/);
    await expect(text.locator("a")).toHaveCount(0);
    await expect(text).toHaveText("Sensitive text value");
  });

  test("an unprotected block renders its content directly with no protection markers", async ({
    page,
  }) => {
    const plain = page.locator("main .protected-content:not([data-protected])");
    await expect(plain).toHaveCount(1);
    await expect(plain).toHaveText("Plain visible text");
  });

  test("a below-the-fold protected phone number stays unrevealed until scrolled into view", async ({
    page,
  }) => {
    const phone = page.locator('main [data-protection-type="phone"]');
    await expect(phone).toHaveAttribute("data-original-content", /.+/);
    await expect(phone).not.toHaveClass(/protection-loaded/);

    await phone.scrollIntoViewIfNeeded();

    await expect(phone).toHaveClass(/protection-loaded/);
    await expect(phone.locator("a")).toHaveAttribute("href", "tel:5551234567");
  });
});
