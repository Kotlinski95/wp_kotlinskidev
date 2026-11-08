const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

module.exports = async () => {
  loadEnvFile(path.join(__dirname, ".env"));

  const username = process.env.WP_TEST_ADMIN_USER;
  const password = process.env.WP_TEST_ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      "[global-setup] WP_TEST_ADMIN_USER/WP_TEST_ADMIN_PASSWORD not set (see tests/e2e/.env.example) — skipping admin login. Editor e2e specs that require authentication will fail."
    );
    return;
  }

  const artifactsPath = process.env.WP_ARTIFACTS_PATH || path.join(process.cwd(), "artifacts");
  const authFile = path.join(artifactsPath, ".auth", "admin.json");
  const baseUrl = new URL(process.env.WP_BASE_URL || "http://kotlinskidev.local");
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(new URL("/login/", baseUrl).href);
  await page.fill("#user_login", username);
  await page.fill("#user_pass", password);
  await page.click("#wp-submit");
  await page.waitForURL(/wp-admin/, { timeout: 15000 });

  await page.context().storageState({ path: authFile });
  await browser.close();
};
