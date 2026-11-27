const THEME_PREFIX = "/wp-content/themes/kotlinskidev";
const ZIP_ROOT = "kotlinskidev";
const REQUIRED_FILES = [
  "style.css",
  "theme.json",
  "functions.php",
  "build/",
  "vendor/autoload.php",
];
const EXTRA_EXCLUDES = [
  "/dist/",
  "/assets/videos/",
  "/storybook-static/",
  "/playwright-report/",
  "/test-results/",
  "/src/*.ts",
  "/src/*.tsx",
  "/src/*.scss",
  "/src/*.md",
];
const FORBIDDEN_PATTERNS = [
  /(^|\/)node_modules\//,
  /(^|\/)\.git(\/|$)/,
  /^[^/]+\/(tests|docs|bin|audit|artifacts|coverage|dist)\//,
  /^[^/]+\/vendor\/(pestphp|phpunit|brain|mockery|squizlabs|wp-coding-standards|wp-phpunit)\//,
  /\.map$/,
  /^[^/]+\/src\/.*\.(tsx?|scss)$/,
  /(^|\/)\.env($|\.)/,
];

function parseManifest(text) {
  const manifest = { include: [], exclude: [] };
  let section = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const heading = line.match(/^(include|exclude):$/);
    if (heading) {
      section = heading[1];
      continue;
    }
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && section) {
      manifest[section].push(item[1].replace(/^(["'])(.*)\1$/, "$2"));
    }
  }
  return manifest;
}

function themeRelativeExcludes(manifest) {
  const themeRooted = manifest.exclude
    .filter((pattern) => pattern.startsWith(`${THEME_PREFIX}/`))
    .map((pattern) => pattern.slice(THEME_PREFIX.length));
  const generic = manifest.exclude.filter((pattern) => !pattern.startsWith("/"));
  return [...generic, ...themeRooted, ...EXTRA_EXCLUDES];
}

function parseListing(output) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findMissingRequired(listing) {
  return REQUIRED_FILES.filter((required) => {
    const expected = `${ZIP_ROOT}/${required}`;
    return required.endsWith("/")
      ? !listing.some((entry) => entry.startsWith(expected))
      : !listing.includes(expected);
  });
}

function findForbiddenEntries(listing) {
  return listing.filter((entry) => FORBIDDEN_PATTERNS.some((pattern) => pattern.test(entry)));
}

function findWrongRoot(listing) {
  return listing.filter((entry) => !entry.startsWith(`${ZIP_ROOT}/`) && entry !== `${ZIP_ROOT}/`);
}

function readStyleVersion(styleCss) {
  const match = styleCss.match(/^Version:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function checkVersions({ styleVersion, packageVersion, tag }) {
  const problems = [];
  if (!styleVersion) {
    problems.push("style.css has no Version header");
  } else if (styleVersion !== packageVersion) {
    problems.push(`style.css ${styleVersion} differs from package.json ${packageVersion}`);
  }
  if (tag && tag.replace(/^v/, "") !== styleVersion) {
    problems.push(`tag ${tag} differs from style.css ${styleVersion}`);
  }
  return problems;
}

function extractReleaseNotes(changelog, version) {
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Not a release version: ${version}`);
  }
  const lines = changelog.split("\n");
  const marker = `## [${version}]`;
  const start = lines.findIndex((line) => line.startsWith(marker));
  if (start === -1) {
    throw new Error(`CHANGELOG.md has no section for ${version}`);
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## ["));
  const body = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
  if (body === "") {
    throw new Error(`CHANGELOG.md section for ${version} is empty`);
  }
  return body;
}

module.exports = {
  ZIP_ROOT,
  REQUIRED_FILES,
  parseManifest,
  themeRelativeExcludes,
  parseListing,
  findMissingRequired,
  findForbiddenEntries,
  findWrongRoot,
  readStyleVersion,
  checkVersions,
  extractReleaseNotes,
};
