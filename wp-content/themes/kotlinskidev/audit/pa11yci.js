const { pages, baseUrl } = require("./urls.json");

const base = (process.env.AUDIT_BASE_URL || baseUrl).replace(/\/$/, "");

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    timeout: 30000,
    chromeLaunchConfig: {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox"],
    },
  },
  urls: pages.map((page) => `${base}${page.path}`),
};
