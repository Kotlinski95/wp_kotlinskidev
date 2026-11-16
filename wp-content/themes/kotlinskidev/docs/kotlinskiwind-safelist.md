# Kotlinskiwind utility safelist

`build/css/critical.css` ships only the `kotlinskiwind` utility classes listed in `src/styles/_kotlinskiwind-safelist.scss`. `build/css/main-all.css` (editor) always ships the full set.

## Add a utility back

1. Open `src/styles/_kotlinskiwind-safelist.scss`.
2. Add the full class name to `$kt-utility-safelist`, with its breakpoint prefix when it has one (`"flex"`, `"mobile:inline-block"`, `"desktop:none"`).
3. Run `npm run build`.

Class names derived at render time from block attributes (for example `responsiveDisplay` in `functions/responsive-display.php`) never appear in saved content, so list them here by hand.

## Add a new utility

Add a `"name": (property, value)` row to `$kt-utilities` in `src/styles/kotlinskiwind.scss`. Names that exist only with a breakpoint prefix also go in `$kt-responsive-only-utilities`.
