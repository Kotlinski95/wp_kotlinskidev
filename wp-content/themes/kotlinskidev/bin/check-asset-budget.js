const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const themeDir = path.resolve(__dirname, "..");
const budget = JSON.parse(fs.readFileSync(path.join(__dirname, "asset-budget.json"), "utf8"));

const log = (message) => process.stdout.write(`${message}\n`);

const measure = (relativePath) => {
  const content = fs.readFileSync(path.join(themeDir, relativePath));
  return { raw: content.length, gzip: zlib.gzipSync(content).length };
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const checks = Object.entries(budget.files).map(([file, max]) => ({ file, max }));

Object.entries(budget.globs).forEach(([dir, rule]) => {
  const absoluteDir = path.join(themeDir, dir);
  if (!fs.existsSync(absoluteDir)) {
    return;
  }
  fs.readdirSync(absoluteDir)
    .filter(
      (name) => name.endsWith(rule.extension) && !(rule.exclude && name.endsWith(rule.exclude))
    )
    .forEach((name) => checks.push({ file: `${dir}/${name}`, max: rule.max }));
});

const failures = [];

checks.forEach(({ file, max }) => {
  if (!fs.existsSync(path.join(themeDir, file))) {
    failures.push(`${file}: missing (run npm run build first)`);
    return;
  }
  const { raw, gzip } = measure(file);
  const status = raw > max ? "OVER" : "ok  ";
  log(`${status} ${file}: ${formatKb(raw)} raw, ${formatKb(gzip)} gzip (budget ${formatKb(max)})`);
  if (raw > max) {
    failures.push(`${file}: ${formatKb(raw)} exceeds ${formatKb(max)}`);
  }
});

if (failures.length) {
  process.stderr.write(`\nAsset budget exceeded:\n${failures.join("\n")}\n`);
  process.stderr.write(
    "Shrink the asset or, if the growth is intended, raise its limit in bin/asset-budget.json.\n"
  );
  process.exit(1);
}

log(`\nAll ${checks.length} assets within budget.`);
