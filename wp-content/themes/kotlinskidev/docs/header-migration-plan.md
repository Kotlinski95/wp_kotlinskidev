# Header Block Migration Plan

Convert the header from a monolithic PHP shortcode architecture to fully block-editor-manageable FSE blocks, keeping all current functionality (hamburger menu, theme switcher, language selector, social icons, navigation).

---

## Target Block Structure

```
<!-- wp:group {"tagName":"header"} -->
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->

    <!-- wp:site-logo /-->

    <!-- wp:group {"metadata":{"name":"Header Controls"},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
      <!-- wp:kotlinskidev/theme-switcher /-->

      <!-- wp:kotlinskidev/responsive-display {"hideOnMobile":true} -->
        <!-- wp:kotlinskidev/navigation {"menuSlug":"desktop-menu"} /-->
      <!-- /wp:kotlinskidev/responsive-display -->

      <!-- wp:kotlinskidev/responsive-display {"hideOnDesktop":true} -->
        <!-- wp:kotlinskidev/navigation {"menuSlug":"mobile-menu","overlayMenu":"always"} /-->
      <!-- /wp:kotlinskidev/responsive-display -->
    <!-- /wp:group -->

  <!-- /wp:group -->
<!-- /wp:group -->
```

---

## Why `ref` IDs are not used

`core/navigation` stores `{"ref": 123}` where `123` is the database primary key of a `wp_navigation` post. That ID is local to the WordPress database — it will be a different number on staging, production, or any future environment. Hardcoding it into `header.html` silently breaks the menu on every deployment.

Instead, the `kotlinskidev/navigation` custom block accepts a human-readable `menuSlug` attribute. The `render.php` looks up the `wp_navigation` post by slug (environment-independent), then calls `pll_get_post()` to retrieve the translated version for the current language. In the template you write `{"menuSlug":"desktop-menu"}` — readable, portable, and Polylang-aware without any per-language branching in the template.

---

## Dynamic menu resolution (Polylang-aware)

```php
// render.php pattern for kotlinskidev/navigation
$slug = $attributes['menuSlug'] ?? '';
$nav_post = get_page_by_path($slug, OBJECT, 'wp_navigation');
if (!$nav_post) return '';

$nav_id = $nav_post->ID;
if (function_exists('pll_get_post')) {
    $translated = pll_get_post($nav_id);
    if ($translated) {
        $nav_id = $translated;
    }
}

echo render_block([
    'blockName'    => 'core/navigation',
    'attrs'        => array_merge(['ref' => $nav_id], $attributes['blockAttrs'] ?? []),
    'innerBlocks'  => [],
    'innerHTML'    => '',
    'innerContent' => [],
]);
```

**Adding a third language later:** create a new `wp_navigation` translation for that language in the Site Editor and assign it as a Polylang translation of the original. No changes to `header.html`, `block.json`, or `render.php`.

---

## Navigation post naming convention

| Slug | Purpose |
|---|---|
| `desktop-menu` | Primary nav, desktop — EN original; Polylang manages PL translation |
| `mobile-menu` | Hamburger nav, mobile — EN original; Polylang manages PL translation |

Create these in **Appearance → Editor → Navigation**. Polylang will prompt to translate each one.

---

## What each nav post contains

**`desktop-menu`**
- Navigation links (Home, About, Services, Contact…)
- `core/polylang/navigation-language-switcher` as last item

**`mobile-menu`**
- Same navigation links
- `core/polylang/navigation-language-switcher`
- `core/social-links` as last item (appears in the overlay drawer)

---

## Current State Summary

`parts/header.html` → pattern `kotlinskidev/header` → `wp:kotlinskidev/navigation` (server-renders `navigation.php`)

`navigation.php` outputs:
- `#page-loader` spinner (unrelated to navigation — needs to move out)
- `.header-wrapper > .header-right` containing:
  - `[theme_switcher]` — button with checkbox+label + SVG icons, driven by `critical.ts` + `theme-switcher.ts`
  - Hamburger button — custom checkbox+label animation (`mobile-only tablet-only`)
  - Desktop nav via `wp_nav_menu('primary')` (`.hide-mobile.hide-tablet`)
  - Mobile overlay via `wp_nav_menu('mobile')` (`mobile-only tablet-only`)
  - Social links at bottom of mobile drawer via `wp_nav_menu('social')`

---

## Step 1 — Move `#page-loader` out of the navigation

`#page-loader` is unrelated to navigation but lives inside `navigation.php`.

**Files:**
- `functions/navigation.php` — delete the `#page-loader` + `.spinner` div
- `functions/page-loader.php` — new file, hook output via `add_action('wp_body_open', ...)`
- `functions.php` — add `require` for the new file

---

## Step 2 — Create `kotlinskidev/theme-switcher` block

The existing JS (`critical.ts` + `src/scripts/theme-switcher.ts`) finds `.theme-switcher` by class — stays completely untouched. The block renders the same HTML as the current shortcode.

**Files to create:**
- `src/blocks/theme-switcher/block.json` — server-rendered, `"render": "file:./render.php"`, `"inserter": false`
- `src/blocks/theme-switcher/render.php` — calls `kotlinskidev_theme_switcher_shortcode()`
- `src/blocks/theme-switcher/index.tsx` — edit component using `ServerSideRender`

**Files to update:**
- `webpack.config.js` — add `theme-switcher` entry pointing to `src/blocks/theme-switcher/index.tsx`
- `functions/blocks.php` — add `register_block_type` for `src/blocks/theme-switcher`

The `[theme_switcher]` shortcode stays registered — `render.php` calls it and nothing else breaks.

**Run after this step:** `npm run build`

---

## Step 3 — Repurpose `kotlinskidev/navigation` as a dynamic slug-based renderer

Do **not** replace this block with `core/navigation` directly. Instead, extend it:

**`block.json` changes:**
- Add `menuSlug` string attribute (default `""`)
- Add `overlayMenu` string attribute (default `"never"`)
- Keep `"inserter": false`

**`render.php` rewrite:**
- Look up `wp_navigation` post by `menuSlug` attribute
- Call `pll_get_post()` for Polylang translation
- Delegate to `render_block()` with `core/navigation` and the resolved ID
- See dynamic resolution pattern above

**`index.tsx` update:**
- Add `TextControl` (or `SelectControl`) in `InspectorControls` to set `menuSlug`
- Pass `overlayMenu` attribute through to `ServerSideRender` for live preview

**Header template (`parts/header.html`):**
- Two `kotlinskidev/navigation` blocks — one for desktop (inside `responsive-display`), one for mobile hamburger
- No `ref` IDs anywhere

**Create navigation posts in Site Editor before testing:**
1. Go to **Appearance → Editor → Navigation**
2. Create `desktop-menu` (EN) with nav links + language switcher
3. Create `mobile-menu` (EN) with nav links + language switcher + social links
4. Use Polylang to create PL translations of each
5. Verify slugs match the `menuSlug` values used in `header.html`

---

## Step 4 — CSS migration (`src/styles/nav.scss`)

All current selectors targeting the shortcode's custom HTML go away. New targets from `wp:navigation`:

| Old selector | New selector |
|---|---|
| `#hamburger-button` | `.wp-block-navigation__responsive-container-open` |
| `#hamburger-menu` (overlay drawer) | `.wp-block-navigation__responsive-container` |
| `.navigation .menu-items` | `.wp-block-navigation__container` |
| `.hamburger-container` | `.wp-block-navigation__responsive-container--is-menu-open` |
| `.header-right` | Remove — structure comes from block flex group |
| `.header-wrapper` | Remove — replaced by `wp:group` constrained layout |

**Hamburger icon:** The built-in button renders its own icon. Replace it entirely with CSS `::before`/`::after` pseudo-elements on `.wp-block-navigation__responsive-container-open`. Open/close state toggle targets the `.is-menu-open` class added by the block.

**Social links in overlay:** Use `flex` + `margin-top: auto` on `core/social-links` inside the overlay container to push it to the bottom of the drawer.

**Editor overrides** (`src/styles/editor-overrides.scss`): add rules to disable `header::after` transitions, `backdrop-filter`, and `box-shadow` inside the editor.

---

## Step 5 — Rewrite `parts/header.html`

Full rewrite to the target block structure. This is the atomic change that goes live. Test on both desktop and mobile in EN and PL before deploying.

Pattern `patterns/header.php` mirrors `parts/header.html` — update it to match.

---

## Step 6 — Clean up deprecated code

Only after confirming everything works on the frontend in all languages.

| File/Entry | Action |
|---|---|
| `functions/navigation.php` | Delete (shortcode no longer called) |
| `webpack.config.js` | Keep `navigation` entry (block is still used, now repurposed) |
| `functions/blocks.php` | Keep `kotlinskidev/navigation` registration |
| `functions/menus.php` | Delete — `register_nav_menus()` is unused in FSE |
| `functions/theme-setup.php` | Remove duplicate `register_nav_menus(['primary' => ...])` call |
| `functions/language-switcher.php` | Keep (shortcode may be used elsewhere) |

---

## Gotchas

**`display: none` on `.header-right`** — currently the header is hidden until JS runs to prevent FOUC from the theme switcher state. With native blocks this is not needed; `critical.ts` applies theme classes before paint and CSS handles the rest. Remove the `display: none` + JS reveal pattern entirely.

**Theme switcher position** — sits outside `kotlinskidev/navigation` as a sibling in the flex row, always visible on all breakpoints.

**`critical.ts` stays untouched** — the IIFE that reads localStorage and applies `.dark-mode`/`.light-mode` before first paint must remain inlined in `<head>`.

**Polylang `pll_get_post()` returns `false` when no translation exists** — always fall back to the original post ID in that case (the English version is always better than nothing).

**`core/social-links` inside the overlay** — the overlay renders all inner blocks of `core/navigation`, including `core/social-links`. It will also appear in the desktop nav if the same nav post is used for both breakpoints — which is why desktop and mobile use separate nav posts (`desktop-menu` vs `mobile-menu`).

---

## Implementation Order

1. **Step 1** — page loader (smallest, fully isolated)
2. **Step 2** — theme-switcher block + `npm run build` ✓ (done)
3. **Step 3** — repurpose `kotlinskidev/navigation` with `menuSlug` attribute + create nav posts in Site Editor
4. **Step 4** — write new CSS targeting `wp:navigation` selectors before switching live
5. **Step 5** — rewrite `parts/header.html` + `patterns/header.php` (atomic, test thoroughly)
6. **Step 6** — cleanup after confirming production is stable in all languages
