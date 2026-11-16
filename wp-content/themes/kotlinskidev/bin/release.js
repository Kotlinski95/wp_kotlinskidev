const fs = require("fs");
const path = require("path");
const lib = require("./lib/release-lib");

const themeDir = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const flags = {
  major: args.has("--major"),
  minor: args.has("--minor"),
  patch: args.has("--patch"),
};
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const files = {
  changelog: path.join(themeDir, "CHANGELOG.md"),
  style: path.join(themeDir, "style.css"),
  pkg: path.join(themeDir, "package.json"),
  lock: path.join(themeDir, "package-lock.json"),
};

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const changelog = fs.readFileSync(files.changelog, "utf8");
const styleCss = fs.readFileSync(files.style, "utf8");
const pkgSource = fs.readFileSync(files.pkg, "utf8");
const lockSource = fs.readFileSync(files.lock, "utf8");

const parsed = lib.parseUnreleased(changelog);
if (!parsed) {
  fail("No [Unreleased] heading found in CHANGELOG.md.");
}
if (parsed.entryCount === 0 && !force) {
  fail("[Unreleased] is empty. Add a changelog entry first, or pass --force.");
}

const styleVersion = lib.readStyleVersion(styleCss);
if (!styleVersion) {
  fail('Could not find a "Version:" header in style.css.');
}
const packageVersion = JSON.parse(pkgSource).version;
const baseVersion = lib.highestVersion(styleVersion, packageVersion);
const bump = lib.decideBump(parsed, flags);
const nextVersion = lib.bumpVersion(baseVersion, bump);
const today = new Date().toISOString().slice(0, 10);

process.stdout.write(
  `Base ${baseVersion} (style.css ${styleVersion}, package.json ${packageVersion}) -> ${nextVersion} [${bump}], ${parsed.entryCount} unreleased entries, ${today}\n`
);

if (dryRun) {
  process.stdout.write("Dry run: no files written.\n");
  process.exit(0);
}

const nextChangelog = lib.rewriteChangelog(changelog, nextVersion, today);
const nextStyle = lib.replaceStyleVersion(styleCss, nextVersion);
const nextPkg = lib.replaceJsonVersions(pkgSource, nextVersion, false);
const nextLock = lib.replaceJsonVersions(lockSource, nextVersion, true);

fs.writeFileSync(files.changelog, nextChangelog);
fs.writeFileSync(files.style, nextStyle);
fs.writeFileSync(files.pkg, nextPkg);
fs.writeFileSync(files.lock, nextLock);

process.stdout.write(`Released ${nextVersion}. Review the diff, then commit.\n`);
