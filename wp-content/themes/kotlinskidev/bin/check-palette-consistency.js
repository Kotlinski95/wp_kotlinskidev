const fs = require("fs");
const path = require("path");

const themeDir = path.resolve(__dirname, "..");

function loadPalette(filePath) {
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const palette = json?.settings?.color?.palette;
  if (!Array.isArray(palette)) {
    throw new Error(`${filePath}: settings.color.palette is missing or not an array.`);
  }
  return palette.map((entry) => entry.slug);
}

function checkFamilyCompleteness(slugs, sourceLabel) {
  const slugSet = new Set(slugs);
  const errors = [];

  for (const slug of slugs) {
    if (!slug.endsWith("-light")) {
      continue;
    }
    const base = slug.slice(0, -"-light".length);
    const required = [`${base}-dark`, base, `${base}-contrast`];
    for (const requiredSlug of required) {
      if (!slugSet.has(requiredSlug)) {
        errors.push(
          `${sourceLabel}: "${slug}" has no matching "${requiredSlug}" — every {name}-light/{name}-dark pair needs {name} (adaptive) and {name}-contrast (adaptive, swapped) too.`
        );
      }
    }
  }

  for (const slug of slugs) {
    if (slug.endsWith("-rgb")) {
      errors.push(
        `${sourceLabel}: "${slug}" is an -rgb triplet preset — use color-mix(in srgb, var(--wp--preset--color--{base}) N%, transparent) instead, not a separate RGB preset.`
      );
    }
  }

  return errors;
}

const themeJsonPath = path.join(themeDir, "theme.json");
const themeSlugs = loadPalette(themeJsonPath);

let errors = checkFamilyCompleteness(themeSlugs, "theme.json");

const stylesDir = path.join(themeDir, "styles");
const variantFiles = fs
  .readdirSync(stylesDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

const themeSlugSet = new Set(themeSlugs);

for (const file of variantFiles) {
  const filePath = path.join(stylesDir, file);
  const variantSlugs = loadPalette(filePath);
  const variantSlugSet = new Set(variantSlugs);
  const label = `styles/${file}`;

  errors = errors.concat(checkFamilyCompleteness(variantSlugs, label));

  const missingFromVariant = themeSlugs.filter((s) => !variantSlugSet.has(s));
  const extraInVariant = variantSlugs.filter((s) => !themeSlugSet.has(s));

  if (missingFromVariant.length > 0) {
    errors.push(
      `${label}: missing ${missingFromVariant.length} slug(s) present in theme.json: ${missingFromVariant.join(", ")}`
    );
  }
  if (extraInVariant.length > 0) {
    errors.push(
      `${label}: has ${extraInVariant.length} slug(s) not present in theme.json: ${extraInVariant.join(", ")}`
    );
  }
}

if (errors.length > 0) {
  console.error("Palette consistency check failed:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error(
    '\nEvery adaptive color needs the full {name}-light / {name}-dark / {name} / {name}-contrast family (see theme.json\'s "primary"/"surface" groups), and every style variant in styles/*.json must define the exact same set of slugs as theme.json. See CHANGELOG.md\'s 2026-10-11 entries for the pattern.'
  );
  process.exit(1);
}

process.stdout.write(
  `Palette consistency OK: ${themeSlugs.length} slugs, ${variantFiles.length} style variant(s) in sync.\n`
);
