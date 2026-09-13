const fs = require("fs");
const path = require("path");
const { pages, baseUrl } = require("../urls.json");

const base = (process.env.AUDIT_BASE_URL || baseUrl).replace(/\/$/, "");
const outputPath = path.join(__dirname, "..", "results", "seo.json");

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractJsonLd(html) {
  const blocks = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  return blocks.map(([, raw]) => {
    try {
      const parsed = JSON.parse(raw);
      const types = Array.isArray(parsed) ? parsed.map((p) => p["@type"]) : [parsed["@type"]];
      return { valid: true, types };
    } catch {
      return { valid: false, types: [] };
    }
  });
}

function extractHreflang(html) {
  const links = [
    ...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]*>/gi),
  ];
  return links.map(([, lang]) => lang);
}

async function checkPage(page) {
  const url = `${base}${page.path}`;
  const result = { id: page.id, url };

  try {
    const response = await fetch(url);
    const html = await response.text();

    const title = extractTag(html, /<title>([^<]*)<\/title>/i);
    const description = extractTag(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    );
    const canonical = extractTag(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
    );
    const jsonLd = extractJsonLd(html);
    const hreflang = extractHreflang(html);

    result.status = response.status;
    result.seo = {
      title,
      titleLength: title ? title.length : 0,
      description,
      descriptionLength: description ? description.length : 0,
      canonical,
      jsonLd: { present: jsonLd.length > 0, blocks: jsonLd },
      hreflang: { present: hreflang.length > 0, langs: hreflang },
    };
    result.issues = [];
    if (!title) {
      result.issues.push("missing <title>");
    }
    if (!description) {
      result.issues.push("missing meta description");
    }
    if (title && (title.length < 10 || title.length > 65)) {
      result.issues.push("title length outside 10-65 chars");
    }
    if (description && (description.length < 50 || description.length > 160)) {
      result.issues.push("meta description length outside 50-160 chars");
    }
    if (!canonical) {
      result.issues.push("missing canonical link");
    }
    if (!jsonLd.length) {
      result.issues.push("no JSON-LD structured data found");
    }
    if (jsonLd.some((block) => !block.valid)) {
      result.issues.push("invalid JSON-LD block (parse error)");
    }
  } catch (error) {
    result.status = 0;
    result.error = error.message;
    result.issues = [`fetch failed: ${error.message}`];
  }

  return result;
}

async function run() {
  const results = await Promise.all(pages.map(checkPage));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  const failed = results.filter((r) => r.issues.length > 0);
  if (failed.length) {
    console.error(`SEO check found issues on ${failed.length}/${results.length} page(s):`);
    failed.forEach((r) => console.error(`  ${r.url}: ${r.issues.join(", ")}`));
  } else {
    console.error(`SEO check passed on all ${results.length} page(s).`);
  }
}

run();
