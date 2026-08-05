const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

process.env.WP_ARTIFACTS_PATH ??= path.join(process.cwd(), "artifacts");

const baseUrl = new URL(process.env.WP_BASE_URL || "http://kotlinskidev.local");

module.exports = defineConfig({
  reporter: process.env.CI ? [["github"]] : [["list"]],
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  timeout: parseInt(process.env.TIMEOUT || "", 10) || 60_000,
  testDir: "./tests/e2e",
  outputDir: path.join(process.env.WP_ARTIFACTS_PATH, "test-results"),
  use: {
    baseURL: baseUrl.href,
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    locale: "pl-PL",
    contextOptions: { reducedMotion: "reduce" },
    actionTimeout: 10_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
