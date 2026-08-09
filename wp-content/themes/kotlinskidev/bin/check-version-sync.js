const fs = require("fs");
const path = require("path");

const themeDir = path.resolve(__dirname, "..");

const packageJson = JSON.parse(fs.readFileSync(path.join(themeDir, "package.json"), "utf8"));
const packageVersion = packageJson.version;

const styleCss = fs.readFileSync(path.join(themeDir, "style.css"), "utf8");
const match = styleCss.match(/^Version:\s*(.+)$/m);
const styleVersion = match ? match[1].trim() : null;

if (!styleVersion) {
  console.error('Could not find a "Version:" header in style.css.');
  process.exit(1);
}

if (styleVersion !== packageVersion) {
  console.error(
    `Version mismatch: style.css has "${styleVersion}", package.json has "${packageVersion}".`
  );
  console.error(
    "Bump both together when cutting a release — see .claude/skills/sync-docs/SKILL.md."
  );
  process.exit(1);
}

process.stdout.write(`Version in sync: ${packageVersion}\n`);
