## What this design system is

`kotlinskidev` is a WordPress block theme. What's synced here is **real
server-rendered markup** from the theme's own PHP patterns/blocks (not a
React component library) — every component preview is the theme's actual
`wp-block-*` HTML, styled by its actual compiled CSS. Build with it by
reusing the same markup shape and the same class/token vocabulary shown in
each preview, not by inventing new class names.

## Styling idiom: WordPress core block classes + theme.json custom properties

There is no separate "DS class" system — this theme uses **WordPress core
block markup classes** (`wp-block-group`, `wp-block-columns`,
`wp-block-cover`, `wp-block-buttons`, etc.) plus **color/gradient/typography
utility classes WordPress generates from `theme.json`**. Read a component's
preview HTML and reuse its exact classes; don't guess new ones.

Color utilities follow `has-{slug}-color` / `has-{slug}-background-color` /
`has-{slug}-border-color`. Key adaptive slugs (flip with light/dark mode
automatically via CSS `light-dark()`, no extra markup needed):
`primary`, `surface`, `foreground`, `foreground-alt`, `divider`. Gradients
follow `has-{slug}-gradient-background`, e.g.
`has-gradient-block-bottom-left-gradient-background`. See the **Colors**
token card for the full palette.

Spacing/typography are CSS custom properties, referenced directly or via
inline `style="padding-top:var(--wp--preset--spacing--large)"`:
`--wp--preset--spacing--{none,small,medium,large,x-large}` (fluid, clamp()
based) and `--wp--preset--font-size--{x-small,small,normal,medium,big,large,
x-large,xx-large,xxx-large}`. See **Spacing** and **Typography** token cards.

Font family: **Sora** (variable weight 400–700), self-hosted woff2, loaded
via `@font-face` in `styles.css`. Don't substitute a system font.

## Where the truth lives

Read `styles.css` first — it `@import`s everything a rendered preview needs,
in this order: WordPress core block styles (`_vendor/wp-block-library.css`),
this theme's design tokens (`_vendor/global-styles.css`, generated from
`theme.json`), the theme's compiled layout/component CSS
(`_vendor/theme-main.css`), then three block-specific stylesheets
(`_vendor/blocks/style-{hero-carousel,marquee,content-tabs}.css`). Every
component's own `<Name>.prompt.md` names its real source pattern/block.

## Known limitation: three components need runtime JS for their final look

`HeroCarousel`, `Marquee`, and `ContentTabs` are Swiper/JS-driven in
production. Their previews here show real markup, colors, and typography,
but not their final runtime arrangement (horizontal scroll, slide
transitions, tab-panel active-state) — that's applied by the theme's own
TypeScript at runtime, not by CSS alone. When composing with these, describe
the static structure shown (a tab strip, a carousel with N slides, a
horizontal logo row) rather than assuming scroll/transition behavior is
visible in a static mockup.

## Minimal idiomatic snippet

```html
<div class="wp-block-group has-background" style="background: var(--wp--preset--color--surface-light); padding: var(--wp--preset--spacing--large)">
  <h2 class="has-primary-color has-text-color" style="font-size: var(--wp--preset--font-size--x-large); font-weight: 800">
    Section heading
  </h2>
  <div class="wp-block-buttons">
    <div class="wp-block-button is-style-outline">
      <a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background wp-element-button">
        Call to action
      </a>
    </div>
  </div>
</div>
```
