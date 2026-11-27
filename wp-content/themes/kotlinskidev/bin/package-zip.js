const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const lib = require("./lib/package-lib");

const themeDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(themeDir, "../../..");
const manifestPath = path.join(repoRoot, ".github", "deploy-manifest.yml");
const dist = path.join(themeDir, "dist");
const stage = path.join(dist, ".stage");
const target = path.join(dist, lib.ZIP_ROOT);
const zipPath = path.join(dist, `${lib.ZIP_ROOT}.zip`);
const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const tagIndex = args.indexOf("--tag");
const tag = tagIndex === -1 ? "" : args[tagIndex + 1] || "";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function run(command, commandArgs, cwd = themeDir) {
  return execFileSync(command, commandArgs, { cwd, stdio: "inherit" });
}

function capture(command, commandArgs, cwd = themeDir) {
  return execFileSync(command, commandArgs, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const styleVersion = lib.readStyleVersion(
  fs.readFileSync(path.join(themeDir, "style.css"), "utf8")
);
const packageVersion = JSON.parse(
  fs.readFileSync(path.join(themeDir, "package.json"), "utf8")
).version;
const versionProblems = lib.checkVersions({ styleVersion, packageVersion, tag });
if (versionProblems.length > 0) {
  fail(versionProblems.join("\n"));
}

if (!skipBuild) {
  run("npm", ["run", "build"]);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const file of ["composer.json", "composer.lock"]) {
  fs.copyFileSync(path.join(themeDir, file), path.join(stage, file));
}
run(
  "composer",
  ["install", "--no-dev", "-o", "--prefer-dist", "--no-interaction", "--quiet"],
  stage
);

const manifest = lib.parseManifest(fs.readFileSync(manifestPath, "utf8"));
const excludeFile = path.join(stage, "rsync-excludes.txt");
fs.writeFileSync(excludeFile, `${lib.themeRelativeExcludes(manifest).join("\n")}\n`);

fs.mkdirSync(target, { recursive: true });
run("rsync", ["-a", `--exclude-from=${excludeFile}`, "./", `${target}/`]);
run("rsync", ["-a", `${path.join(stage, "vendor")}/`, `${path.join(target, "vendor")}/`]);
fs.rmSync(stage, { recursive: true, force: true });

run("zip", ["-qrX", `${lib.ZIP_ROOT}.zip`, lib.ZIP_ROOT], dist);
fs.rmSync(target, { recursive: true, force: true });

const listing = lib.parseListing(capture("unzip", ["-Z1", zipPath]));
const problems = [
  ...lib.findMissingRequired(listing).map((entry) => `Missing in zip: ${entry}`),
  ...lib.findForbiddenEntries(listing).map((entry) => `Forbidden in zip: ${entry}`),
  ...lib.findWrongRoot(listing).map((entry) => `Outside ${lib.ZIP_ROOT}/ root: ${entry}`),
];

const zipStyle = capture("unzip", ["-p", zipPath, `${lib.ZIP_ROOT}/style.css`]);
if (lib.readStyleVersion(zipStyle) !== styleVersion) {
  problems.push("style.css Version inside the zip does not match the source");
}

if (problems.length > 0) {
  fail(problems.slice(0, 20).join("\n"));
}

const digest = crypto.createHash("sha256").update(fs.readFileSync(zipPath)).digest("hex");
fs.writeFileSync(`${zipPath}.sha256`, `${digest}  ${lib.ZIP_ROOT}.zip\n`);

process.stdout.write(`\nPackage ready: ${zipPath}\n`);
process.stdout.write(
  `Version ${styleVersion}, ${(fs.statSync(zipPath).size / 1024).toFixed(0)} KB, ${listing.length} entries\n`
);
process.stdout.write(`sha256 ${digest}\n`);
