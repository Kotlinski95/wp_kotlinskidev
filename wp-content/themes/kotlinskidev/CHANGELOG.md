# Changelog

All notable changes to the kotlinskidev theme are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this theme follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking change: removed/renamed a block or attribute, a template/pattern change that requires editors to re-save affected content, a markup change that isn't backward compatible.
- **MINOR** — new, backward-compatible capability: a new block, a new attribute, a new pattern, a new editor control.
- **PATCH** — bug fix, style tweak, security fix with no new capability.

**When releasing:** bump `Version` in `style.css` and `"version"` in `package.json` together (they must always match), move the `[Unreleased]` entries under a new dated version heading, and start a fresh empty `[Unreleased]` section. See `docs/treeview.md` for the full current structure reference — update it alongside any change that adds/removes/renames a block, pattern, template, or function module.

This file starts tracking from 2026-07-28. Work before that date was ticket-based (see `git log`, tickets `T3`–`T16`) and is not itemized retroactively — `1.0.0` below represents the theme's accumulated state as of this file's creation, not a dated release.

---

## [Unreleased]

### Security

- Fixed `kotlinskidev/protected-content`: was a static block whose "Use Protection" toggle stored **plaintext** in a `data-original-content` HTML attribute — visible in page source, no real protection. Converted to a dynamic (server-rendered) block using the theme's existing RSA-2048 encryption (`kotlinskidev_encrypt_content()`), producing the same encrypted-span markup the auto-detection system already used. This also immediately fixed an active plaintext leak on the live Contact/Kontakt pages, which were already using the broken block.
- Marked the Search/Szukaj utility pages as `noindex` (Yoast) — they were previously indexable and were surfacing in the "Popular Pages" block, which makes no sense for a search-utility page.

### Added

- `kotlinskidev/content-block` — new block resolving a `wp_block` reusable-block post by slug (Polylang-translation-aware), for content that needs to live outside a `wp_navigation` post but still be per-language.
- `wp_block` registered as a Polylang-translatable post type (alongside the existing `wp_navigation`), enabling the above.
- `kotlinskidev/simple-grid`: new `tabletColumns` attribute + matching tablet-breakpoint (782–1024px) media query and editor control, alongside the existing `mobileColumns`. Independent 3-tier column control (desktop/tablet/mobile) instead of desktop-or-mobile only.
- `kotlinskidev/protected-content`: new `address` and `other` protection types (in addition to email/phone/text), for arbitrary content that can't be auto-detected by regex.
- `kotlinskidev/popular-pages` / `nav-popular-pages`: new `titleFontSize` attribute with a native `FontSizePicker` control (same component/preset list as core Heading/Paragraph blocks).
- Generic top-level block pass-through added to `kotlinskidev/navigation`'s `list` and `bar` display modes (mirrors what `mega` mode already did via `kotlinskidev_render_nav_extras()`) — any block type now renders in any display mode instead of being silently dropped.
- `kotlinskidev_get_popular_posts()` query now excludes any page carrying Yoast's noindex meta, generally — not just the two pages fixed above.
- SCSS: `kt-not($selectors)` function (`src/styles/mixins.scss`) — builds a `:not()` chain from a SCSS list, so `link.scss`'s dead-link/underline-exception selectors are maintained as lists instead of hand-edited chains.

### Changed

- Footer restructured: brand content (logo, description, social links) moved out of the footer's `wp_navigation` post into a `kotlinskidev/content-block` instance; the nav post now holds only actual navigation content.
- Footer nav columns rebuilt from two `core/navigation-submenu` blocks into a single `kotlinskidev/simple-grid` with 3 holders (Pages/Services/Contact), each with a real `core/heading` (independently stylable) + `core/list`, replacing the previous PHP-hardcoded, unstylable column titles.
- Footer address moved into a `protected-content` block (`type: address`) in both language variants.
- Footer social links synced to the full canonical platform set (Facebook, LinkedIn, X, YouTube, GitHub, Instagram, TikTok) with corrected URLs — was missing X/TikTok entirely and had four unfilled `#` placeholders.
- `kotlinskidev/navigation` `render.php`: removed dead `$brand_blocks` fallthrough logic in the `list` display mode (no longer reachable now that brand content lives in `content-block`).
- `docs/` cleaned up to describe only the current, implemented state — no forward-looking plans: `footer-migration-plan.md` → `footer-architecture.md`, `header-migration-plan.md` → `header-architecture.md`, `breakpoints.md`/`theme-colors.md`/`navigation-structure.md` stripped of superseded proposals and phase language, `project-structure.md` deleted (its recommendations — classic template removal, `assets/` build output, Tailwind removal — were never actually adopted, so keeping it risked documenting a plan as if it were done).
- `kotlinskidev/protected-content`: added `kotlinskidev/highlight-gradient` and `kotlinskidev/gradient-text` to its RichText `allowedFormats`, so the "Gradient Colors" toolbar button (already available on `core/heading` and `core/paragraph`, including the footer's Contact holder) is now available there too.

### Fixed

- Footer centering: removed a stray `full-width full-container container` className on the footer nav block that was fighting the block's own width constraints (WordPress's own full-bleed CSS trick applied where it didn't belong).
- Footer mobile-viewport alignment: WordPress's constrained-layout system was injecting `margin-left/right: auto !important` on the footer's brand/nav columns, which overrode `align-items: stretch` once the layout dropped to a single stacked column below 782px, causing the nav column to shrink-to-content and center instead of stretching full width.
- Footer brand column width on tablet (782–1024px): reduced from `23.75rem` to `17.5rem` so it doesn't crowd the now-2-column nav grid at that breakpoint.
- Social-link icons rendered as a 36×40px pill instead of a 36×36px circle (classic inline-block baseline/descender-gap quirk) — added `vertical-align: top` to `.wp-block-social-link-anchor`, theme-wide.
- "Want to know more?" CTA social-links row (present on 8 pages: Homepage, Strona Główna, About, O mnie, Contact, Kontakt, Dziękuję, Thank you page): `justifyContent` was set to `"left"` while block alignment was `"center"` — the two conflicted and `left` won, pushing icons flush-left instead of centered.
- Same CTA: the **X** block's URL and the **YouTube** block's URL were swapped (X pointed at a youtube.com URL, YouTube was an unfilled `#`) — corrected using the hamburger/mobile-nav `social-item` entries as the source of truth.
- Removed the `::after` emoji icons (📧/📱) shown after protected email/phone content.
- Search and language dropdown triggers (`<a href="#" class="kt-mega-nav__link">`) had `pointer-events: none` applied by a generic `a[href="#"]` rule meant for genuinely dead links — excluded `.kt-mega-nav__link` so these triggers get a normal pointer cursor like every other dropdown trigger.
- Gradient Colors formatting (highlight/text) on `kotlinskidev/protected-content` was silently discarded even after being enabled, for any `protectionType` other than `text`:
  - `render.php` ran `wp_strip_all_tags()` on the content before encrypting for every type except `text` — now only `email`/`phone` (which need a clean string for their `mailto:`/`tel:` href) strip tags; `address`/`other`/`text` keep inline formatting intact through encryption.
  - The AJAX reveal handler's `default` case (covering `address`/`other`) rendered the decrypted content with `esc_html()`, escaping any surviving markup back to visible text — it now uses `wp_kses_post()`, matching the `text` type.
  - Even with both of the above fixed, WordPress core's `safecss_filter_attr()` (used internally by `wp_kses_post()` for the `style` attribute) rejects **any** `gradient(...)` CSS value that contains a `var(--...)` reference — which is exactly what every theme.json-based color/gradient preset produces, so every swatch in the "Gradient Colors" picker was silently dropped. Added a `safecss_filter_attr_allow_css` filter (`functions/safe-css-gradient-vars.php`) that recognizes `var()`/`rgba()` nested inside `-gradient()` wrappers as safe, without weakening the existing block on `expression()` or unsafe `url()` schemes (verified both still get stripped).

---

## [1.0.0] — Baseline (2026-07-28)

Represents the theme as it stood when changelog tracking began: the FSE block theme described in `README.md` — 10 custom blocks (pre-this-session count), 56 patterns, 9 templates, dark/light mode, scroll animations, parallax, PWA support, Polylang multilingual support, the `T16` navigation/mega-menu redesign, and the footer/protected-content/popular-pages baseline this file's `[Unreleased]` section builds on. See `docs/treeview.md` for the full current inventory.
