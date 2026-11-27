const fs = require("fs");
const path = require("path");
const { extractReleaseNotes } = require("./lib/package-lib");

const version = (process.argv[2] || "").replace(/^v/, "");

try {
  const changelog = fs.readFileSync(path.resolve(__dirname, "..", "CHANGELOG.md"), "utf8");
  process.stdout.write(`${extractReleaseNotes(changelog, version)}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
