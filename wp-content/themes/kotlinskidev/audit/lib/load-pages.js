const fs = require("fs");
const path = require("path");

const generatedPath = path.join(__dirname, "..", "results", "urls.generated.json");

function loadPages() {
  if (!fs.existsSync(generatedPath)) {
    throw new Error(
      "audit/results/urls.generated.json not found — run `npm run audit:discover` first."
    );
  }
  return JSON.parse(fs.readFileSync(generatedPath, "utf8"));
}

module.exports = { loadPages };
