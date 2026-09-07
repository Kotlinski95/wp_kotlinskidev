import { expect, type Page, type Locator } from "@playwright/test";

export async function acceptCookies(page: Page) {
  const acceptButton = page.getByRole("button", { name: /^(Akceptuję|Accept)$/ });
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

export function normalizePath(pathname: string): string {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}

export async function clickAndExpectNavigation(page: Page, link: Locator) {
  const href = await link.getAttribute("href");
  expect(href, "link must have a real href to verify navigation against").toBeTruthy();
  const targetPath = normalizePath(new URL(href!, page.url()).pathname);

  await link.click();

  await expect.poll(() => normalizePath(new URL(page.url()).pathname)).toBe(targetPath);
}

// A link/trigger pointing at the page currently being viewed is intentionally
// non-interactive on this theme (`kt-link-current` / `aria-disabled="true"`,
// see functions/active-link-state.php) — excluded so "pick any live link" helpers
// never happen to land on one.
export const NOT_CURRENT_PAGE = ':not(.kt-link-current):not([aria-disabled="true"])';

export function getFirstLiveLink(container: Locator): Locator {
  return container.locator(`a[href]${NOT_CURRENT_PAGE}`).first();
}

// Some core blocks (image, cover, ...) split their Inspector into "content"
// (shown by default) and "Settings" sub-tabs; a plain InspectorControls panel
// (no "group" prop) only renders once the Settings tab is active. Other blocks
// have no such split and render their panels directly — safe to call unconditionally.
export async function openBlockSettingsTab(page: Page): Promise<void> {
  const settingsTab = page.getByRole("tab", { name: "Settings" });
  if (await settingsTab.count()) {
    await settingsTab.click();
  }
}
