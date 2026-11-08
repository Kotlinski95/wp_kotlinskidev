const fs = require("fs");
const path = require("path");

const themeDir = path.resolve(__dirname, "..");
const outFile = path.join(themeDir, "build", "build-id.php");

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `<?php return '${Date.now()}';\n`);
