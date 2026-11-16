const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");
const config = require("../urls.json");

const base = (process.env.AUDIT_BASE_URL || config.baseUrl).replace(/\/$/, "");
const concurrency = Number(process.env.AUDIT_CONCURRENCY || 1);
const viewports = (process.env.AUDIT_VIEWPORTS || "mobile,desktop").split(",");
const pageFilter = process.env.AUDIT_PAGE_FILTER || "";
const MEDIA_SLOTS = [
  ".kt-device-frame__screen",
  ...(process.env.AUDIT_MEDIA_SLOTS || "").split(",").filter(Boolean),
];
const explicitPages = [
  ...process.argv.slice(2).filter((arg) => !arg.startsWith("--")),
  ...(process.env.AUDIT_URLS || "").split(",").filter(Boolean),
];
const outputPath = path.join(__dirname, "..", "results", "images.json");

const VIEWPORTS = {
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const log = (message) => process.stdout.write(`${message}\n`);

const extractLocs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  return response.text();
};

const collectSitemapUrls = async (sitemapUrl, seen = new Set()) => {
  if (seen.has(sitemapUrl)) {
    return [];
  }
  seen.add(sitemapUrl);
  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);
  if (!/<sitemapindex[\s>]/.test(xml)) {
    return locs;
  }
  const nested = await Promise.all(locs.map((loc) => collectSitemapUrls(loc, seen)));
  return nested.flat();
};

const toLocalUrl = (url) => {
  const parsed = new URL(url);
  return `${base}${parsed.pathname}${parsed.search}`;
};

const isExcluded = (url) => (config.excludePatterns || []).some((pattern) => url.includes(pattern));

const scrollThrough = async (page) => {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const shell = document.querySelector(".wp-site-blocks");
    const scrollers = [document.scrollingElement, shell].filter(
      (el) => el && el.scrollHeight > el.clientHeight + 10
    );
    for (const scroller of scrollers) {
      const step = Math.max(300, Math.floor(window.innerHeight * 0.7));
      for (let y = 0; y < scroller.scrollHeight; y += step) {
        scroller.scrollTop = y;
        await sleep(120);
      }
      scroller.scrollTop = 0;
    }
    const pending = [...document.images].filter(
      (img) => !img.complete && img.offsetParent !== null
    );
    for (const img of pending) {
      img.scrollIntoView({ block: "center", behavior: "instant" });
      await Promise.race([
        new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
        sleep(6000),
      ]);
    }
    for (const scroller of scrollers) {
      scroller.scrollTop = 0;
    }
  });
};

const inspectImages = (page) =>
  page.evaluate((mediaSlots) => {
    const describe = (img) => ({
      src: img.currentSrc || img.getAttribute("src") || img.getAttribute("data-src") || "",
      alt: img.getAttribute("alt"),
      cls: String(img.className).slice(0, 80),
      parent: img.parentElement ? String(img.parentElement.className).slice(0, 80) : "",
      html: img.outerHTML.slice(0, 160),
    });
    const findings = [];
    for (const img of document.images) {
      const boundLater = img.hasAttribute("data-wp-bind--src") || img.hasAttribute("hidden");
      if (boundLater || img.closest(".kt-modal-marquee, template")) {
        continue;
      }
      const hasSource =
        img.getAttribute("src") || img.getAttribute("srcset") || img.getAttribute("data-src");
      if (!hasSource) {
        findings.push({ type: "no-src", ...describe(img) });
        continue;
      }
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) {
        findings.push({ type: "broken", ...describe(img) });
        continue;
      }
      const visible = img.offsetParent !== null && img.getClientRects().length > 0;
      if (visible && !img.complete) {
        findings.push({ type: "not-loaded", ...describe(img) });
      }
    }
    for (const el of document.querySelectorAll("[style*='background-image']")) {
      const match = el.getAttribute("style").match(/url\(["']?([^"')]+)["']?\)/);
      if (match && /^(?:undefined|null|)$/.test(match[1])) {
        findings.push({
          type: "bad-background",
          src: match[1],
          alt: null,
          cls: String(el.className).slice(0, 80),
          parent: "",
        });
      }
    }
    for (const slot of document.querySelectorAll(mediaSlots.join(","))) {
      const hasMedia = slot.querySelector("img, picture, video, canvas, iframe, svg, model-viewer");
      const hasBackground = [slot, ...slot.querySelectorAll("*")].some(
        (el) => getComputedStyle(el).backgroundImage !== "none"
      );
      if (!hasMedia && !hasBackground) {
        const frame = slot.closest("[class*='wp-block-']");
        findings.push({
          type: "empty-media-slot",
          src: "",
          alt: null,
          cls: String(slot.className).slice(0, 80),
          parent: "",
          html: `${slot.tagName.toLowerCase()}.${String(slot.className).split(" ")[0]} inside ${
            frame ? String(frame.className).slice(0, 80) : "page"
          } (slot ${[...document.querySelectorAll(mediaSlots.join(","))].indexOf(slot) + 1})`,
        });
      }
    }
    return findings;
  }, MEDIA_SLOTS);

const auditPage = async (browser, url, viewportName) => {
  const context = await browser.newContext(VIEWPORTS[viewportName]);
  const page = await context.newPage();
  const networkFailures = [];

  page.on("response", (response) => {
    const request = response.request();
    if (request.resourceType() === "image" && response.status() >= 400) {
      networkFailures.push({ type: `http-${response.status()}`, src: response.url() });
    }
  });
  page.on("requestfailed", (request) => {
    const aborted = request.failure()?.errorText === "net::ERR_ABORTED";
    if (request.resourceType() === "image" && !aborted) {
      networkFailures.push({
        type: "request-failed",
        src: request.url(),
        reason: request.failure()?.errorText,
      });
    }
  });

  let pageError = null;
  let findings = [];
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await scrollThrough(page);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    findings = await inspectImages(page);
  } catch (error) {
    pageError = String(error.message || error).split("\n")[0];
  } finally {
    await context.close();
  }

  const seen = new Set();
  const unique = [...networkFailures, ...findings].filter((item) => {
    const key = `${item.type}|${item.src}|${item.cls || ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return { url, viewport: viewportName, pageError, findings: unique };
};

const runPool = async (tasks, limit) => {
  const results = [];
  let index = 0;
  const worker = async () => {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
};

const run = async () => {
  const sitemapUrl = `${base}${config.sitemapPath}`;
  const toExplicitUrl = (entry) =>
    /^https?:\/\//.test(entry) ? toLocalUrl(entry) : `${base}/${entry.replace(/^\//, "")}`;
  const urls = explicitPages.length
    ? [...new Set(explicitPages.map(toExplicitUrl))]
    : [...new Set((await collectSitemapUrls(sitemapUrl)).map(toLocalUrl))]
        .filter((url) => !isExcluded(url))
        .filter((url) => !pageFilter || url.includes(pageFilter));

  log(`Base: ${base}`);
  log(`Pages: ${urls.length} | Viewports: ${viewports.join(", ")}`);

  const browser = await chromium.launch();
  const tasks = urls.flatMap((url) =>
    viewports.map((viewportName) => async () => {
      const result = await auditPage(browser, url, viewportName);
      let status = "ok   ";
      if (result.pageError) {
        status = "ERROR";
      } else if (result.findings.length) {
        status = "FAIL ";
      }
      log(`${status} [${viewportName}] ${url} (${result.findings.length})`);
      return result;
    })
  );
  const results = await runPool(tasks, concurrency);
  await browser.close();

  const failing = results.filter((result) => result.pageError || result.findings.length);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ base, generatedAt: new Date().toISOString(), results: failing }, null, 2)
  );

  log("");
  for (const result of failing) {
    log(`${result.url} [${result.viewport}]`);
    if (result.pageError) {
      log(`  PAGE ERROR: ${result.pageError}`);
    }
    for (const finding of result.findings) {
      log(
        `  ${finding.type}: ${finding.src || finding.html || "(empty)"} ${finding.cls ? `.${finding.cls}` : ""}`
      );
    }
  }

  const totalIssues = failing.reduce((sum, result) => sum + result.findings.length, 0);
  log(
    `\n${failing.length} page-views with problems, ${totalIssues} image issues. Report: ${outputPath}`
  );
  process.exit(failing.length ? 1 : 0);
};

run().catch((error) => {
  console.error(error);
  process.exit(2);
});
