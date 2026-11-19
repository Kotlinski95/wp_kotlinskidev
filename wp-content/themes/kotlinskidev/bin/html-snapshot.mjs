import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_DIR = path.resolve("artifacts/clean-code-baseline");
const URL_LIST_FILE = path.resolve("bin/html-snapshot-urls.txt");

const VOLATILE_PATTERNS = [
  [/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, "$1INLINE_SCRIPT$2"],
  [/(<style\b[^>]*>)[\s\S]*?(<\/style>)/gi, "$1INLINE_STYLE$2"],
  [/([?&](?:v|ver)=)[^"'&\s]+/g, "$1VERSION"],
  [/(?<![0-9a-f])[0-9a-f]{13}(?![0-9a-f])/g, "UNIQID"],
  [/(data-original-content=")[^"]*(")/g, "$1ENCRYPTED$2"],
  [/(nonce["']?\s*[:=]\s*["'])[0-9a-f]{10}(["'])/gi, "$1NONCE$2"],
  [/(_wpnonce=)[0-9a-f]{10}/g, "$1NONCE"],
];

const normalizeHtml = (html) =>
  VOLATILE_PATTERNS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    html
  );

const snapshotFileName = (url, position) => {
  const slug =
    new URL(url).pathname
      .concat(new URL(url).search)
      .replace(/[^a-z0-9-]+/gi, "_")
      .replace(/^_+|_+$/g, "") || "root";
  return `${String(position + 1).padStart(2, "0")}-${slug}.html`;
};

const report = (message) => process.stdout.write(`${message}\n`);

const readUrlList = async () =>
  (await readFile(URL_LIST_FILE, "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const fetchNormalizedHtml = async (url) =>
  normalizeHtml(await (await fetch(url, { redirect: "follow" })).text());

const firstDifference = (expected, actual) => {
  const expectedLines = expected.split(">");
  const actualLines = actual.split(">");
  const index = expectedLines.findIndex((line, position) => line !== actualLines[position]);
  return index === -1
    ? null
    : { expected: expectedLines[index]?.slice(0, 200), actual: actualLines[index]?.slice(0, 200) };
};

const capture = async (urls) => {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  for (const [position, url] of urls.entries()) {
    const html = await fetchNormalizedHtml(url);
    await writeFile(path.join(SNAPSHOT_DIR, snapshotFileName(url, position)), html);
    report(`captured ${url}`);
  }
};

const compare = async (urls) => {
  let changedCount = 0;
  for (const [position, url] of urls.entries()) {
    const expected = await readFile(
      path.join(SNAPSHOT_DIR, snapshotFileName(url, position)),
      "utf8"
    );
    const actual = await fetchNormalizedHtml(url);
    const difference = expected === actual ? null : firstDifference(expected, actual);
    if (!difference) {
      report(`same     ${url}`);
      continue;
    }
    changedCount += 1;
    report(`CHANGED  ${url}\n  expected: ${difference.expected}\n  actual:   ${difference.actual}`);
  }
  process.exitCode = changedCount === 0 ? 0 : 1;
};

const command = process.argv[2];
const commands = { capture, compare };

if (!commands[command]) {
  console.error("Usage: node bin/html-snapshot.mjs <capture|compare>");
  process.exit(2);
}

await commands[command](await readUrlList());
