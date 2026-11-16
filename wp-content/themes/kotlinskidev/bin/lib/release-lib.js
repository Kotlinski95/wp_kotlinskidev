const UNRELEASED_HEADING = "## [Unreleased]";
const EMPTY_MARKER = "*Nothing yet.*";

function findUnreleasedRange(changelog) {
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim() === UNRELEASED_HEADING);
  if (start === -1) {
    return null;
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^## \[/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { lines, start, end };
}

function parseUnreleased(changelog) {
  const range = findUnreleasedRange(changelog);
  if (!range) {
    return null;
  }
  const categories = {};
  let current = null;
  for (const line of range.lines.slice(range.start + 1, range.end)) {
    const heading = line.match(/^### (.+?)\s*$/);
    if (heading) {
      current = heading[1];
      categories[current] = categories[current] || [];
    } else if (current && /^- \S/.test(line)) {
      categories[current].push(line);
    }
  }
  const entryCount = Object.values(categories).reduce((sum, list) => sum + list.length, 0);
  return { categories, entryCount };
}

function decideBump(parsed, flags = {}) {
  if (flags.major) {
    return "major";
  }
  if (flags.minor) {
    return "minor";
  }
  if (flags.patch) {
    return "patch";
  }
  if (parsed && parsed.categories.Added && parsed.categories.Added.length > 0) {
    return "minor";
  }
  return "patch";
}

const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function parseSemverFull(version) {
  const match = SEMVER_PATTERN.exec(String(version).trim());
  if (!match) {
    throw new Error(`Invalid semver: "${version}"`);
  }
  return { core: match.slice(1, 4).map(Number), prerelease: match[4] || null };
}

function parseSemver(version) {
  return parseSemverFull(version).core;
}

function comparePrerelease(a, b) {
  if (a === b) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  const left = a.split(".");
  const right = b.split(".");
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i] === undefined) {
      return -1;
    }
    if (right[i] === undefined) {
      return 1;
    }
    const leftNumeric = /^\d+$/.test(left[i]);
    const rightNumeric = /^\d+$/.test(right[i]);
    if (leftNumeric && rightNumeric && Number(left[i]) !== Number(right[i])) {
      return Number(left[i]) - Number(right[i]);
    }
    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }
    if (!leftNumeric && left[i] !== right[i]) {
      return left[i] < right[i] ? -1 : 1;
    }
  }
  return 0;
}

function compareSemver(a, b) {
  const left = parseSemverFull(a);
  const right = parseSemverFull(b);
  for (let i = 0; i < 3; i += 1) {
    if (left.core[i] !== right.core[i]) {
      return left.core[i] - right.core[i];
    }
  }
  return comparePrerelease(left.prerelease, right.prerelease);
}

function highestVersion(a, b) {
  return compareSemver(a, b) >= 0 ? a : b;
}

const BUMPS = {
  major: ([major]) => [major + 1, 0, 0],
  minor: ([major, minor]) => [major, minor + 1, 0],
  patch: ([major, minor, patch]) => [major, minor, patch + 1],
};

function bumpVersion(version, bump) {
  const apply = BUMPS[bump];
  if (!apply) {
    throw new Error(`Unknown bump: "${bump}"`);
  }
  const { core, prerelease } = parseSemverFull(version);
  return (prerelease ? core : apply(core)).join(".");
}

function rewriteChangelog(changelog, version, date) {
  const range = findUnreleasedRange(changelog);
  if (!range) {
    throw new Error("No [Unreleased] heading found in CHANGELOG.md.");
  }
  const lines = range.lines.slice();
  lines[range.start] = `## [${version}] — ${date}`;
  lines.splice(range.start, 0, UNRELEASED_HEADING, "", EMPTY_MARKER, "");
  return lines.join("\n");
}

function replaceStyleVersion(styleCss, version) {
  if (!/^Version:\s*.+$/m.test(styleCss)) {
    throw new Error('No "Version:" header found in style.css.');
  }
  return styleCss.replace(/^(Version:\s*).+$/m, `$1${version}`);
}

function readStyleVersion(styleCss) {
  const match = styleCss.match(/^Version:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function replaceJsonVersions(source, version, isLock) {
  const data = JSON.parse(source);
  const topLevel = /^([ \t]{1,8}"version":\s*")[^"]*(")/m;
  if (typeof data.version !== "string" || !topLevel.test(source)) {
    throw new Error('No top-level "version" field found.');
  }
  let next = source.replace(topLevel, `$1${version}$2`);
  if (isLock && data.packages && data.packages[""]) {
    const rootPackage = /("packages":\s*\{\s*"":\s*\{[^}]*?"version":\s*")[^"]*(")/;
    if (!rootPackage.test(next)) {
      throw new Error('No packages[""].version field found.');
    }
    next = next.replace(rootPackage, `$1${version}$2`);
  }
  const parsed = JSON.parse(next);
  if (parsed.version !== version) {
    throw new Error("Version rewrite verification failed.");
  }
  return next;
}

module.exports = {
  parseUnreleased,
  decideBump,
  parseSemver,
  compareSemver,
  highestVersion,
  bumpVersion,
  rewriteChangelog,
  replaceStyleVersion,
  readStyleVersion,
  replaceJsonVersions,
};
