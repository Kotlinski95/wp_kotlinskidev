import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ARTIFACTS_DIR = path.resolve("artifacts");
const SUITES = [
  {
    name: "stored content",
    spec: "tests/e2e/editor/content-validity.spec.ts",
    baselineFile: path.join(ARTIFACTS_DIR, "editor-validity-baseline-failing.txt"),
    keyFromTitle: (title) => title.match(/post (\d+) opens/)?.[1] ?? null,
  },
  {
    name: "block patterns",
    spec: "tests/e2e/editor/patterns-validity.spec.ts",
    baselineFile: path.join(ARTIFACTS_DIR, "editor-validity-patterns-baseline-failing.txt"),
    keyFromTitle: (title) => title.match(/(kotlinskidev\/[a-z0-9-]+) renders/)?.[1] ?? null,
  },
];

const report = (message) => process.stdout.write(`${message}\n`);

const collectSpecs = (suite, collected = []) => {
  (suite.specs ?? []).forEach((spec) => collected.push(spec));
  (suite.suites ?? []).forEach((child) => collectSpecs(child, collected));
  return collected;
};

const runSuite = ({ spec, keyFromTitle }) => {
  const result = spawnSync("npx", ["wp-scripts", "test-playwright", spec, "--reporter=json"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const json = JSON.parse(result.stdout.slice(result.stdout.indexOf("{")));
  const specs = json.suites.flatMap((suite) => collectSpecs(suite));
  const failing = [];
  let passed = 0;
  for (const entry of specs) {
    const key = keyFromTitle(entry.title);
    if (!key) {
      continue;
    }
    if (entry.ok) {
      passed += 1;
    } else {
      failing.push(key);
    }
  }
  return { passed, failing: [...new Set(failing)].sort() };
};

const readBaseline = async (file) =>
  (await readFile(file, "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();

const purgeAutoDrafts = () => {
  spawnSync("npm", ["run", "--silent", "test:e2e:purge-drafts"], { stdio: "ignore" });
};

const baseline = async () => {
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  for (const suite of SUITES) {
    const { passed, failing } = runSuite(suite);
    await writeFile(suite.baselineFile, `${failing.join("\n")}\n`);
    report(`${suite.name}: ${passed} passed, ${failing.length} failing recorded as baseline`);
  }
  purgeAutoDrafts();
};

const check = async () => {
  let regressionCount = 0;
  for (const suite of SUITES) {
    const { passed, failing } = runSuite(suite);
    const known = await readBaseline(suite.baselineFile);
    const newFailures = failing.filter((key) => !known.includes(key));
    const nowFixed = known.filter((key) => !failing.includes(key));
    regressionCount += newFailures.length;
    report(
      `${suite.name}: ${passed} passed, ${failing.length} failing (baseline ${known.length}); new failures: ${newFailures.join(", ") || "none"}; now passing: ${nowFixed.join(", ") || "none"}`
    );
  }
  purgeAutoDrafts();
  process.exitCode = regressionCount === 0 ? 0 : 1;
};

const commands = { baseline, check };
const command = process.argv[2];

if (!commands[command]) {
  process.stderr.write("Usage: node bin/editor-validity.mjs <baseline|check>\n");
  process.exit(2);
}

await commands[command]();
