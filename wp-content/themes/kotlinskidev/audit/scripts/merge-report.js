const fs = require("fs");
const path = require("path");
const { pages, baseUrl } = require("../urls.json");

const base = (process.env.AUDIT_BASE_URL || baseUrl).replace(/\/$/, "");
const resultsDir = path.join(__dirname, "..", "results");

function readJson(file, fallback) {
  const full = path.join(resultsDir, file);
  if (!fs.existsSync(full)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function readLighthouseManifest() {
  const manifestPath = path.join(resultsDir, "lighthouse", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return {};
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const byUrl = {};
  manifest.forEach((entry) => {
    if (!byUrl[entry.url] || entry.isRepresentativeRun) {
      byUrl[entry.url] = entry.summary;
    }
  });
  return byUrl;
}

function readPa11y() {
  const raw = readJson("pa11y.json", null);
  if (!raw || !raw.results) {
    return {};
  }
  const byUrl = {};
  Object.entries(raw.results).forEach(([url, issues]) => {
    byUrl[url] = {
      issueCount: issues.length,
      errors: issues.filter((i) => i.type === "error").length,
      warnings: issues.filter((i) => i.type === "warning").length,
      issues: issues.map((i) => ({ code: i.code, message: i.message, selector: i.selector })),
    };
  });
  return byUrl;
}

function run() {
  const lighthouse = readLighthouseManifest();
  const pa11y = readPa11y();
  const seo = readJson("seo.json", []);
  const security = readJson("security.json", []);

  const seoByUrl = Object.fromEntries(seo.map((r) => [r.url, r]));
  const securityByUrl = Object.fromEntries(security.map((r) => [r.url, r]));

  const timestamp = new Date().toISOString();
  const report = pages.map((page) => {
    const url = `${base}${page.path}`;
    return {
      id: page.id,
      url,
      timestamp,
      performance: lighthouse[url]
        ? { score: lighthouse[url].performance, categories: lighthouse[url] }
        : null,
      accessibility: {
        lighthouseScore: lighthouse[url] ? lighthouse[url].accessibility : null,
        pa11y: pa11y[url] || null,
      },
      seo: seoByUrl[url] || null,
      security: securityByUrl[url] || null,
      aeo_geo: {
        manual_checklist: [
          "Structured data answers the page's core question directly (FAQ/HowTo/Article schema present)",
          "Content includes a direct, quotable answer near the top (not buried after fluff)",
          "llms.txt present and up to date",
          "Page is crawlable by AI bots (check robots.txt for GPTBot, ClaudeBot, PerplexityBot)",
          "Spot-check: ask ChatGPT/Perplexity/Claude about this topic, confirm the site is cited",
        ],
      },
    };
  });

  fs.writeFileSync(path.join(resultsDir, "latest.json"), JSON.stringify(report, null, 2));
  const historyFile = `report-${timestamp.replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(path.join(resultsDir, historyFile), JSON.stringify(report, null, 2));

  console.error(`Merged report written: audit/results/latest.json (${report.length} page(s))`);
}

run();
