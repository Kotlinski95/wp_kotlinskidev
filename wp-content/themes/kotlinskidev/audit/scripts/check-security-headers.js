const fs = require("fs");
const path = require("path");
const { loadPages } = require("../lib/load-pages");

const { baseUrl, pages } = loadPages();
const outputPath = path.join(__dirname, "..", "results", "security.json");

const EXPECTED = [
  {
    header: "strict-transport-security",
    check: (v) => !!v,
    message: "Strict-Transport-Security missing",
  },
  {
    header: "x-frame-options",
    check: (v) => (v || "").toLowerCase() === "deny",
    message: 'X-Frame-Options should be "deny"',
  },
  {
    header: "x-content-type-options",
    check: (v) => (v || "").toLowerCase() === "nosniff",
    message: 'X-Content-Type-Options should be "nosniff"',
  },
  {
    header: "referrer-policy",
    check: (v) => (v || "").toLowerCase() === "strict-origin-when-cross-origin",
    message: 'Referrer-Policy should be "strict-origin-when-cross-origin"',
  },
  {
    header: "permissions-policy",
    check: (v) => !!v,
    message: "Permissions-Policy missing",
  },
  {
    header: "content-security-policy",
    check: (v, headers) => !!v || !!headers.get("content-security-policy-report-only"),
    message: "Content-Security-Policy (or Report-Only) missing",
  },
  {
    header: "x-xss-protection",
    check: (v) => !v || v === "0",
    message: 'X-XSS-Protection should be absent or "0" (deprecated header)',
  },
];

function gradeFor(issueCount) {
  if (issueCount === 0) {
    return "pass";
  }
  if (issueCount <= 2) {
    return "warn";
  }
  return "fail";
}

async function checkPage(page) {
  const url = `${baseUrl}${page.path}`;
  const result = { id: page.id, url };

  try {
    const response = await fetch(url, { redirect: "follow" });
    const headers = response.headers;
    const raw = {};
    headers.forEach((value, key) => {
      raw[key] = value;
    });

    const issues = [];
    EXPECTED.forEach(({ header, check, message }) => {
      const value = headers.get(header);
      if (!check(value, headers)) {
        issues.push(message);
      }
    });

    result.status = response.status;
    result.headers = raw;
    result.issues = issues;
    result.grade = gradeFor(issues.length);
  } catch (error) {
    result.status = 0;
    result.error = error.message;
    result.issues = [`fetch failed: ${error.message}`];
    result.grade = "fail";
  }

  return result;
}

async function run() {
  const results = await Promise.all(pages.map(checkPage));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  const failed = results.filter((r) => r.issues.length > 0);
  if (failed.length) {
    console.error(
      `Security header check found issues on ${failed.length}/${results.length} page(s):`
    );
    failed.forEach((r) => console.error(`  ${r.url}: ${r.issues.join(", ")}`));
  } else {
    console.error(`Security header check passed on all ${results.length} page(s).`);
  }
}

run();
