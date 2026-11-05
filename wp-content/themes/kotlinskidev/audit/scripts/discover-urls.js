const fs = require("fs");
const path = require("path");
const config = require("../urls.json");

const base = (process.env.AUDIT_BASE_URL || config.baseUrl).replace(/\/$/, "");
const outputPath = path.join(__dirname, "..", "results", "urls.generated.json");
const MAX_PAGES = 200;

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());
}

async function fetchXml(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  return response.text();
}

function isExcluded(url) {
  return (config.excludePatterns || []).some((pattern) => url.includes(pattern));
}

function toPageEntry(url) {
  const withoutBase = url.startsWith(base) ? url.slice(base.length) : url;
  const urlPath = withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`;

  const id =
    urlPath === "/"
      ? "home"
      : urlPath
          .replace(/^\/|\/$/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

  return { id, path: urlPath };
}

async function discoverFromSitemap(sitemapUrl, seen) {
  if (seen.has(sitemapUrl)) {
    return [];
  }
  seen.add(sitemapUrl);

  const xml = await fetchXml(sitemapUrl);
  const isIndex = /<sitemapindex[\s>]/.test(xml);
  const locs = extractLocs(xml);

  if (!isIndex) {
    return locs;
  }

  const nested = await Promise.all(locs.map((loc) => discoverFromSitemap(loc, seen)));
  return nested.flat();
}

async function run() {
  const sitemapUrl = `${base}${config.sitemapPath}`;
  const allUrls = await discoverFromSitemap(sitemapUrl, new Set());

  const seenIds = new Set();
  const pages = allUrls
    .filter((url) => !isExcluded(url))
    .map(toPageEntry)
    .filter((page) => {
      if (seenIds.has(page.id)) {
        return false;
      }
      seenIds.add(page.id);
      return true;
    })
    .slice(0, MAX_PAGES);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      { baseUrl: base, sitemapUrl, generatedAt: new Date().toISOString(), pages },
      null,
      2
    )
  );

  console.error(
    `Discovered ${allUrls.length} URL(s) from ${sitemapUrl}, ${pages.length} kept after exclusions.`
  );
}

run().catch((error) => {
  console.error(`Sitemap discovery failed: ${error.message}`);
  process.exit(1);
});
