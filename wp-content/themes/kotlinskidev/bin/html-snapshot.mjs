import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_DIR = path.resolve("artifacts/clean-code-baseline");
const URL_LIST_FILE = path.resolve("bin/html-snapshot-urls.txt");

const replaceInnerValue =
  (placeholder) =>
  (...match) => {
    const { before, after } = match.at(-1);
    return `${before}${placeholder}${after ?? ""}`;
  };

const VOLATILE_VALUES = [
  {
    pattern: /<a\b(?=[^>]*kt-popular-pages__link)[^>]*>[\s\S]*?<\/a>/g,
    replace: () => '<a class="kt-popular-pages__link"></a>',
  },
  {
    pattern: /(?<before><script\b[^>]*>)[\s\S]*?(?<after><\/script[^>]*>)/gi,
    replace: replaceInnerValue("INLINE_SCRIPT"),
  },
  {
    pattern: /(?<before><style\b[^>]*>)[\s\S]*?(?<after><\/style[^>]*>)/gi,
    replace: replaceInnerValue("INLINE_STYLE"),
  },
  {
    pattern: /(?<before>[?&](?:v|ver)=)[^"'&\s]+/g,
    replace: replaceInnerValue("VERSION"),
  },
  {
    pattern: /(?<before>)(?<![0-9a-f])[0-9a-f]{13}(?![0-9a-f])/g,
    replace: replaceInnerValue("UNIQID"),
  },
  {
    pattern: /(?<before>data-original-content=")[^"]*(?<after>")/g,
    replace: replaceInnerValue("ENCRYPTED"),
  },
  {
    pattern: /(?<before>nonce["']?\s*[:=]\s*["'])[0-9a-f]{10}(?<after>["'])/gi,
    replace: replaceInnerValue("NONCE"),
  },
  {
    pattern: /(?<before>_wpnonce=)[0-9a-f]{10}/g,
    replace: replaceInnerValue("NONCE"),
  },
  {
    pattern: /(?<before>name="[^"]*nonce[^"]*"\s+value=")[0-9a-f]{10}(?<after>")/gi,
    replace: replaceInnerValue("NONCE"),
  },
];

const normalizeHtml = (html) =>
  VOLATILE_VALUES.reduce((text, { pattern, replace }) => text.replace(pattern, replace), html);

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
    : {
        expected: expectedLines[index]?.trim().slice(0, 300),
        actual: actualLines[index]?.trim().slice(0, 300),
      };
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
    const expected = normalizeHtml(
      await readFile(path.join(SNAPSHOT_DIR, snapshotFileName(url, position)), "utf8")
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
