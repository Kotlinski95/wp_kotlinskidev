const { loadPages } = require("./lib/load-pages");

const { baseUrl, pages } = loadPages();

module.exports = {
  ci: {
    collect: {
      url: pages.map((page) => `${baseUrl}${page.path}`),
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
