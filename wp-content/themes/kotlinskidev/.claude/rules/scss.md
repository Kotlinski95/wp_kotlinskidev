---
paths: ["src/styles/*.scss", "src/blocks/**/*.scss"]
description: Rules for SCSS source files
---

## No Comments
Do not add inline or block comments. Selector and variable names must be self-documenting.

## Design Tokens First
- Always use CSS custom properties from `theme.json` (`--wp--preset--color--{slug}`, `--wp--preset--spacing--{slug}`) for colours and spacing.
- Use SCSS variables from `variables.scss` for values not covered by theme.json tokens.
- Never hardcode hex colours, pixel spacing, or font sizes that have an existing token.

## Theme-Aware Styles
- Scope dark/light mode overrides using `body.dark-mode` and `body.light-mode` — never use `@media (prefers-color-scheme)` directly, as the theme switcher overrides it via JS.
- Use the `gradient-text` mixin from `theme-colors.scss` for gradient text effects.

## Naming — BEM
- Use BEM: `.block__element--modifier`.
- Block-scoped styles must match the block's CSS class as output by `useBlockProps()`.
- Prefix all custom component classes with `kt-` to avoid collisions with WordPress core or plugin styles.

## Nesting
- Limit nesting to 3 levels maximum.
- Use `&` for modifiers and pseudo-classes only — do not create deep descendant chains with `&`.

## Mixins & Reuse
- Extract repeated declarations (3+ occurrences) into a mixin in `mixins.scss`.
- Do not duplicate breakpoint logic — use the established breakpoint variables.

## Performance
- Avoid `*` selectors and overly broad descendant selectors.
- Keep per-block stylesheets scoped tightly to that block's root class.
- Do not import entire libraries — import only the partials needed.
