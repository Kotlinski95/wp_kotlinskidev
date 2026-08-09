const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const themeDir = path.resolve(__dirname, "..");
const wpRoot = path.resolve(themeDir, "..", "..", "..");
const pluginDir = path.join(wpRoot, "wp-content", "plugins", "wordpress-pwa-manager");

function commandExists(bin) {
  try {
    execFileSync("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

for (const bin of ["wp", "msgmerge", "msgfmt", "msgattrib"]) {
  if (!commandExists(bin)) {
    process.stderr.write(`Missing required tool: ${bin}\n`);
    process.stderr.write(
      "Install WP-CLI (https://wp-cli.org) and gettext (brew install gettext / apt-get install gettext) first.\n"
    );
    process.exit(1);
  }
}

let overallFail = false;

function extractMsgids(poText, prefix) {
  return poText
    .split("\n")
    .filter((line) => line.startsWith('msgid "') && line !== 'msgid ""')
    .map((line) => `    ${prefix}${line.slice("msgid ".length)}`);
}

function checkCatalog(name, sourceDir, domain, languagesDir) {
  const tmpPot = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "i18n-check-")), "catalog.pot");

  try {
    execFileSync(
      "wp",
      [
        "i18n",
        "make-pot",
        path.join(wpRoot, sourceDir),
        tmpPot,
        `--domain=${domain}`,
        `--path=${wpRoot}`,
        "--quiet",
      ],
      { stdio: "ignore" }
    );
  } catch {
    process.stdout.write(`[${name}] wp i18n make-pot failed — skipping\n`);
    overallFail = true;
    return;
  }

  if (!fs.existsSync(languagesDir)) {
    return;
  }

  const poFiles = fs.readdirSync(languagesDir).filter((file) => file.endsWith(".po"));

  for (const poFile of poFiles) {
    const po = path.join(languagesDir, poFile);
    const tmpMerged = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "i18n-check-")), "merged.po");

    try {
      execFileSync("msgmerge", ["-q", "-o", tmpMerged, po, tmpPot], { stdio: "ignore" });
    } catch {
      process.stdout.write(`[${name}] ${poFile}: msgmerge failed\n`);
      overallFail = true;
      continue;
    }

    const msgfmtResult = spawnSync("msgfmt", ["--statistics", "-o", os.devNull, tmpMerged], {
      encoding: "utf8",
    });
    const stats = (msgfmtResult.stderr || "").trim();

    const untranslatedMatch = stats.match(/(\d+) untranslated/);
    const fuzzyMatch = stats.match(/(\d+) fuzzy/);
    const untranslated = untranslatedMatch ? Number(untranslatedMatch[1]) : 0;
    const fuzzy = fuzzyMatch ? Number(fuzzyMatch[1]) : 0;

    if (untranslated > 0 || fuzzy > 0) {
      overallFail = true;
      process.stdout.write(`[${name}] ${poFile}: ${stats.trim()}\n`);

      const untranslatedPo = execFileSync(
        "msgattrib",
        ["--untranslated", "--no-obsolete", "--no-wrap", tmpMerged],
        { stdio: ["ignore", "pipe", "ignore"] }
      ).toString();
      const fuzzyPo = execFileSync(
        "msgattrib",
        ["--only-fuzzy", "--no-obsolete", "--no-wrap", tmpMerged],
        { stdio: ["ignore", "pipe", "ignore"] }
      ).toString();

      for (const line of extractMsgids(untranslatedPo, "missing: ")) {
        process.stdout.write(`${line}\n`);
      }
      for (const line of extractMsgids(fuzzyPo, "fuzzy:   ")) {
        process.stdout.write(`${line}\n`);
      }
    } else {
      process.stdout.write(`[${name}] ${poFile}: OK (${stats.trim()})\n`);
    }
  }
}

checkCatalog(
  "theme",
  "wp-content/themes/kotlinskidev",
  "kotlinskidev",
  path.join(themeDir, "languages")
);

if (fs.existsSync(pluginDir)) {
  checkCatalog(
    "wordpress-pwa-manager",
    "wp-content/plugins/wordpress-pwa-manager",
    "wordpress-pwa-manager",
    path.join(pluginDir, "languages")
  );
}

if (overallFail) {
  process.stdout.write(
    "\ni18n check failed: untranslated or fuzzy strings found. Translate them and re-run 'wp i18n make-mo/make-php/make-json' for the affected catalog.\n"
  );
  process.exit(1);
}

process.stdout.write("\ni18n check passed: no untranslated or fuzzy strings.\n");
