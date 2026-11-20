import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const SNAPSHOT_DIR = path.resolve("artifacts/dom-baseline");
const URL_LIST_FILE = path.resolve("bin/dom-snapshot-urls.txt");
const SETTLE_MS = 1500;
const SCROLL_STEP_COUNT = 6;

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false },
  mobile: { ...devices["iPhone 13"] },
};

const TIMING_DEPENDENT_CLASS_TOKENS = new Set([
  "visible",
  "has-transparent-shade-background-color",
]);

const MASKED_STYLE_PROPERTIES =
  /(font-size|transition[a-z-]*|cursor|transform|translate|rotate|scale|opacity|will-change|--kt-glow-[xy]|--kt-parallax[a-z-]*|visibility|filter|clip-path|top|left|width|height|min-height|max-height|margin-[a-z]+|padding-[a-z]+|background-position[a-z-]*|--[a-z0-9-]*(?:progress|offset|scroll|mouse|pointer|x|y|w|h)[a-z0-9-]*)\s*:[^;"]*;?/gi;

const VOLATILE_PATTERNS = [
  [/(?<![0-9a-f])[0-9a-f]{13}(?![0-9a-f])/g, "UNIQID"],
  [/(?<before>[?&](?:v|ver)=)[^"'&\s]+/g, "$<before>VERSION"],
  [/(?<before>data-original-content=")[^"]*(?<after>")/g, "$<before>ENCRYPTED$<after>"],
  [
    /(?<before>name="[^"]*nonce[^"]*"\s+value=")[0-9a-f]{10}(?<after>")/gi,
    "$<before>NONCE$<after>",
  ],
  [/(?<before>nonce["']?\s*[:=]\s*["'])[0-9a-f]{10}(?<after>["'])/gi, "$<before>NONCE$<after>"],
  [
    /\sstyle="([^"]*)"/g,
    (_match, style) => {
      const kept = style
        .replace(MASKED_STYLE_PROPERTIES, "")
        .split(";")
        .map((declaration) =>
          declaration
            .replace(/\s*:\s*/, ":")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(Boolean)
        .sort()
        .join(";");
      return kept ? ` style="${kept}"` : "";
    },
  ],
  [/\saria-label="\d+ \/ \d+"/g, ' aria-label="N / M"'],
  [
    /\sswiper-slide-(?:active|prev|next|duplicate-active|duplicate-prev|duplicate-next|visible|fully-visible)\b/g,
    "",
  ],
  [
    /\s(?:data-kt-[a-z-]*(?:ticks?|frame|time|ms|raf|id)|aria-valuenow|data-swiper-[a-z-]*|data-gsap[a-z-]*)="[^"]*"/g,
    "",
  ],
  [/\s(?:data-wp-context|data-wp-key)="[^"]*"/g, ""],
  [/swiper-wrapper-[0-9a-f]+/g, "swiper-wrapper-ID"],
  [/cf-chl-widget-[a-z0-9]+/g, "cf-chl-widget-ID"],
  [
    /\sclass="([^"]*)"/g,
    (_match, classes) =>
      ` class="${classes
        .split(/\s+/)
        .filter((token) => token && !TIMING_DEPENDENT_CLASS_TOKENS.has(token))
        .sort()
        .join(" ")}"`,
  ],
];

const normalizeDom = (html) =>
  VOLATILE_PATTERNS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    html
  );

const report = (message) => process.stdout.write(`${message}\n`);

const snapshotFileName = (url, position, viewportName) => {
  const parsed = new URL(url);
  const slug =
    parsed.pathname
      .concat(parsed.search)
      .replace(/[^a-z0-9-]+/gi, "_")
      .replace(/^_+|_+$/g, "") || "root";
  return `${String(position + 1).padStart(2, "0")}-${viewportName}-${slug}.html`;
};

const readUrlList = async () =>
  (await readFile(URL_LIST_FILE, "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const scrollThroughPage = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let step = 1; step <= SCROLL_STEP_COUNT; step += 1) {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      Math.round((height * step) / SCROLL_STEP_COUNT)
    );
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(SETTLE_MS);
};

const capturePage = async (browser, url, viewportName) => {
  const context = await browser.newContext({
    ...VIEWPORTS[viewportName],
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`console: ${message.text()}`);
    }
  });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(SETTLE_MS);
  await scrollThroughPage(page);
  const bodyHtml = await page.evaluate(() => document.documentElement.outerHTML);
  await context.close();
  const stableErrors = consoleErrors
    .filter(
      (line) =>
        !/favicon|ERR_|Failed to load resource|net::|manifest|beacon|googletagmanager|facebook/i.test(
          line
        )
    )
    .sort();
  const withoutScripts = bodyHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, "<script></script>")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "<style></style>");
  return `${normalizeDom(withoutScripts)}\n<!--ERRORS\n${stableErrors.join("\n")}\n-->\n`;
};

const forEachCapture = async (urls, handler) => {
  const browser = await chromium.launch();
  try {
    for (const [position, url] of urls.entries()) {
      for (const viewportName of Object.keys(VIEWPORTS)) {
        const html = await capturePage(browser, url, viewportName);
        await handler({ url, position, viewportName, html });
      }
    }
  } finally {
    await browser.close();
  }
};

const firstDifference = (expected, actual) => {
  const expectedParts = expected.split(">");
  const actualParts = actual.split(">");
  const index = expectedParts.findIndex((part, position) => part !== actualParts[position]);
  return index === -1
    ? null
    : {
        expected: expectedParts[index]?.trim().slice(0, 260),
        actual: actualParts[index]?.trim().slice(0, 260),
      };
};

const capture = async (urls) => {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await forEachCapture(urls, async ({ url, position, viewportName, html }) => {
    await writeFile(path.join(SNAPSHOT_DIR, snapshotFileName(url, position, viewportName)), html);
    report(`captured ${viewportName.padEnd(7)} ${url}`);
  });
};

const compare = async (urls) => {
  let changedCount = 0;
  await forEachCapture(urls, async ({ url, position, viewportName, html }) => {
    const expected = normalizeDom(
      await readFile(path.join(SNAPSHOT_DIR, snapshotFileName(url, position, viewportName)), "utf8")
    );
    const difference = expected === html ? null : firstDifference(expected, html);
    if (!difference) {
      report(`same     ${viewportName.padEnd(7)} ${url}`);
      return;
    }
    changedCount += 1;
    report(
      `CHANGED  ${viewportName.padEnd(7)} ${url}\n  expected: ${difference.expected}\n  actual:   ${difference.actual}`
    );
  });
  process.exitCode = changedCount === 0 ? 0 : 1;
};

const command = process.argv[2];
const commands = { capture, compare };

if (!commands[command]) {
  process.stderr.write("Usage: node bin/dom-snapshot.mjs <capture|compare>\n");
  process.exit(2);
}

await commands[command](await readUrlList());
