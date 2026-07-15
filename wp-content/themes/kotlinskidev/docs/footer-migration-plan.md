# Footer Block Migration Plan

Consolidate the footer onto a single, language-agnostic loading path — the same principle applied in [header-migration-plan.md](./header-migration-plan.md): one template part, one pattern, zero per-language branching in PHP, zero shortcodes, zero content baked into PHP strings. Every editable piece of the footer (links, logo, description, social links, contact details) should be manageable per language from the Site Editor. Adding a third language should mean creating translations in the UI, never touching a template file, a shortcode, or an `if` statement.

**Status note:** Parts 2 and 3 below (the `kotlinskidev/content-block` block, splitting the footer across `wp_block` reusable patterns, and composing columns via `kotlinskidev/simple-grid`/`kotlinskidev/holder`) describe an earlier design that has been **superseded**. The footer now uses a single `wp_navigation` post (slug `footer`) holding everything — logo/description/social-links, Quick Links, Services, and Contact — rendered by `kotlinskidev/navigation`'s `displayMode="list"`, the same object shape as the header's `desktop-menu`/`mobile-menu`. See **"Content Object — Manual Setup"** near the end of this document for the current design and setup steps. Parts 2-3 are kept below only as a record of the design's evolution — do not implement `content-block` or the simple-grid/holder composition for the footer.

---

## Current State Summary

`patterns/footer.php` (slug `kotlinskidev/footer`) is a single shared PHP pattern — no duplicated copy across languages — but it is not truly FSE-manageable:

- The logo, description paragraph, and social links are static HTML with `esc_html_e()` strings. A translator can change the *label* via a `.mo` file, but a content editor cannot change the *content* (swap the logo, rewrite the description, add a social network) without a code deploy.
- The Quick Links / Services columns are hardcoded `<a href="<?php echo esc_url(home_url('/about/')); ?>">` anchors. The label translates via i18n strings; the URL does not — it always points at the English slug.
- The Contact column (address / hours / email / phone) is hardcoded text and `mailto:`/`tel:` links — same problem, no editor access.
- `[copyrights_shortcode_here]` and `[scroll_to_top_shortcode_here]` are shortcodes (`functions/copyrights.php`, `functions/scroll-top-top.php`) rendered via `do_shortcode()` inside the pattern — invisible to the block inserter, not editable as blocks, and inconsistent with how the header already solved this exact problem (`kotlinskidev/theme-switcher`).
- There is also a **loading-path duplication bug**, independent of the above: two different mechanisms decide which footer template part renders, and one of them hardcodes locale checks in PHP. See below.

**Path A — direct template part** (`templates/index.html`, `templates/blank-with-header-footer.html`):
```
wp:template-part {"slug":"footer"} → parts/footer.html → wp:pattern {"slug":"kotlinskidev/footer"}
```
`parts/footer-pl.html` exists as a parallel file with **identical content**, but nothing routes to it — WordPress core has no built-in locale-suffix resolution for template parts, and no filter in this theme adds one.

**Path B — dynamic pattern hack** (`templates/page.html`, `articles.html`, `article.html`, `category.html`, `tag.html`, `search.html`):
```
wp:pattern {"slug":"kotlinskidev/footer-dynamic"}
  → kotlinskidev_dynamic_footer_pattern() (functions/dynamic-footer.php, hooked on render_block)
    → regex-checks REQUEST_URI for ^/pl/ OR get_locale() === 'pl_PL'
    → builds wp:template-part {"slug": "footer" | "footer-pl"} by hand
    → appends template-parts/mobile-footer-menu.php
    → runs kotlinskidev_add_protection_to_content()
```

Six of eight templates rely on a hardcoded URL-prefix/locale check instead of any WordPress/Polylang mechanism. Two templates (`index.html`, `blank-with-header-footer.html`) skip that filter entirely, so they **never get the mobile footer menu or content protection** either.

**Also confirmed dead:** `patterns/footer.php` reads `global $kotlinskidev_force_footer_shortcodes` / `$kotlinskidev_footer_shortcodes` to let a caller override the copyrights/scroll-to-top markup. The only place that ever sets these globals is a **commented-out** block in `page-search.php`. This escape hatch has no live caller — remove it as part of this migration rather than porting it into the new block-based footer.

**Bonus defect found while tracing this:** `templates/blank-with-header-footer.html` references `"theme":"saaslauncher"` on both its header and footer `wp:template-part` blocks — a leftover from whatever starter theme this was scaffolded from.

---

## Why This Doesn't Scale (same failure mode as pre-migration header)

| Header (before T16) | Footer (today) |
|---|---|
| `navigation.php` shortcode, menu hardcoded per breakpoint | `dynamic-footer.php` — part choice hardcoded per URL-prefix/locale via regex |
| `[theme_switcher]` shortcode | `[copyrights_shortcode_here]`, `[scroll_to_top_shortcode_here]` shortcodes |
| Links/labels hardcoded in `navigation.php`, no per-language editing | Logo/description/social/links/contact hardcoded in `footer.php`, no per-language editing |
| No Polylang-aware ID resolution | No Polylang-aware ID resolution |

The header fix had three parts: **stop branching on locale in PHP**, **replace shortcodes with real blocks**, and **let Polylang resolve translated content objects by slug instead of hardcoding strings/URLs in a template file**. The footer needs all three, not just the first.

---

## Part 1 — Shortcodes → Blocks

Follow the exact precedent set by `kotlinskidev/theme-switcher` in the header migration: keep the underlying render function, wrap it in a proper server-rendered block, register it, retire the shortcode from the template.

**`kotlinskidev/copyrights`**
- `src/blocks/copyrights/block.json` — `"render": "file:./render.php"`, `"inserter": true`, category `kotlinskidev-navigation` or a new `footer` category
- `src/blocks/copyrights/render.php` — calls `kotlinskidev_copyrights_shortcode()` unchanged
- `src/blocks/copyrights/index.tsx` — `ServerSideRender` for editor preview, no attributes needed

**`kotlinskidev/scroll-to-top`**
- Same structure, `render.php` calls `kotlinskidev_scroll_to_top_shortcode()` unchanged

**Files to update:**
- `webpack.config.js` — add both entries
- `functions/blocks.php` — `register_block_type()` for both
- `patterns/footer.php` — replace `do_shortcode('[copyrights_shortcode_here]')` / `[scroll_to_top_shortcode_here]` and the `$kotlinskidev_force_footer_shortcodes` branch entirely with:
  ```
  <!-- wp:kotlinskidev/copyrights /-->
  <!-- wp:kotlinskidev/scroll-to-top /-->
  ```
- `functions/copyrights.php`, `functions/scroll-top-top.php` — the underlying functions stay (block `render.php` calls them, same as `theme_switcher`). Decide whether `add_shortcode()` registration itself should be deleted; grep the codebase for `[copyrights]` / `[scroll_to_top]` usage outside the footer pattern first — if nothing else calls them, delete the `add_shortcode()` lines too instead of leaving an orphaned shortcode nobody can discover.

This removes the `$kotlinskidev_force_footer_shortcodes` / `$kotlinskidev_footer_shortcodes` globals entirely — dead code, confirmed above, with no replacement needed.

---

## Part 2 — Footer Navigation as a Grid (same mechanism as header, different layout)

The header solved "translatable links, portable across environments" with `wp_navigation` posts resolved by human-readable slug via `pll_get_post()` — never a hardcoded numeric `ref`. The footer's Quick Links and Services columns need the identical resolution, just rendered as a plain multi-column list instead of a horizontal mega-menu bar.

**Reuse, don't rebuild, the resolution logic.** `src/blocks/navigation/render.php` already does exactly this lookup (`get_page_by_path()` + `pll_get_post()`) before it ever gets to mega-panel rendering. Add a `displayMode` attribute (`"mega"` default, `"list"` for footer use) to `kotlinskidev/navigation`'s `block.json`, and branch early in `render.php`: when `displayMode === 'list'`, skip `kotlinskidev_parse_nav_blocks()`'s panel/icon machinery and render the resolved nav post's top-level `core/navigation-link` items as a plain `<ul><li><a></a></li></ul>` — no backdrop, no SVG icon defs, no `kt-mega-nav__panels`. This is an extension of the block's existing job (render *a* navigation, given a slug), not unrelated logic bolted onto the file.

**Layout — reuse `kotlinskidev/simple-grid` + `kotlinskidev/holder`**, the exact blocks built during T16 for the header's mega-panel content grids. They already do the right thing structurally: `simple-grid` auto-sizes `--kt-sg-cols` to however many `holder` children it has, and each `holder` accepts arbitrary inner blocks.

Three changes needed before they work outside a nav panel — and the client needs actual controls, not just "however many Holders you happen to add":

1. **`block.json` `parent` restriction** — `simple-grid`'s `parent` is currently `["core/navigation", "core/navigation-submenu", "kotlinskidev/holder"]`, so the inserter won't offer it inside a footer pattern. Add `"core/group"` (the footer's outer wrapper block) or drop the `parent` key so it's insertable anywhere — it's already generically described as a "Flexible grid container," the restriction was just never widened past its original use case.
2. **`holder`'s `ALLOWED_BLOCKS`** (`src/blocks/holder/edit.tsx`) doesn't currently list `kotlinskidev/navigation` or `kotlinskidev/content-block` (see Part 3) — add both so the footer's link columns and about/contact columns can live inside a Holder.
3. **Turn the desktop column count into a real, bounded control — not free-form add/remove.** Today `simple-grid`'s edit.tsx derives `colCount` straight from `innerBlocks.length` and exposes unbounded "+ Add Column" / "Remove Last Column" buttons — any number of Holders is technically possible, which is fine for a nav mega-panel but not what a client-facing footer setting should look like. Replace that with a `SelectControl` ("Columns: 2 / 3 / 4") in `InspectorControls` that inserts or removes `kotlinskidev/holder` children to match the chosen count, so the option is explicit and bounded instead of an open-ended button. Keep `--kt-sg-cols` derived from the resulting Holder count — no separate desktop attribute needed, one source of truth.

**Two independent strategies for the mobile layout — support both, let the client pick per footer.** They solve different problems and shouldn't be collapsed into one option:

### Strategy A — Reflow (same content, fewer columns)

For the common case: identical links/content on mobile, just fewer columns. Add a `mobileColumns` attribute (`number`, default `1`, UI options capped at `min(2, columns)` via a second `SelectControl`, e.g. "Mobile layout"). `render.php` outputs a second custom property, `--kt-sg-cols-mobile`, alongside the existing `--kt-sg-cols`:

```scss
.kt-simple-grid {
  grid-template-columns: repeat(var(--kt-sg-cols, 3), 1fr);

  @media (max-width: ($breakpoint-mobile - 0.0625rem)) {
    grid-template-columns: repeat(var(--kt-sg-cols-mobile, 1), 1fr);
  }
}
```

**Use the theme's existing static `$breakpoint-mobile` SCSS variable (`src/styles/variables.scss`), not the Customizer's dynamic `mobile_breakpoint` theme_mod.** These are two genuinely different breakpoint systems already living side by side in this codebase: `functions/breakpoints.php` exposes a Customizer-configurable value used to localize `window.kotlinskidevBreakpoints` for editor UI labels, but the compiled utility CSS in `src/styles/kotlinskiwind.scss` (the `mobile:`/`desktop:` classes that Strategy B relies on, see below) is built at webpack-compile-time off the static `$breakpoint-mobile`/`$breakpoint-desktop` SCSS variables and does **not** read the Customizer setting at all, despite the editor implying it does. That's a pre-existing inconsistency in the theme, not something to fix here — but it means Strategy A must match Strategy B's static breakpoint, or the footer would have two different "mobile starts here" thresholds depending which strategy a client picked for which section.

### Strategy B — Independent per-breakpoint instances (different content, not just fewer columns)

For when mobile genuinely needs different links, different order, or a different column count entirely — not a reflow of the same content. **This requires no new code at all**, because the theme already has a global mechanism for it: `functions/responsive-display.php` + `src/blocks/responsive-display/index.tsx` inject a `responsiveDisplay` attribute (`{desktop:{}, tablet:{}, mobile:{}}`, each with its own `display`/`flexDirection`/`justifyContent`/`alignItems` options) and a matching Inspector Control panel onto **every** registered block via WordPress's `blocks.registerBlockType` filter — including `kotlinskidev/simple-grid`, since that hook applies globally, not per block.json opt-in. This is the same building block the header's original design sketch referenced, and it already ships in the theme today.

Compose two full `kotlinskidev/simple-grid` instances (each with its own Holders, its own column count, even its own `wp_navigation` slugs), set one to `responsiveDisplay.mobile.display = "none"` and the other to `responsiveDisplay.desktop.display = "none"` (+ `.tablet.display = "none"` if it shouldn't show on tablet either) via the Inspector panel that's already there. No block.json, render.php, or webpack change required for the toggle itself.

**Editor UX note (applies to both strategies):** the block editor canvas doesn't simulate a phone viewport, so neither `mobileColumns` (Strategy A) nor a `responsiveDisplay.mobile` visibility change (Strategy B) can be live-previewed responsively in `edit.tsx` — Strategy B's control already ships with this limitation today (check how the existing `responsive-display.js` panel communicates it, if at all) and Strategy A's new control should follow the same convention for consistency, clearly labeling what applies at which breakpoint so the client isn't confused why nothing visibly changes while editing on a desktop screen.

Resulting footer link markup — Strategy A (reflow):
```
<!-- wp:kotlinskidev/simple-grid {"mobileColumns":1} -->
  <!-- wp:kotlinskidev/holder -->
    <!-- wp:kotlinskidev/navigation {"menuSlug":"footer-quick-links","displayMode":"list"} /-->
  <!-- /wp:kotlinskidev/holder -->
  <!-- wp:kotlinskidev/holder -->
    <!-- wp:kotlinskidev/navigation {"menuSlug":"footer-services","displayMode":"list"} /-->
  <!-- /wp:kotlinskidev/holder -->
<!-- /wp:kotlinskidev/simple-grid -->
```

Resulting footer link markup — Strategy B (independent instances, existing `responsiveDisplay` attribute):
```
<!-- wp:kotlinskidev/simple-grid {"responsiveDisplay":{"mobile":{"display":"none"}}} -->
  <!-- 3 Holders: Quick Links, Services, Contact — desktop-only composition -->
<!-- /wp:kotlinskidev/simple-grid -->

<!-- wp:kotlinskidev/simple-grid {"responsiveDisplay":{"desktop":{"display":"none"},"tablet":{"display":"none"}}} -->
  <!-- 1 Holder: condensed mobile-only link list, could reference a different wp_navigation slug -->
<!-- /wp:kotlinskidev/simple-grid -->
```

Create `footer-quick-links` and `footer-services` as `wp_navigation` posts in Appearance → Editor → Navigation (same place `desktop-menu`/`mobile-menu` live), translate via Polylang. If Strategy B is used with a genuinely different mobile link set, create a third slug (e.g. `footer-mobile-links`) and translate it the same way.

---

## Part 3 — About & Contact columns: real per-language content, not PHP strings

The header only ever needed to solve for *links* (a menu is inherently a list of URL+label pairs, and `wp_navigation` fits it natively). The footer's About column (logo image, description paragraph, social links) and Contact column (address, hours, email, phone) are **not** navigation menus — forcing them into `wp_navigation` posts would be a semantic misuse of that post type. They need the same "resolve a translatable object by slug, no hardcoded IDs" mechanism, applied to a content type built for arbitrary blocks: a **Reusable Block (`wp_block`)**.

Reusable blocks are already a first-class, Polylang-translatable post type with a real Site Editor UI (create it, edit blocks visually, hit "Translate" in the language panel) — this is a much more mature Polylang feature than any custom scheme we could build. The only gap is that WordPress has no built-in "insert a reusable block by slug" mechanism (only by numeric `ref`, which is exactly the non-portable-across-environments problem the header migration explicitly avoided for navigation). Close that gap with a new, small, dedicated block:

**`kotlinskidev/content-block`**
- `block.json` — attribute `contentSlug` (string), `"render": "file:./render.php"`
- `render.php`:
  ```php
  $slug = $attributes['contentSlug'] ?? '';
  if (empty($slug)) {
      return;
  }
  $post = kotlinskidev_resolve_translatable_post($slug, 'wp_block');
  if (!$post instanceof WP_Post) {
      return;
  }
  echo do_blocks($post->post_content);
  ```
- `index.tsx` — `ServerSideRender` + a `TextControl` for `contentSlug` in `InspectorControls` (same editing UX as `menuSlug` on `kotlinskidev/navigation`)

**Extract the shared resolver.** `kotlinskidev/navigation`'s render.php currently inlines its slug → post → `pll_get_post()` lookup. Pull that into one function so both blocks call it instead of duplicating the same four lines:

```php
function kotlinskidev_resolve_translatable_post(string $slug, string $post_type): ?WP_Post {
    $post = get_page_by_path($slug, OBJECT, $post_type);
    if (!$post instanceof WP_Post) {
        return null;
    }
    if (function_exists('pll_get_post')) {
        $translated_id = pll_get_post($post->ID);
        if ($translated_id) {
            $post = get_post($translated_id);
        }
    }
    return $post instanceof WP_Post ? $post : null;
}
```

Place it in `functions/polylang-navigation.php` alongside the existing `wp_navigation` Polylang registration — rename the file to `functions/polylang-content-resolution.php` (or similar) since it now covers more than navigation, and update the `functions.php` require comment accordingly.

**Register `wp_block` as Polylang-translatable the same way `wp_navigation` already is**, in that same file:
```php
function kotlinskidev_pll_register_reusable_blocks(array $post_types, bool $is_settings): array {
    $post_types['wp_block'] = 'wp_block';
    return $post_types;
}
add_filter('pll_get_post_types', 'kotlinskidev_pll_register_reusable_blocks', 10, 2);
```
(Verify in Settings → Languages whether your Polylang version already exposes `wp_block` translation by default before adding this — some versions do.)

**Create two Reusable Blocks** in the block editor:
- `footer-about` — logo image, description paragraph, social links (replaces the current hardcoded first column)
- `footer-contact` — address / hours / email / phone (replaces the current hardcoded last column)

Translate each via Polylang's normal "Translate" flow. Embed both via:
```
<!-- wp:kotlinskidev/content-block {"contentSlug":"footer-about"} /-->
<!-- wp:kotlinskidev/content-block {"contentSlug":"footer-contact"} /-->
```

**Net result:** a content editor can now change the footer logo, rewrite the description, add a social network, or update the office phone number — per language — entirely inside the Site Editor. No PHP, no `.mo` file regeneration, no deploy.

---

## Target Loading Architecture (unchanged from Part 1 draft, still correct)

Once every section is a resolved block, `patterns/footer.php` no longer contains any dynamic PHP at all — no `esc_html_e()`, no `global`, no `home_url()`. It becomes pure structural block markup, same as `patterns/header.php`:

```
ALL templates → wp:template-part {"slug":"footer","tagName":"footer"}
                    ↓
              parts/footer.html → wp:pattern {"slug":"kotlinskidev/footer"}
                    ↓
              patterns/footer.php:
                wp:kotlinskidev/simple-grid (About | Quick Links | Services | Contact holders)
                wp:kotlinskidev/copyrights
                wp:kotlinskidev/scroll-to-top
```

One filter, hooked on the template part itself rather than smuggled inside a pattern-only code path, keeps the cross-cutting concerns that today only fire for six of eight templates:

```php
add_filter('render_block', 'kotlinskidev_footer_template_part_extras', 10, 2);
function kotlinskidev_footer_template_part_extras($block_content, $block) {
    if (($block['blockName'] ?? '') !== 'core/template-part') {
        return $block_content;
    }
    if (($block['attrs']['slug'] ?? '') !== 'footer') {
        return $block_content;
    }

    if (function_exists('kotlinskidev_add_protection_to_content')) {
        $block_content = kotlinskidev_add_protection_to_content($block_content);
    }

    ob_start();
    get_template_part('template-parts/mobile-footer-menu');
    return $block_content . ob_get_clean();
}
```

No `get_locale()`, no `REQUEST_URI` regex, no second template part slug — Polylang already scopes the whole request to a language before this filter runs, and every content section resolves its own translation independently.

**Layout is a client-facing setting, not a hardcoded assumption.** The current footer has four content sections (About, Quick Links, Services, Contact); with the bounded `Columns: 2/3/4` control from Part 2, the client picks how many of those (or future) sections show side by side on desktop. Mobile behavior is then a choice between Strategy A (`Mobile layout: 1/2` reflow of the same content) and Strategy B (fully independent per-breakpoint `simple-grid` instances via the existing `responsiveDisplay` attribute) — nothing about column count or breakpoint visibility is baked into `render.php`; it's read from each block's own attributes each render.

---

## Implementation Order

1. **Shortcode → block conversion** (Part 1) — `kotlinskidev/copyrights`, `kotlinskidev/scroll-to-top`, remove the dead `$kotlinskidev_force_footer_shortcodes` branch. Smallest, fully isolated, no Polylang dependency.
2. **Extract the shared resolver** (`kotlinskidev_resolve_translatable_post()`) and register `wp_block` as Polylang-translatable (Part 3). Do this before building `content-block` or the `displayMode` change so both can call it.
3. **Add `displayMode="list"` to `kotlinskidev/navigation`** (Part 2) and verify it renders a clean flat list with no mega-panel artifacts.
4. **Build `kotlinskidev/content-block`** (Part 3), register it, `npm run build`.
5. **Widen `simple-grid`'s `parent` and `holder`'s `ALLOWED_BLOCKS`.** Replace the unbounded add/remove-column buttons with the bounded `Columns: 2/3/4` `SelectControl`, add the new `mobileColumns` attribute + `Mobile layout: 1/2` control for Strategy A, using the same static `$breakpoint-mobile` SCSS variable Strategy B's `responsiveDisplay` utility classes already compile against — no PHP inline-style generation needed. Confirm Strategy B needs zero code changes: `responsiveDisplay` already applies to `kotlinskidev/simple-grid` today via the existing global `blocks.registerBlockType` filter; this step is verification, not new work.
6. **Create the content objects in wp-admin**: `wp_navigation` posts `footer-quick-links` / `footer-services`; Reusable Blocks `footer-about` / `footer-contact`. Translate all four via Polylang.
7. **Rewrite `patterns/footer.php`** using the new blocks — this is the atomic, high-risk step. Test thoroughly before merging.
8. **Fix the loading-path duplication**: update the six Path B templates to `wp:template-part {"slug":"footer"}`, move the mobile-menu/protection logic into the template-part-scoped filter, delete `parts/footer-pl.html` and `patterns/footer-dynamic.php`.
9. **Fix `templates/blank-with-header-footer.html`**'s stray `"theme":"saaslauncher"` attribute.
10. **Regression test** (checklist below) on EN and PL across all eight templates.

---

## Testing Checklist

- [ ] Copyrights and scroll-to-top render identically to the old shortcode output, now as blocks visible/editable in the inserter
- [ ] Quick Links / Services render as flat lists with correct styling (not mega-nav markup) in both languages, with PL URLs pointing at PL page slugs
- [ ] About column: logo, description, social links editable per language via the Reusable Block's Polylang translation UI; changes appear on the front end without a deploy
- [ ] Contact column: same editability check for address/hours/email/phone
- [ ] `Columns: 2/3/4` control adds/removes Holders to match, without silently discarding a Holder's content when going down a step
- [ ] Strategy A: `Mobile layout: 1/2` control changes `--kt-sg-cols-mobile` independently of the desktop column count (e.g. 4 desktop → 2 mobile, 3 desktop → 1 mobile), collapsing at the same breakpoint the theme's `mobile:`/`desktop:` utility classes already use (`variables.scss`'s `$breakpoint-mobile`, not the Customizer's `mobile_breakpoint`)
- [ ] Strategy B: two independent `simple-grid` instances, each with `responsiveDisplay` set to hide at the opposite breakpoint, show/hide correctly with no flash-of-both-visible on load
- [ ] Strategy B: a mobile-only instance referencing a distinct `wp_navigation` slug (e.g. `footer-mobile-links`) renders different links than the desktop instance, in both languages
- [ ] Homepage (`index.html`, previously Path A) — mobile footer menu and content protection now present (previously missing on this template)
- [ ] All eight templates render the same footer structure, EN and PL
- [ ] `pll_get_post()`/`pll_get_post_types` fallback: temporarily untranslated `wp_navigation`/`wp_block` posts fall back to the English version instead of rendering empty
- [ ] Delete `footer-pl.html`, `footer-dynamic.php`'s old locale branch, and the shortcode registrations only after all of the above pass

---

## Gotchas

**`pll_get_post()` returns `false` when no translation exists** — the shared resolver must fall back to the original post, matching the header migration's rule: a fallback-language footer section beats a missing one.

**`get_page_by_path()` works for any non-hierarchical post type slug lookup**, including `wp_block` and `wp_navigation` — confirmed by the existing navigation resolution code; no new WP_Query needed for the resolver.

**Reusable Block translation depends on your Polylang version/settings** — verify `wp_block` shows up under Settings → Languages → Custom Post Types (or add the `pll_get_post_types` filter above) before building `footer-about`/`footer-contact`, otherwise Polylang will silently treat them as a single shared object across languages.

**`displayMode="list"` must not touch the SVG icon-gradient-defs singleton** (`static $kt_nav_icon_grads` in `render.php`) — that output is unconditional today; check it doesn't print an unused `<svg>` block on every footer render when list mode never uses gradient icons.

**The `render_block` filter must match on `core/template-part`, not `core/pattern`** — patterns are resolved and inlined before `render_block` sees the outer block in some contexts; matching the template part itself makes the mobile-menu/protection filter apply uniformly across all eight templates instead of only the ones that happened to wrap the footer in a pattern block.

**Two pre-existing, inconsistent breakpoint systems in this theme, not introduced by this migration** — `functions/breakpoints.php`'s Customizer-driven `mobile_breakpoint`/`tablet_breakpoint` (defaults 767/1023) only feeds `window.kotlinskidevBreakpoints` for editor label text; the actual applied CSS (`src/styles/kotlinskiwind.scss`'s `mobile:`/`tablet:`/`desktop:` utility classes that `responsiveDisplay` depends on) is compiled at build time off static `variables.scss` constants (782px/1024px) and never reads the Customizer value at all. Strategy A's `mobileColumns` breakpoint must match Strategy B's static one for the footer to have one consistent "mobile starts here" threshold — don't accidentally wire Strategy A to the Customizer value thinking it's more "dynamic," it would just be dynamic in a way Strategy B isn't.

**Strategy B renders both instances into the DOM and hides one with CSS `display:none`, not a server-side conditional** — both the desktop and mobile grid's markup (including both `wp_navigation` menus' links) ship in every page's HTML regardless of viewport, same as how the header's `nav-desktop`/`nav-mobile` blocks both exist in the DOM today. This is a minor duplicate-links-in-source consideration (screen readers/SEO crawlers see both link sets) worth being aware of, but it's consistent with how the header already works, not a new tradeoff introduced by this plan.

**Lowering `Columns: 2/3/4` removes a Holder** — if the client drops from 4 columns to 3 while a Holder still has content in it (e.g. the Contact column), that content is destroyed the moment `removeBlock()` runs. Show a confirmation step in the Inspector control (WordPress's standard block-removal confirmation, or a custom one) before removing a non-empty Holder — don't let a column count change silently eat content the way `theme_switcher`'s conversion never had to worry about (it had no child content to lose).

**`mobileColumns` should probably not exceed the desktop `Columns` value** — a 2-column desktop grid set to "2 columns on mobile" is a no-op, and a hypothetical higher mobile-than-desktop count would be a strange result. Cap the `SelectControl` options for `mobileColumns` at `min(2, columns)` rather than always offering both `1` and `2`.

**Don't delete `functions/dynamic-footer.php` outright** — rename its function once the locale branching is gone (e.g. `kotlinskidev_footer_template_part_extras`) since it still owns the mobile-menu-append + protection logic, just correctly re-scoped to the template part instead of one pattern slug.

---

## Content Object — Manual Setup (required once per environment)

### Revision: one shared navigation, matching the header's model

The design below replaced an earlier draft of this section that split the footer into four separate objects (two `wp_navigation` menus + two `wp_block` reusable patterns). That's gone. The footer now uses **exactly one `wp_navigation` post — `footer`** — the same object shape as `desktop-menu`/`mobile-menu` in [header-migration-plan.md](./header-migration-plan.md): one EN original, one Polylang-managed PL translation, no per-environment slug juggling beyond the one object.

This works because `kotlinskidev/navigation`'s renderer already had a mechanism for embedding arbitrary content (image, paragraph, social-links) inside a nav post — `kotlinskidev_render_nav_extras()`, originally built for the header's mega-panels. `displayMode="list"` (the footer's mode) now reuses the same idea: any top-level block in the nav's content that isn't a link/submenu is rendered as its own column, in document order, alongside headed link groups built from `core/navigation-submenu` blocks. So the entire footer — logo, description, social links, Quick Links, Services, contact details — is authored as the content of one nav post, not scattered across four.

**Important, read before typing contact info:** do **not** use the `kotlinskidev/protected-content` block for the phone/email/address. As currently built, that block's "Use Protection" toggle writes the plain, unencrypted text straight into a `data-original-content` HTML attribute — visible in page source, not actually protected. The theme's real protection is a separate, working mechanism: `kotlinskidev_add_protection_to_content()` (in `functions/protection-helpers.php`) scans rendered HTML for `mailto:`/`tel:` links and plain-text email/phone patterns and properly RSA-encrypts them before they reach the browser — and it's already wired into the footer's template-part filter (`kotlinskidev_footer_template_part_extras()` in `functions/dynamic-footer.php`). Just write normal `mailto:`/`tel:` links in the contact group below, and turn on **Settings → Content Protection → Auto-protect Emails / Auto-protect Phone Numbers**. (The `protected-content` block's broken encryption is a separate, pre-existing issue outside this migration — flag it separately if you want it fixed.)

### 1. Create the `footer` navigation (EN)

1. Appearance → Editor → Navigation → **+** (new menu) → name it **`footer`** (the slug and the title can just both be `footer` here — unlike the earlier draft, nothing in this design needs the title to read differently on the frontend, since the nav's own title is never displayed; only its content is).
2. Open the new (empty) menu, then switch to **Code editor** (Options ⋮ → Code editor, or ⌘⌥⇧M / Ctrl+Alt+Shift+M) and paste the block below as a whole. (If Code editor isn't available in whichever navigation-editing surface your WordPress version shows, build the same structure by hand: a Group with image+paragraph+social-links, two Submenus each containing Navigation Links, and a Group with a heading + list of contact links — the "+" inserter inside nav editing does allow generic content blocks, just slower to build one-by-one.)

```html
<!-- wp:group {"layout":{"type":"constrained","contentSize":"23.75rem","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:image {"width":"12.5rem","height":"12.5rem","scale":"contain","sizeSlug":"full","linkDestination":"none","className":"kotlinskidev-logo"} -->
<figure class="wp-block-image size-full is-resized kotlinskidev-logo"><img src="/wp-content/themes/kotlinskidev/assets/images/kotlinskidev-logo.webp" alt="" style="object-fit:contain;width:12.5rem;height:12.5rem"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"textColor":"foreground-alt"} -->
<p class="has-foreground-alt-color has-text-color">Footer description</p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"iconColor":"foreground-alt-color","iconColorValue":"foreground-alt","className":"is-style-logos-only","style":{"spacing":{"blockGap":{"top":"0","left":"var:preset|spacing|40"},"margin":{"bottom":"0"}}}} -->
<ul class="wp-block-social-links has-icon-color is-style-logos-only" style="margin-bottom:0"><!-- wp:social-link {"url":"#","service":"instagram"} /--><!-- wp:social-link {"url":"#","service":"facebook"} /--><!-- wp:social-link {"url":"#","service":"linkedin"} /--><!-- wp:social-link {"url":"#","service":"x"} /--><!-- wp:social-link {"url":"#","service":"youtube"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group -->

<!-- wp:navigation-submenu {"label":"Quick Links","type":"custom","kind":"custom","url":"#"} -->
<!-- wp:navigation-link {"label":"About Us","url":"/about/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Policy","url":"/privacy-policy/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Terms and Conditions","url":"/terms-and-conditions/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Career","url":"/career/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Blog","url":"/blog/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Contact me","url":"/contact/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"FAQ","url":"/faq/","kind":"custom"} /-->
<!-- /wp:navigation-submenu -->

<!-- wp:navigation-submenu {"label":"Services","type":"custom","kind":"custom","url":"#"} -->
<!-- wp:navigation-link {"label":"Web development","url":"/web-development/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Website optimization","url":"/web-optimization/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Website performance","url":"/web-performance/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"E-commerce","url":"/e-commerce/","kind":"custom"} /-->
<!-- /wp:navigation-submenu -->

<!-- wp:group -->
<div class="wp-block-group">
<!-- wp:heading {"level":3,"fontSize":"medium"} -->
<h3 class="wp-block-heading has-medium-font-size">Contact me</h3>
<!-- /wp:heading -->

<!-- wp:list {"className":"is-style-list-style-no-bullet","fontSize":"small"} -->
<ul class="wp-block-list is-style-list-style-no-bullet has-small-font-size"><!-- wp:list-item -->
<li><a href="https://maps.app.goo.gl/WaB16BznSwfbX1LN8" target="_blank" rel="noreferrer noopener">Poland, 40-143 Katowice, ul.Dekerta</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Monday - Friday 8:00 a.m. - 5:00 p.m</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><a href="mailto:kotlinskidev@gmail.com">kotlinskidev@gmail.com</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><a href="tel:608418911">+48 608 418 911</a></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></div>
<!-- /wp:group -->
```

3. Switch back to the visual editor to confirm it renders as four sections (logo/description/social-links, Quick Links, Services, Contact me), then save.

### 2. Translate to Polish

With the `footer` menu open, use Polylang's language panel → **Translate** → duplicate into Polish. Translate:

- The description paragraph.
- Each Quick Links / Services submenu's own **label** ("Quick Links" → "Popularne linki", "Services" → "Usługi") and each child link's label + URL to the PL page slugs.
- The Contact heading ("Contact me" → "Kontakt") and the address/hours text (from `languages/pl_PL.po`: address "Polska, 40-143 Katowice, ul.Dekerta", hours "Poniedziałek - Piątek 8:00 a.m. - 5:00 p.m").

The email/phone links stay the same in both languages.

### 3. Clear the footer template part's Site Editor customization

The `footer` template part is **customized in the Site Editor on this environment** — a `wp_template_part` post in the DB overrides `parts/footer.html` and still contains the old materialized footer markup:

1. Appearance → Editor → **Patterns** → **Template Parts** → **Footer**.
2. Open its "..." options menu → **Clear customizations**.

If this step is skipped, the DB copy keeps winning and the new footer never appears, regardless of the nav content above.

### 4. Verify

- Site Editor → the footer template part shows the logo/description/social-links, Quick Links, Services, and Contact me as four columns.
- `/` and `/pl/` (or whatever your Polish URL prefix is) render the translated footer.
- No literal `[copyrights_shortcode_here]` text anywhere (that shortcode name was never actually registered — the pre-migration footer printed it verbatim; the new `kotlinskidev/copyrights` block replaces it correctly).
- With Auto-protect Emails/Phones enabled in Settings → Content Protection, view page source on the rendered footer and confirm the email/phone no longer appear as plain `mailto:`/`tel:` text — they should be replaced with `protected-content` spans carrying an RSA-encrypted `data-original-content`, decrypted client-side on click/reveal.

### Known cosmetic difference from the pre-migration footer

The four columns (logo/description/social-links, Quick Links, Services, Contact) now render as **equal-width** columns (`.kt-nav-list` is a CSS grid sized by column count, mirroring `kt-simple-grid`'s pattern). The original footer gave the About column ~40% width and split the rest across the other three — if you want that asymmetry back, it's a small CSS change to `.kt-nav-list` in `src/styles/mega-menu.scss` (e.g. `grid-template-columns: 2fr 1fr 1fr 1fr` instead of `repeat(var(--kt-nav-list-cols), 1fr)`), just say so.

---

## Mobile Footer Bar — Manual Setup (added 2026-07-06)

The fixed bottom navigation bar on mobile no longer uses the classic menu system
(`register_nav_menus` / `wp_nav_menu` / `template-parts/mobile-footer-menu.php` — all
removed; no classic menu existed in the DB, so nothing was rendering anyway). It is now
the same `kotlinskidev/navigation` block architecture as the header and footer:

```html
<!-- wp:kotlinskidev/navigation {"menuSlug":"mobile-footer","displayMode":"bar"} /-->
```

This lives at the end of `parts/footer.html`. The block resolves the `wp_navigation`
post with slug `mobile-footer` through Polylang (same as `footer`, `desktop-menu`,
`mobile-menu`) and renders nothing until that post exists.

### 1. Create the `mobile-footer` navigation (EN)

1. wp-admin → Appearance → Editor → Navigation → Create new (or via a temporary
   Navigation block) — name it `mobile-footer` so the slug becomes `mobile-footer`.
2. Add plain **Custom Link / Page Link** items only — one per bar slot (3–5 items work
   best; they share the width evenly). Submenus are ignored in bar mode.
3. Optional icon per link: select the link → block settings → the theme's **Nav icon**
   control (SVG from the media library, same `navIconId` mechanism as the header mega
   menu). It renders above the label inside `.mobile-menu-icon`.

### 2. Translate to Polish

Polylang → translate the `mobile-footer` navigation post exactly like the `footer` one.
The block resolves the correct language automatically.

### 3. Verify

- Frontend < desktop breakpoint: fixed translucent bar at the bottom, adapts to
  light/dark mode, hides on scroll down (`hide-nav-on-scroll.ts` targets
  `.mobile-footer-nav`, unchanged).
- Desktop: hidden (`display: none` above the breakpoint).
- Footer bottom margin appears only when the bar exists
  (`body:has(.mobile-footer-nav)` rule in `mobile-footer-menu.scss`).
