const { pages, baseUrl } = require("./urls.json");

const base = (process.env.AUDIT_BASE_URL || baseUrl).replace(/\/$/, "");

module.exports = {
  ci: {
    collect: {
      url: pages.map((page) => `${base}${page.path}`),
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./audit/results/lighthouse",
    },
  },
};
