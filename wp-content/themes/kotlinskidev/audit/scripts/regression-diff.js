const fs = require("fs");
const path = require("path");

const resultsDir = path.join(__dirname, "..", "results");
const historyDir = path.join(__dirname, "..", "history");

const SCORE_DROP_THRESHOLD = 0.05;
const SECURITY_RANK = { pass: 2, warn: 1, fail: 0 };

function loadReport(dir, file) {
  const full = path.join(dir, file);
  if (!fs.existsSync(full)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function diffScores(id, label, before, after, findings) {
  if (typeof before !== "number" || typeof after !== "number") {
    return;
  }
  const drop = before - after;
  if (drop > SCORE_DROP_THRESHOLD) {
    findings.push(
      `**${id}** — ${label} dropped ${(drop * 100).toFixed(1)} pts (${(before * 100).toFixed(0)} to ${(after * 100).toFixed(0)})`
    );
  }
}

function run() {
  const current = loadReport(resultsDir, "latest.json");
  if (!current) {
    console.error("No current report found at audit/results/latest.json");
    process.exit(1);
  }

  const baseline = loadReport(historyDir, "latest.json");
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  const lines = ["# Site Audit Report", ""];

  if (!baseline) {
    lines.push(
      "No baseline found — this run establishes the baseline. No regression check performed."
    );
    current.forEach((page) => {
      lines.push(
        `- **${page.id}**: performance ${scorePct(page.performance?.score)}, accessibility ${scorePct(page.accessibility?.lighthouseScore)}, seo issues ${page.seo?.issues?.length ?? "n/a"}, security ${page.security?.grade ?? "n/a"}`
      );
    });
    if (summaryPath) {
      fs.appendFileSync(summaryPath, lines.join("\n"));
    }
    console.error(lines.join("\n"));
    return;
  }

  const baselineById = Object.fromEntries(baseline.map((p) => [p.id, p]));
  const findings = [];

  current.forEach((page) => {
    const prev = baselineById[page.id];
    if (!prev) {
      return;
    }

    diffScores(page.id, "Performance", prev.performance?.score, page.performance?.score, findings);
    diffScores(
      page.id,
      "Accessibility (Lighthouse)",
      prev.accessibility?.lighthouseScore,
      page.accessibility?.lighthouseScore,
      findings
    );

    const prevA11yErrors = prev.accessibility?.pa11y?.errors ?? 0;
    const curA11yErrors = page.accessibility?.pa11y?.errors ?? 0;
    if (curA11yErrors > prevA11yErrors) {
      findings.push(
        `**${page.id}** — accessibility errors increased from ${prevA11yErrors} to ${curA11yErrors} (pa11y)`
      );
    }

    const prevSeoIssues = prev.seo?.issues?.length ?? 0;
    const curSeoIssues = page.seo?.issues?.length ?? 0;
    if (curSeoIssues > prevSeoIssues) {
      findings.push(
        `**${page.id}** — SEO issues increased from ${prevSeoIssues} to ${curSeoIssues}`
      );
    }

    const prevSecurity = SECURITY_RANK[prev.security?.grade] ?? 2;
    const curSecurity = SECURITY_RANK[page.security?.grade] ?? 2;
    if (curSecurity < prevSecurity) {
      findings.push(
        `**${page.id}** — security grade dropped from ${prev.security?.grade} to ${page.security?.grade}`
      );
    }
  });

  if (findings.length) {
    lines.push(`${findings.length} regression(s) found:`, "");
    findings.forEach((f) => lines.push(`- ${f}`));
  } else {
    lines.push("No regressions detected vs. baseline.");
  }

  if (summaryPath) {
    fs.appendFileSync(summaryPath, lines.join("\n"));
  }
  console.error(lines.join("\n"));

  if (findings.length) {
    process.exit(1);
  }
}

function scorePct(score) {
  return typeof score === "number" ? `${(score * 100).toFixed(0)}%` : "n/a";
}

run();
