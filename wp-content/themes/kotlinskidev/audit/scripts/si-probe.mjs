import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.join(here, "..", "results", "si-probe");

const args = process.argv.slice(2);
const url = args.find((arg) => /^https?:\/\//.test(arg));
const runs = Number(flagValue("--runs") ?? 3);
const blocked = flagValue("--blocked-url-patterns");
const locale = flagValue("--locale") ?? "pl-PL";

function flagValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

if (!url) {
  console.error(
    "usage: node audit/scripts/si-probe.mjs <url> [--runs 3] [--blocked-url-patterns a,b] [--locale pl-PL]"
  );
  process.exit(1);
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const fetchHtmlSize = async () => {
  const response = await fetch(url, {
    headers: { "accept-language": locale, "accept-encoding": "identity" },
  });
  const body = Buffer.from(await response.arrayBuffer());
  return {
    rawKB: +(body.length / 1024).toFixed(1),
    brotliKB: +(zlib.brotliCompressSync(body).length / 1024).toFixed(1),
  };
};

const styleLayoutMs = (lhr) => {
  const detail = lhr.audits["mainthread-work-breakdown"]?.details?.items ?? [];
  const entry = detail.find((item) => item.group === "styleLayout");
  return entry ? Math.round(entry.duration) : null;
};

const decodeThumbnails = (lhr) =>
  (lhr.audits["screenshot-thumbnails"]?.details?.items ?? []).map((item) => ({
    timing: item.timing,
    data: item.data.replace(/^data:image\/jpeg;base64,/, ""),
  }));

const writeContactSheet = async (frames, outFile) => {
  if (frames.length === 0) {
    return null;
  }
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 800 } });
  const cells = frames
    .map(
      (frame) =>
        `<figure><img src="data:image/jpeg;base64,${frame.data}"><figcaption>${frame.timing} ms</figcaption></figure>`
    )
    .join("");
  await page.setContent(
    `<style>body{margin:0;background:#222;color:#fff;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:6px;padding:6px}figure{margin:0;width:150px}img{width:150px;display:block}</style>${cells}`
  );
  await page.screenshot({ path: outFile, fullPage: true });
  await browser.close();
  return outFile;
};

const lighthouseBin = path.join(here, "..", "..", "node_modules", ".bin", "lighthouse");

const runOnce = () => {
  const cliArgs = [
    url,
    "--output=json",
    "--quiet",
    "--form-factor=mobile",
    "--throttling-method=devtools",
    "--only-categories=performance",
    "--locale=en-US",
    `--extra-headers=${JSON.stringify({ "Accept-Language": locale })}`,
    "--chrome-flags=--headless=new --no-sandbox --ignore-certificate-errors",
  ];
  if (blocked) {
    blocked.split(",").forEach((pattern) => cliArgs.push(`--blocked-url-patterns=${pattern}`));
  }
  const output = execFileSync(lighthouseBin, cliArgs, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(output);
};

fs.mkdirSync(resultsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const host = new URL(url).hostname;

const samples = [];
for (let index = 0; index < runs; index += 1) {
  const lhr = runOnce();
  samples.push({
    si: lhr.audits["speed-index"].numericValue,
    lcp: lhr.audits["largest-contentful-paint"].numericValue,
    cls: lhr.audits["cumulative-layout-shift"].numericValue,
    styleLayout: styleLayoutMs(lhr),
    frames: decodeThumbnails(lhr),
  });
}

samples.sort((a, b) => a.si - b.si);
const medianSample = samples[Math.floor(samples.length / 2)];
const sheet = await writeContactSheet(
  medianSample.frames,
  path.join(resultsDir, `${host}-${stamp}-filmstrip.png`)
);
const html = await fetchHtmlSize();

const summary = {
  url,
  runs,
  throttling: "devtools",
  blockedUrlPatterns: blocked ?? null,
  siMs: Math.round(median(samples.map((s) => s.si))),
  lcpMs: Math.round(median(samples.map((s) => s.lcp))),
  cls: +median(samples.map((s) => s.cls)).toFixed(4),
  styleLayoutMs: median(samples.map((s) => s.styleLayout ?? 0)),
  html,
  filmstrip: sheet,
};

fs.writeFileSync(path.join(resultsDir, `${host}-${stamp}.json`), JSON.stringify(summary, null, 2));
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
