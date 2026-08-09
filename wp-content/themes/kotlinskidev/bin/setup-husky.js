const { execFileSync } = require("child_process");
const path = require("path");

const themeDir = path.resolve(__dirname, "..");

let gitRoot = "";
try {
  gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: themeDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  gitRoot = "";
}

if (!gitRoot) {
  process.stdout.write("setup-husky: not inside a git repository, skipping hook setup\n");
  process.exit(0);
}

const relativeHuskyDir = path.join(path.relative(gitRoot, themeDir), ".husky");
const huskyBin = path.join(themeDir, "node_modules", ".bin", "husky");

execFileSync(huskyBin, [relativeHuskyDir], { cwd: gitRoot, stdio: "inherit" });
