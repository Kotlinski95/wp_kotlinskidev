const lib = require("./package-lib");

const manifestText = [
  "include:",
  "  - wp-content/themes/kotlinskidev/",
  "",
  "exclude:",
  "  - node_modules/",
  '  - "._*"',
  '  - "/wp-content/themes/kotlinskidev/docs/"',
  '  - "/wp-content/plugins/other/src/"',
  "  - tests/",
].join("\n");

describe("parseManifest", () => {
  it("reads include and exclude lists and strips quotes", () => {
    const manifest = lib.parseManifest(manifestText);
    expect(manifest.include).toEqual(["wp-content/themes/kotlinskidev/"]);
    expect(manifest.exclude).toContain("._*");
    expect(manifest.exclude).toHaveLength(5);
  });
});

describe("themeRelativeExcludes", () => {
  it("rebases theme paths, drops plugin paths and keeps generic patterns", () => {
    const excludes = lib.themeRelativeExcludes(lib.parseManifest(manifestText));
    expect(excludes).toContain("/docs/");
    expect(excludes).toContain("node_modules/");
    expect(excludes).toContain("tests/");
    expect(excludes).toContain("/dist/");
    expect(excludes.some((pattern) => pattern.includes("plugins"))).toBe(false);
  });
});

describe("zip listing checks", () => {
  const good = [
    "kotlinskidev/",
    "kotlinskidev/style.css",
    "kotlinskidev/theme.json",
    "kotlinskidev/functions.php",
    "kotlinskidev/build/js/main.js",
    "kotlinskidev/vendor/autoload.php",
  ];

  it("reports nothing for a valid package", () => {
    expect(lib.findMissingRequired(good)).toEqual([]);
    expect(lib.findForbiddenEntries(good)).toEqual([]);
    expect(lib.findWrongRoot(good)).toEqual([]);
  });

  it("reports missing required files", () => {
    expect(lib.findMissingRequired(good.filter((entry) => !entry.includes("vendor")))).toEqual([
      "vendor/autoload.php",
    ]);
  });

  it("flags dev content and a wrong root", () => {
    const bad = [
      ...good,
      "kotlinskidev/node_modules/a/b.js",
      "kotlinskidev/tests/x.php",
      "kotlinskidev/vendor/pestphp/pest/x.php",
      "other/style.css",
    ];
    expect(lib.findForbiddenEntries(bad)).toHaveLength(3);
    expect(lib.findWrongRoot(bad)).toEqual(["other/style.css"]);
  });
});

describe("checkVersions", () => {
  it("accepts matching versions and tag", () => {
    expect(
      lib.checkVersions({ styleVersion: "2.7.0", packageVersion: "2.7.0", tag: "v2.7.0" })
    ).toEqual([]);
  });

  it("reports a tag or package mismatch", () => {
    expect(
      lib.checkVersions({ styleVersion: "2.7.0", packageVersion: "2.6.0", tag: "v2.8.0" })
    ).toHaveLength(2);
  });
});

describe("extractReleaseNotes", () => {
  const changelog = [
    "## [Unreleased]",
    "",
    "*Nothing yet.*",
    "",
    "## [2.7.0] — 2026-12-01",
    "",
    "### Added",
    "",
    "- Thing.",
    "",
    "## [2.6.0] — 2026-11-01",
    "",
    "- Old.",
  ].join("\n");

  it("returns only the requested section", () => {
    expect(lib.extractReleaseNotes(changelog, "2.7.0")).toBe("### Added\n\n- Thing.");
  });

  it("throws for a missing section or invalid version", () => {
    expect(() => lib.extractReleaseNotes(changelog, "9.9.9")).toThrow("no section");
    expect(() => lib.extractReleaseNotes(changelog, "latest")).toThrow("Not a release version");
  });
});
