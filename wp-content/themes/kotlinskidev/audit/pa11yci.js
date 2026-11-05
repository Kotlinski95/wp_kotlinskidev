const { loadPages } = require("./lib/load-pages");

const { baseUrl, pages } = loadPages();

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    timeout: 30000,
    chromeLaunchConfig: {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox"],
    },
  },
  urls: pages.map((page) => `${baseUrl}${page.path}`),
};
