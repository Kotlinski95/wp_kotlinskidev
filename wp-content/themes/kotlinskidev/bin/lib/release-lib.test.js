const lib = require("./release-lib");

const sample = [
  "# Changelog",
  "",
  "---",
  "",
  "## [Unreleased]",
  "",
  "### Added",
  "",
  "- **2026-11-15 — New thing.**",
  "",
  "### Fixed",
  "",
  "- **2026-11-14 — Fixed thing.**",
  "",
  "## [2.0.0] — 2026-10-05",
  "",
  "### Added",
  "",
  "- **2026-10-01 — Old thing.**",
  "",
].join("\n");

describe("parseUnreleased", () => {
  it("collects entries per category and ignores released sections", () => {
    const parsed = lib.parseUnreleased(sample);
    expect(parsed.entryCount).toBe(2);
    expect(parsed.categories.Added).toHaveLength(1);
    expect(parsed.categories.Fixed).toHaveLength(1);
  });

  it("reports zero entries for a placeholder section", () => {
    const parsed = lib.parseUnreleased(
      "## [Unreleased]\n\n*Nothing yet.*\n\n## [1.0.0] — 2026-01-01\n"
    );
    expect(parsed.entryCount).toBe(0);
  });

  it("returns null without an Unreleased heading", () => {
    expect(lib.parseUnreleased("# Changelog\n")).toBeNull();
  });
});

describe("decideBump", () => {
  it("picks minor when Added has entries", () => {
    expect(lib.decideBump(lib.parseUnreleased(sample))).toBe("minor");
  });

  it("picks patch without Added entries", () => {
    const parsed = { categories: { Fixed: ["- x"] }, entryCount: 1 };
    expect(lib.decideBump(parsed)).toBe("patch");
  });

  it("lets flags override", () => {
    const parsed = lib.parseUnreleased(sample);
    expect(lib.decideBump(parsed, { patch: true })).toBe("patch");
    expect(lib.decideBump(parsed, { major: true })).toBe("major");
    expect(lib.decideBump({ categories: {}, entryCount: 0 }, { minor: true })).toBe("minor");
  });
});

describe("semver helpers", () => {
  it("bumps each size", () => {
    expect(lib.bumpVersion("2.0.1", "major")).toBe("3.0.0");
    expect(lib.bumpVersion("2.0.1", "minor")).toBe("2.1.0");
    expect(lib.bumpVersion("2.0.1", "patch")).toBe("2.0.2");
  });

  it("picks the higher of two versions", () => {
    expect(lib.highestVersion("2.0.0", "2.0.1")).toBe("2.0.1");
    expect(lib.highestVersion("2.10.0", "2.9.9")).toBe("2.10.0");
  });

  it("accepts prerelease and build suffixes and releases them", () => {
    expect(lib.parseSemver("2.1.0-rc.1")).toEqual([2, 1, 0]);
    expect(lib.parseSemver("2.1.0+build.5")).toEqual([2, 1, 0]);
    expect(lib.bumpVersion("2.1.0-rc.1", "patch")).toBe("2.1.0");
    expect(lib.bumpVersion("2.1.0-rc.1", "major")).toBe("2.1.0");
  });

  it("orders prereleases below their release", () => {
    expect(lib.highestVersion("2.1.0-rc.1", "2.1.0")).toBe("2.1.0");
    expect(lib.highestVersion("2.1.0-rc.2", "2.1.0-rc.10")).toBe("2.1.0-rc.10");
  });

  it("rejects invalid input", () => {
    expect(() => lib.parseSemver("2.0")).toThrow();
    expect(() => lib.bumpVersion("2.0.0", "huge")).toThrow();
  });
});

describe("rewriteChangelog", () => {
  it("renames Unreleased and inserts a fresh empty one above", () => {
    const next = lib.rewriteChangelog(sample, "2.1.0", "2026-11-15");
    expect(next).toContain(
      "## [Unreleased]\n\n*Nothing yet.*\n\n## [2.1.0] — 2026-11-15\n\n### Added"
    );
    expect(next.match(/## \[Unreleased\]/g)).toHaveLength(1);
    expect(next).toContain("## [2.0.0] — 2026-10-05");
  });

  it("throws without an Unreleased heading", () => {
    expect(() => lib.rewriteChangelog("# x", "1.0.0", "2026-01-01")).toThrow();
  });
});

describe("version file rewriting", () => {
  it("replaces the style.css header", () => {
    const css = "/*\nTheme Name: x\nVersion: 2.0.0\n*/";
    expect(lib.replaceStyleVersion(css, "2.1.0")).toContain("Version: 2.1.0");
    expect(lib.readStyleVersion(css)).toBe("2.0.0");
  });

  it("updates both lockfile version fields and preserves formatting", () => {
    const lock =
      '{\n    "name": "x",\n    "version": "2.0.0",\n    "packages": {\n        "": {\n            "name": "x",\n            "version": "2.0.0"\n        },\n        "node_modules/y": {\n            "version": "2.0.0"\n        }\n    }\n}\n';
    const next = lib.replaceJsonVersions(lock, "2.1.0", true);
    const parsed = JSON.parse(next);
    expect(parsed.version).toBe("2.1.0");
    expect(parsed.packages[""].version).toBe("2.1.0");
    expect(parsed.packages["node_modules/y"].version).toBe("2.0.0");
    expect(next).toBe(
      lock
        .replace('"version": "2.0.0",', '"version": "2.1.0",')
        .replace(
          '"name": "x",\n            "version": "2.0.0"',
          '"name": "x",\n            "version": "2.1.0"'
        )
    );
  });

  it("touches only the top-level version of package.json", () => {
    const pkg = '{\n  "name": "x",\n  "version": "1.0.0",\n  "engines": { "node": ">=24" }\n}\n';
    expect(lib.replaceJsonVersions(pkg, "1.0.1", false)).toBe(pkg.replace("1.0.0", "1.0.1"));
  });
});
