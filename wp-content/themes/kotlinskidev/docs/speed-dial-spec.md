# T30 spec: speed-dial block (`kotlinskidev/speed-dial`)

Status: draft for owner review. Once approved, this file is the source of truth for T30. It replaces "Phase 4b" in the accessibility plugin's `docs/ROADMAP.md` wherever the two differ.

The accessibility plugin's `docs/API.md` (repository `kotlinskidev-accessibility`) is the contract source for everything the theme uses from the plugin: the probe (`KOTLINSKIDEV_A11Y_API`, `kotlinskidev_a11y_api_version()`), `window.kotlinskidevA11y`, the `ka11y:*` events, `data-ka11y` actions and the `kotlinskidev_a11y_default_selectors` filter. If this spec and `API.md` differ, `API.md` wins.

Branch: `feature/T30-speed-dial`, created from `master`. PR title: `feat(T30): speed-dial block`.

Rules for every milestone:

- Strict TypeScript with no `any`. No comments in TS, PHP or SCSS. Vanilla TypeScript on the front end, with no jQuery and no React.
- Every string goes through `__()` with the `kotlinskidev` domain, or through Polylang `pll__()` for content the editor types.
- Use theme tokens only. Do not hardcode colours.
- Load assets only on pages that render the block.
- Each milestone updates `docs/treeview.md` and `CHANGELOG.md` (2-3 sentences per entry).
- `npm run verify` must pass before a commit.

## Open decisions for the owner

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | The owner wrote "egghead phone icon". The meaning is unclear. | Read it as three built-in icons: the accessibility person figure (round head, arms out), a phone handset and an envelope. The default item set is phone, email and accessibility in that order. Please confirm, or send a reference image. |
| D2 | Ship the block in `parts/footer.html` by default, or only make it available in the inserter. | Ship it in `parts/footer.html` with the three default items. Empty phone or email values render nothing, so a site with no contact settings shows only the accessibility item, or nothing at all. Note: a footer that was saved in the Site Editor is stored in the DB and does not pick up the file change. Add the block there by hand (see section 8). |
| D3 | Source of the phone and email values. | Use the site-wide Contact Card settings by default (`useSiteContact: true`, the same `kotlinskidev_get_contact_info()` that `contact-detail` uses). Each item can override the value. |
| D4 | Plain `tel:`/`mailto:` links, or the encrypted protected-content flow used by `contact-detail`. | Plain links. Protected content decrypts on an IntersectionObserver hit, and that never fires inside a closed (`hidden`) list. It also adds a REST round trip before navigation, which works against "quick call". The number and address are already public in the schema.org output (`functions/seo-schema.php`). A protected mode can be added later as an attribute. |
| D5 | Markup for the accessibility and trigger items. | Use `<button type="button" data-ka11y="open">` (or `data-ka11y="<action>"`), not `<a href="#kotlinskidev-a11y">`. A button gives native Enter and Space handling with no shim. The plugin's data-attribute surface accepts every action under every load strategy, and the plugin adds the ARIA automatically. If `window.kotlinskidevA11y.api === 1`, the theme calls the JS API (section 5.4). Otherwise the click goes to the plugin's own declarative handler. The `#kotlinskidev-a11y` hash stays available as a documented alternative, but it needs a Space-key shim for `a[role=button]`, so we do not recommend it. |
| D6 | How the speed dial and the plugin launcher share the screen. | When a speed dial has an accessibility item, set the plugin launcher mode to `hidden`, so there is only one floating entry point. The shortcut `Alt+Shift+A` still works. If the launcher stays `floating`, put the two in opposite corners. The speed dial defaults to `bottom-right` and the plugin launcher defaults to `bottom-right`, so change one of them. |
| D7 | Z-index. | Default `999`, the theme's existing floating layer (`scroll.scss`, `article-toc`, `mobile-footer-menu`, Complianz). This is below the header (`1000`-`1002`) and modals (`99999`). The value is clamped to `1..2147482999`, which keeps it strictly below the plugin token `tokens.zIndex = 2147483000` (plugin `SPEC.md`). |
| D8 | "Code blocks" in the custom item. | Allow `core/html`, `core/shortcode` and, when it is registered, `wpcode/snippet`. The `kotlinskidev_speed_dial_custom_allowed_blocks` filter can extend the list. `core/code` is excluded because it prints preformatted text and runs nothing. Please confirm that "code block" meant snippet-plugin blocks. |
| D9 | Keyboard model. | Use the APG disclosure pattern. Opening leaves focus on the toggle. The arrow that points toward the list moves focus to the first item. Arrows move between items (wrapping), and Home/End are supported. Items stay in the normal Tab order (no roving tabindex), as in plugin PHASE5 D9. Escape closes the dial and focuses the toggle. |
| D10 | Built-in icon set. | Use a small Lucide subset (ISC licence, 24 grid, stroke) stored as path data in one `icons.json` that PHP and TS both read. The same source and licence note as the plugin (PHASE5 D5). Each item can also use any SVG from the Media Library through the existing `kotlinskidev_inline_nav_icon()`. |
| D11 | Default label visibility. | `auto`: a tooltip on hover/focus for `(hover: hover)` devices, and visible labels next to the buttons on `(hover: none)` while the dial is open. Touch users cannot hover, so a label that only appears on hover is invisible to them. |
| D12 | Behaviour without JS. | The root renders with `hidden`, and `init.ts` removes it. Without JS nothing shows, which is better than a toggle that does nothing. The plugin also hides its triggers without JS. |
| D13 | `supports.multiple`. | `false`. One speed dial per page. Two fixed dials in one corner would overlap. |
| D14 | Version bump. | Minor (a new block). `npm run release --minor` inside the PR. |

## 0. Goals and non-goals

Goals:

1. A Google-style floating action button. A round `+` toggle opens a stack of round icon buttons, and the editor can add, reorder and remove any number of items.
2. Built-in item actions: `phone`, `email`, `accessibility`, `url`, `trigger` and `custom`.
3. Per-item settings: icon, label/tooltip, aria-label and colours. Block settings: position per device, open direction, label visibility, reduced-motion-safe motion, z-index and safe-area insets.
4. A correct disclosure: `aria-expanded`/`aria-controls`, arrow keys, Escape with focus return, 44 px targets, and a clean screen-reader reading.
5. Assets load only where the block renders. Dark and light themes work through tokens. Labels are translated through Polylang.

Non-goals:

- Analytics events for item clicks. Follow-up: `analytics.ts` lives in `main.js`, and importing it into a separate view bundle would duplicate it.
- Coordination with `panel-coordinator.ts`. Its registry is module-scoped in `main.js`, and a separate `speed-dial-init.js` bundle gets its own copy. Outside click and Escape close the dial instead.
- Drag-to-reposition, per-item scheduling and brand icons (WhatsApp, Messenger and similar). A brand icon can be uploaded as an SVG in the Media Library.
- Any change to the accessibility plugin. Only its public API (`API.md`, `api: 1`) is used.

## 1. Frozen contracts

| Contract | Value |
| --- | --- |
| Parent block | `kotlinskidev/speed-dial`, folder `src/blocks/speed-dial/` |
| Child block | `kotlinskidev/speed-dial-item`, folder `src/blocks/speed-dial/item/`, `parent: ["kotlinskidev/speed-dial"]` |
| Root hook | `[data-kt-speed-dial]` on the root, class `kt-speed-dial` |
| Item hook | `.kt-speed-dial__item` (`li`), action element `.kt-speed-dial__action` |
| A11y hook | `data-kt-speed-dial-a11y="<action>"` on accessibility and trigger actions |
| Build outputs | `build/js/speed-dial.js` (editor), `build/js/speed-dial-init.js` (view), `build/css/style-speed-dial.css` |
| PHP module | `functions/speed-dial.php`, prefix `kotlinskidev_speed_dial_` |
| Filters | `kotlinskidev_speed_dial_custom_allowed_blocks` (array), `kotlinskidev_speed_dial_a11y_available` (bool) |
| Plugin API used | `window.kotlinskidevA11y` (`api === 1`, `open(opener)`, `toggle(action, opener)`), `data-ka11y`, the `ka11y:close` event and the `#ka11y-root` host. All are listed as public in `API.md`. |

## 2. block.json

### 2.1 Parent `src/blocks/speed-dial/block.json`

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "kotlinskidev/speed-dial",
  "version": "1.0.0",
  "title": "Speed Dial",
  "category": "kotlinskidev",
  "icon": "plus-alt",
  "description": "Floating + button that opens a stack of quick actions: call, email, accessibility, links and custom snippets.",
  "textdomain": "kotlinskidev",
  "editorScript": "file:../../../build/js/speed-dial.js",
  "viewScript": "file:../../../build/js/speed-dial-init.js",
  "style": "file:../../../build/css/style-speed-dial.css",
  "render": "file:./render.php",
  "providesContext": {
    "kotlinskidev/speedDialLabels": "labels"
  },
  "attributes": {
    "label": { "type": "string", "default": "" },
    "position": {
      "type": "object",
      "default": { "desktop": "bottom-right", "tablet": "bottom-right", "mobile": "bottom-right" }
    },
    "offset": {
      "type": "object",
      "default": { "desktop": { "x": 1, "y": 1 }, "tablet": { "x": 1, "y": 1 }, "mobile": { "x": 1, "y": 1 } }
    },
    "direction": { "type": "string", "enum": ["auto", "up", "down", "left", "right"], "default": "auto" },
    "labels": { "type": "string", "enum": ["auto", "tooltip", "always", "hidden"], "default": "auto" },
    "motion": { "type": "string", "enum": ["scale", "fade", "none"], "default": "scale" },
    "zIndex": { "type": "integer", "default": 999 },
    "closeOnAction": { "type": "boolean", "default": true },
    "avoidMobileNav": { "type": "boolean", "default": true },
    "toggleIcon": { "type": "string", "default": "plus" },
    "toggleIconId": { "type": "integer", "default": 0 },
    "toggleIconUrl": { "type": "string", "default": "" },
    "toggleBackgroundColor": { "type": "string", "default": "" },
    "toggleTextColor": { "type": "string", "default": "" },
    "itemBackgroundColor": { "type": "string", "default": "" },
    "itemTextColor": { "type": "string", "default": "" }
  },
  "supports": {
    "html": false,
    "reusable": false,
    "multiple": false,
    "inserter": true
  }
}
```

- `position.*` must be one of `bottom-right`, `bottom-left`, `top-right` or `top-left`. Positions are physical, not logical, so they do not flip in RTL. They describe the screen corner the owner sees.
- `offset.*.x|y` is a number in `rem`, clamped to `0..10`. The front end always adds `env(safe-area-inset-*)` on top of it.
- `direction: auto` resolves per device: `up` for bottom corners and `down` for top corners.
- The colour attributes accept a palette CSS var, hex or a gradient. They are written out as custom properties only after they pass `kotlinskidev_safe_css_value()`. M1 checks the existing helper in `functions/safe-css-gradient-vars.php` and reuses it if it fits. Otherwise M1 adds a strict allowlist regex in `functions/speed-dial.php`.
- No `supports.color`. Colours apply to the toggle and items, not to the root wrapper, so explicit attributes are simpler than skip-serialization. The same approach is used in `content-tabs`.

### 2.2 Child `src/blocks/speed-dial/item/block.json`

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "kotlinskidev/speed-dial-item",
  "version": "1.0.0",
  "title": "Speed Dial Item",
  "category": "kotlinskidev",
  "icon": "marker",
  "textdomain": "kotlinskidev",
  "render": "file:./render.php",
  "parent": ["kotlinskidev/speed-dial"],
  "usesContext": ["kotlinskidev/speedDialLabels"],
  "attributes": {
    "action": {
      "type": "string",
      "enum": ["phone", "email", "accessibility", "url", "trigger", "custom"],
      "default": "url"
    },
    "useSiteContact": { "type": "boolean", "default": true },
    "value": { "type": "string", "default": "" },
    "triggerAction": { "type": "string", "default": "" },
    "label": { "type": "string", "default": "" },
    "ariaLabel": { "type": "string", "default": "" },
    "opensInNewTab": { "type": "boolean", "default": false },
    "icon": { "type": "string", "default": "" },
    "iconId": { "type": "integer", "default": 0 },
    "iconUrl": { "type": "string", "default": "" },
    "backgroundColor": { "type": "string", "default": "" },
    "textColor": { "type": "string", "default": "" }
  },
  "supports": {
    "html": false,
    "reusable": false
  }
}
```

Defaults per action. They apply when `label` or `icon` is empty. Labels go through `__()`:

| Action | Default label | Default icon | Value source |
| --- | --- | --- | --- |
| `phone` | "Call us" | `phone` | the site contact phone, or `value` |
| `email` | "Email us" | `mail` | the site contact email, or `value` |
| `accessibility` | "Accessibility" | `accessibility` | none |
| `url` | "Open link" | `link` | `value` (URL) |
| `trigger` | "Accessibility option" | `accessibility` | `triggerAction` |
| `custom` | none (inner blocks) | none | inner blocks |

## 3. Render: server render with `InnerBlocks.Content`

Both `save.tsx` files return `<InnerBlocks.Content />`, and `render.php` builds all the markup. This is the same pattern as `content-tabs` and `content-tabs-item`. Reasons:

1. Phone and email come from site options when the page is requested, so a settings change shows up without a re-save.
2. Plugin detection (`function_exists`) and the per-device classes run on the server.
3. Labels are translated per request through Polylang (`pll__()`). One footer then serves every language.
4. Sanitisation and escaping happen in one place in PHP (`esc_url`, `sanitize_email`, the action grammar regex).
5. The markup can change without block-validation errors or `deprecated` entries.
6. The empty state is real: when no item renders, the block outputs nothing.

The child must save `InnerBlocks.Content` (not `null`) so that the inner blocks of a custom item persist. For the other actions it saves an empty string.

Following the testing rule for `scroll-section`, E2E/integration fixtures contain only block comments and never hand-typed wrapper markup.

## 4. DOM and ARIA

### 4.1 Structure (rendered)

```html
<div class="wp-block-kotlinskidev-speed-dial kt-speed-dial kt-speed-dial--motion-scale kt-speed-dial--labels-auto
            kt-speed-dial--desktop-bottom-right kt-speed-dial--tablet-bottom-right kt-speed-dial--mobile-bottom-right
            kt-speed-dial--desktop-up kt-speed-dial--tablet-up kt-speed-dial--mobile-up kt-speed-dial--avoid-mobile-nav"
     style="--kt-speed-dial-z:999;--kt-speed-dial-dx:1rem;--kt-speed-dial-dy:1rem;--kt-speed-dial-tx:1rem;..."
     data-kt-speed-dial data-close-on-action="true" hidden>
  <button type="button" class="kt-speed-dial__toggle" aria-expanded="false"
          aria-controls="kt-speed-dial-1-list" aria-label="Quick actions">
    <span class="kt-speed-dial__toggle-icon" aria-hidden="true"><svg focusable="false">...</svg></span>
  </button>
  <ul id="kt-speed-dial-1-list" class="kt-speed-dial__list" aria-label="Quick actions" hidden>
    <li class="kt-speed-dial__item">
      <a class="kt-speed-dial__action has-background has-text-color" href="tel:+48500100200"
         style="--kt-speed-dial-item-bg:...;--kt-speed-dial-item-fg:...">
        <span class="kt-speed-dial__icon" aria-hidden="true"><svg focusable="false">...</svg></span>
        <span class="kt-speed-dial__label">Call us</span>
      </a>
    </li>
    <li class="kt-speed-dial__item" data-kt-speed-dial-requires-a11y>
      <button type="button" class="kt-speed-dial__action" data-ka11y="open" data-kt-speed-dial-a11y="open">
        <span class="kt-speed-dial__icon" aria-hidden="true">...</span>
        <span class="kt-speed-dial__label">Accessibility</span>
      </button>
    </li>
    <li class="kt-speed-dial__item kt-speed-dial__item--custom">[rendered core/html or shortcode output]</li>
  </ul>
</div>
```

Rules:

- The toggle comes first in the DOM and the list second, so the reading order is "control, then content". The visual stacking comes from `flex-direction` (`column-reverse` for `up`, `row-reverse` for `left`).
- The toggle name stays the same ("Quick actions", or the `label` attribute). Only `aria-expanded` changes. Swapping the label would announce the state twice.
- The `aria-label` of the `ul` has the same text, so screen readers announce "Quick actions, list, 3 items".
- The visible label is always present in the DOM. The `labels` modes only change CSS. `hidden` uses the theme's visually-hidden utility, never `display:none`, so the accessible name never depends on CSS.
- `ariaLabel` replaces the name only when it is set, and the editor warns when it does not start with the visible label (WCAG 2.5.3 Label in Name).
- `opensInNewTab` adds `target="_blank" rel="noopener noreferrer"` and a visually hidden " (opens in a new tab)".
- Colour overrides add `has-background`/`has-text-color` so the dark-mode hover rule in `global.scss` leaves the link colour alone (scss rule "Theme-Aware Styles").
- The plugin adds `aria-controls="ka11y-root"`, `aria-expanded` and `aria-haspopup="dialog"` to `data-ka11y="open"` triggers when the page is ready. For `feature:*`/`profile:*` it adds `aria-pressed`. The theme does not set these attributes itself.
- IDs come from `wp_unique_id( 'kt-speed-dial-' )`.

### 4.2 Item render rules (`item/render.php` and `kotlinskidev_speed_dial_*` helpers)

| Action | Element | Condition to render | Sanitisation |
| --- | --- | --- | --- |
| `phone` | `a href="tel:..."` | a non-empty number | `kotlinskidev_speed_dial_tel_href()`: strip everything except `0-9` and a leading `+` |
| `email` | `a href="mailto:..."` | `is_email()` | `sanitize_email()` |
| `url` | `a href` | `esc_url()` is not empty | `esc_url()` with the default protocols |
| `accessibility` | `button data-ka11y="open"` | `kotlinskidev_speed_dial_a11y_available()` | none |
| `trigger` | `button data-ka11y="<action>"` | plugin available and the action matches `^[a-z][a-zA-Z0-9]*(?::[a-zA-Z0-9_-]+){0,2}$` | `esc_attr()` |
| `custom` | `li` wrapping `$content` | `'' !== trim( $content )` | none added. `core/html` is already gated by `unfiltered_html` at save. The shortcode output is the plugin's responsibility. |

`kotlinskidev_speed_dial_a11y_available()` returns `apply_filters( 'kotlinskidev_speed_dial_a11y_available', kotlinskidev_speed_dial_a11y_detected() )`, where the probe is `defined( 'KOTLINSKIDEV_A11Y_API' ) || function_exists( 'kotlinskidev_a11y_api_version' )`, with `kotlinskidev_a11y_get_button` kept as a fallback for older plugin versions. Accessibility and trigger items also carry `data-kt-speed-dial-requires-a11y`, so the client can hide them when the plugin is active but did not render on this request (`kotlinskidev_a11y_should_render`). In that case `#ka11y-root` is missing.

Icons: if `iconId` is set, `kotlinskidev_inline_nav_icon( $icon_id )` (Media Library SVG, `currentColor`, sanitised and cached). Otherwise the built-in `icon`, or the action default from `src/blocks/speed-dial/icons.json`, built with `aria-hidden="true" focusable="false" fill="none" stroke="currentColor"`. The path data must match `^[MmZzLlHhVvCcSsQqTtAa0-9eE.,+\s-]{1,1500}$` (the same rule as the plugin's icon filter).

Built-in slugs (D10): `plus`, `close`, `phone`, `mail`, `accessibility`, `link`, `external`, `message`, `map-pin`, `calendar`, `sparkles`, `code`, `info`.

### 4.3 Parent render rules

1. Render each inner block. Keep only the non-empty results.
2. If none remain, `return;` (this is the empty state).
3. Labels context: the child reads `$block->context['kotlinskidev/speedDialLabels']` only to add `kt-speed-dial__label--tooltip` when the mode is `tooltip`, or `auto` on hover devices. Everything else is CSS on the root.
4. Clamp `zIndex` with `kotlinskidev_speed_dial_z_index()` (`1..2147482999`, invalid gives 999). Clamp offsets with `kotlinskidev_speed_dial_offset()`.
5. Build the position and direction classes with `kotlinskidev_speed_dial_layout_classes( array $position, string $direction ): array`. Unknown values fall back to `bottom-right` and `up`.
6. Polylang: `kotlinskidev_speed_dial_translate( string $text ): string` calls `pll__()` when it exists. `functions/translated-text.php` gains `kotlinskidev/speed-dial-item` (`label`, `ariaLabel`) and `kotlinskidev/speed-dial` (`label`) in `kotlinskidev_translated_text_collect_strings()`, and `kotlinskidev/speed-dial` in the marker list. The strings then show up in Languages > Translations for the footer part.

## 5. Front-end behaviour

Files: `src/blocks/speed-dial/init.ts` (bootstrap), `controller.ts` (state and DOM), `keyboard.ts` (key mapping), `a11y-bridge.ts` (plugin bridge). No imports from `main.js` modules, only `@utils` helpers that do not pull in large dependencies.

### 5.1 Init

For each `[data-kt-speed-dial]`:

1. If `document.getElementById('ka11y-root')` is null, remove every `[data-kt-speed-dial-requires-a11y]` item. The host is printed on the server by the plugin, so it already exists at `DOMContentLoaded`.
2. If the list then has no `.kt-speed-dial__item`, leave the root `hidden` and stop.
3. Remove `hidden` from the root and attach the listeners.

### 5.2 Open and close

- `open()`: `list.hidden = false`, `toggle.ariaExpanded = "true"`, `root.classList.add("is-open")`. On the next frame, add `is-visible` (which starts the transition).
- `close({ returnFocus })`: remove `is-visible`, set `aria-expanded="false"`, then set `list.hidden = true` and remove `is-open` on `transitionend` of the list. Use a 300 ms timeout fallback, or close at once if `motion === none` or `matchMedia('(prefers-reduced-motion: reduce)')` matches.
- Toggle click: open or close.
- Outside `pointerdown` (on `document`, registered only while open): close without moving focus.
- `focusout` on the root, when `relatedTarget` is outside the root and not null: close.
- Item activation with `data-close-on-action="true"`: close after the event, without `preventDefault`, so `tel:`, `mailto:` and links navigate normally.
- `pagehide`/bfcache restore: close on `pageshow` with `persisted`.

### 5.3 Keyboard (D9)

| Key | On toggle | On an item |
| --- | --- | --- |
| Enter / Space | toggle (native button) | activate (native) |
| Arrow toward the list (`ArrowUp` for `up`, `ArrowDown` for `down`, `ArrowLeft` for `left`, `ArrowRight` for `right`) | open if closed, focus the first item | next item, wrapping |
| Arrow away from the list | none | previous item. From the first item it goes to the toggle. |
| Home / End | none | first / last item |
| Escape | close | close and focus the toggle |
| Tab / Shift+Tab | native | native. Leaving the root closes the dial (5.2). |

- "Item" means the first focusable element inside each visible `.kt-speed-dial__item`: `a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])`. Custom items without a focusable element are skipped.
- The effective direction is read from `getComputedStyle(root).getPropertyValue('--kt-speed-dial-direction')`, which CSS sets per breakpoint. This keeps the per-device direction in one place.
- Key handling ignores events that have `event.defaultPrevented` set, events with modifier keys, and events coming from `input`/`textarea`/`select` inside custom items.

### 5.4 Accessibility plugin bridge (D5)

```ts
interface KotlinskidevA11yApi {
  api: number;
  open(opener?: HTMLElement | null): void;
  toggle(target?: string, opener?: HTMLElement | null): void;
}
```

- One `window.addEventListener("click", onBridgeClick, true)`. A window capture listener runs before the plugin's document capture listener.
- `onBridgeClick`: find `target.closest("[data-kt-speed-dial-a11y]")` inside a speed dial. If `window.kotlinskidevA11y?.api === 1`: call `preventDefault()` and `stopPropagation()`, then `open(toggle)` for `open`, or `toggle(action, toggle)` for any other action. Then close the dial. The opener is the speed-dial toggle, so the plugin returns focus to the visible toggle and not to a hidden item.
- Fallback when the API is not installed yet (the `interaction` or `idle` load strategy): do nothing, and let the click reach the plugin's `data-ka11y` resolution, which loads the kernel and runs the action. Remember the root as `pendingOpener`.
- `document.addEventListener("ka11y:close", ...)`: if `pendingOpener` is set and `document.activeElement` is `body` or inside a hidden list, focus that root's toggle and clear it.
- Only our own elements are stopped. The `API.md` security note about capture listeners does not apply to other triggers.

### 5.5 Mobile footer nav

Add `.kt-speed-dial` to `floatingIconSelectors` in `src/scripts/hide-nav-on-scroll.ts`, so it gets `mobile-nav-hidden` together with Scroll to Top, the TOC toggle and Complianz. CSS lifts the dial above `$mobile-footer-nav` while the bar is shown. This adds about 20 B to `main.js`.

## 6. Styles (`src/blocks/speed-dial/style.scss`)

- `.kt-speed-dial { position: fixed; z-index: var(--kt-speed-dial-z, 999); display: flex; gap: var(--wp--preset--spacing--small); align-items: center; pointer-events: none; }`. The toggle and the open list get `pointer-events: auto`, so the closed dial never blocks clicks on the page behind it.
- Corners per device use the theme's build-token breakpoints, because `functions/breakpoints.php` rewrites `48.8125rem`, `48.875rem`, `63.9375rem` and `64rem` at build time. Use the variables in `variables.scss`, not raw px. Each corner class sets `inset-block-*`/`inset-inline-*` (physical `top/bottom/left/right`) to `calc(var(--kt-speed-dial-{d}y) + env(safe-area-inset-bottom))`, and the matching side to `+ env(safe-area-inset-left|right)`. The same corner class sets `--kt-speed-dial-direction`.
- `.kt-speed-dial--avoid-mobile-nav` below the mobile breakpoint adds `$mobile-footer-nav` to the bottom offset. `.mobile-nav-hidden` removes it with the same `transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)` as `scroll.scss`.
- Toggle 3.5rem (56 px) and actions 3rem (48 px) round. Both are at least 44 px (WCAG 2.5.5 AAA). Spacing between targets is at least 0.5rem.
- Colours: toggle `background: var(--kt-speed-dial-toggle-bg, var(--wp--preset--color--primary))`, `color: var(--kt-speed-dial-toggle-fg, var(--wp--preset--color--primary-contrast))`. Items use `--wp--preset--color--surface` / `--wp--preset--color--foreground`, with `box-shadow: var(--wp--preset--shadow--medium-elevation)`. Adaptive `light-dark()` palette tokens handle dark and light, so no `body.dark-mode` overrides should be needed. Add one only if a contrast check fails.
- Focus: `outline: 0.1875rem solid var(--wp--preset--color--primary); outline-offset: 0.125rem` on `:focus-visible`. Never removed.
- Motion: only `transform` and `opacity`. `scale`: items go from `scale(0.6) translate(direction 0.5rem)`, opacity 0, to their final state with a 30 ms per-item stagger through `--kt-speed-dial-index` (set inline per `li` on the server). The toggle icon rotates 45 deg (plus becomes an x). `fade`: opacity only. `none` or `@media (prefers-reduced-motion: reduce)`: no transition and no rotation, and the close icon swaps in.
- Labels: `always` shows a pill beside the button, on the side away from the screen edge. `tooltip` uses the existing `.kt-tooltip` look from `icon.scss` if it can be reused. If not, a scoped copy of it. `auto` means tooltip under `(hover: hover)` and always under `(hover: none)`.
- `@media (forced-colors: active)`: `border: 1px solid ButtonText` on the toggle and the actions, and `forced-color-adjust: none` only on the SVG strokes that use `currentColor`.
- Editor (`.editor-styles-wrapper .kt-speed-dial`): `position: static`, list always shown, no transitions, so the block can be edited inside the footer canvas.
- Do not place it inside `.main-wrapper`. Its persistent GSAP pin transform breaks `position: fixed` descendants (see section 8).

## 7. Editor

- `index.ts` registers the item first, then the parent (as in `content-tabs/index.ts`) and imports `./style.scss`.
- Parent `edit.tsx`: `useInnerBlocksProps` with `allowedBlocks: ["kotlinskidev/speed-dial-item"]`, `template` `[["kotlinskidev/speed-dial-item",{action:"phone"}],[...,{action:"email"}],[...,{action:"accessibility"}]]`, `orientation: "vertical"` and `renderAppender: ButtonBlockAppender`. Inspector panels:
  - Layout: position per device, using the Desktop/Tablet/Mobile headings of `responsive-display`, a `SelectControl` and offset `RangeControl`s.
  - Behaviour: direction, labels, motion, close on action, avoid mobile nav, z-index `NumberControl` with the 2147482999 cap.
  - Toggle: label, icon, Media Library icon through `NavIconPicker` from `src/blocks/shared/nav-icon-picker.tsx`.
  - Colours: the `PanelColorGradientSettings` rule in `typescript.md`.
  - An info `Notice` when an accessibility or trigger item exists, recommending launcher mode `hidden` (D6).
- Item `edit.tsx`: an action `SelectControl`, and the fields for that action:
  - `phone`/`email`: a `useSiteContact` toggle, then `value`.
  - `url`: `__experimentalLinkControl` (as in `kotlinskidev/button`).
  - `trigger`: a `ComboboxControl` filled from `GET kotlinskidev-a11y/v1/trigger-options` through `apiFetch` (features become `feature:<key>`, profiles become `profile:<key>`, plus `open`, `close`, `toggle`, `reset`), with free text checked against the grammar. When the request returns 404 (plugin inactive) it shows a `Notice`.
  - `custom`: `InnerBlocks` with `allowedBlocks` from `window.kotlinskidevSpeedDial.customAllowedBlocks`, which is localised from the PHP filter (D8).
  - Every action also gets label, aria-label (with the WCAG 2.5.3 warning), icon (a built-in `SelectControl` with previews, or `NavIconPicker`) and colours.
  - The canvas shows the round button with icon and label, and the toolbar has an "Action" dropdown.
- Cross-cutting extensions skip both blocks, because a fixed widget must not get scroll reveal, a `kt-position-*` class or GSAP pinning. Add `kotlinskidev/speed-dial` and `kotlinskidev/speed-dial-item` to the exclusion lists in `scroll-animations/index.tsx`, `position-z-index-controls/index.tsx`, `scroll-section-pin-boundary/index.tsx` and `hover-animation-controls/index.tsx`. `responsive-display` stays enabled: its `desktop:none`/`tablet:none`/`mobile:none` classes are the per-device hide.

## 8. Placement guidance

- Recommended: `parts/footer.html`, as the last child of the footer, next to `kotlinskidev/scroll-to-top`. The footer template part is a sibling of `<main class="main-wrapper">`, so `position: fixed` works there. Inside `main` (pinned scroll sections) it does not.
- Site Editor: if the footer part was customised in the DB, open Appearance > Editor > Patterns > Footer and insert "Speed Dial". The file change alone will not show up.
- Corners: Scroll to Top and the TOC toggle sit `bottom-right`, and Complianz "manage consent" sits `bottom-left`. With the default `bottom-right` plus `avoidMobileNav`, set `offset.y` so the dial stacks above Scroll to Top (`4rem` desktop), or move Scroll to Top to the bar variant. The E2E test in M7 checks that the bounding boxes do not overlap at 1280x800 and 390x844.
- Accessibility plugin: set the launcher to `hidden` (D6). The admin warning "hidden and no trigger on the home page" stays silent, because the speed-dial button carries `data-ka11y`.
- Polylang: translate the item labels in Languages > Translations. The strings are registered when an admin request loads (`translated-text.php` scan).

## 9. Asset budget

| Asset | Estimate | Budget entry (`bin/asset-budget.json` `files`) |
| --- | --- | --- |
| `build/js/speed-dial-init.js` | 2.4-3.2 KB raw min, about 1.3 KB gzip (four small modules, no deps) | `4096` |
| `build/css/style-speed-dial.css` | 3.5-5 KB raw (3 devices x 4 corners, motion, forced colours) | `8192` |
| `build/js/speed-dial.js` (editor only) | 10-16 KB raw | none (editor bundles are not budgeted) |
| `build/js/main.js` | +20 B (one selector) | unchanged `60000` |
| `icons.json` | about 2.5 KB raw, inlined into the editor bundle. On the front end only the SVGs in use are printed. | none |

If CSS goes over budget, cut it in this order: drop the `tablet` corner rules when tablet equals desktop (emit only the classes in use, with media queries per class), then shorten the motion keyframes. Run `npm run analyze` before and after, as in the bundle-analysis workflow.

## 10. Test plan

### 10.1 PHPUnit unit (`tests/unit/SpeedDialTest.php`, Pest + Brain Monkey)

- `kotlinskidev_speed_dial_tel_href`: `+48 500-100-200` gives `tel:+48500100200`. An inner `+` is stripped, empty gives `''`, and letters are stripped.
- `kotlinskidev_speed_dial_z_index`: `0` gives 1, `2147483000` gives 2147482999, a string or null gives 999.
- `kotlinskidev_speed_dial_offset`: clamps to `0..10` and is unit-safe.
- `kotlinskidev_speed_dial_layout_classes`: every corner and direction, unknown values fall back, and `auto` resolves per corner.
- `kotlinskidev_speed_dial_is_valid_trigger_action`: `open`, `profile:adhdFriendly` and `feature:biggerText:2` pass. `Open`, `feature:`, `a:b:c:d` and `<x>` fail.
- `kotlinskidev_speed_dial_icon_svg`: a known slug gives an SVG with `aria-hidden` and `stroke="currentColor"`, an unknown slug gives `''`, and tampered path data is rejected.
- `kotlinskidev_speed_dial_a11y_available`: the filter overrides it.
- `kotlinskidev_speed_dial_custom_allowed_blocks`: defaults include `core/html` and `core/shortcode`, and `wpcode/snippet` only when it is registered.

### 10.2 PHPUnit integration (`tests/integration/tests/SpeedDialTest.php`, through `render_block(parse_blocks(...))`)

- Three items with the site phone and email options set: one toggle, `aria-expanded="false"`, an `aria-controls` that matches the `ul` id, the `ul` is `hidden`, and there are 3 `li`.
- The phone option is empty and `useSiteContact` is on: that item is missing.
- All items are empty: the output is `''`.
- Plugin unavailable (filter false): no `data-ka11y` in the output.
- `trigger` with an invalid action: the item is missing.
- `url` with `javascript:alert(1)`: the item is missing.
- `custom` with `core/shortcode` `[gallery]`: the shortcode output is inside `li.kt-speed-dial__item--custom`.
- `opensInNewTab`: `rel="noopener noreferrer"` and the visually hidden text.
- Polylang absent: the labels are the raw attribute values. With a stubbed `pll__`: the translated value.
- `zIndex: 99999999999` gives `--kt-speed-dial-z:2147482999`.
- Responsive display `{"responsiveDisplay":{"mobile":{"display":"none"}}}` gives `mobile:none` on the root (the filter is still applied).
- The translated-text collector registers the speed-dial labels.
- Run the full `composer test:integration` once (the rule about the shared script registry).

### 10.3 Jest (co-located)

- `init.test.ts`: no `#ka11y-root` removes the a11y items. Zero items keeps the root hidden. Otherwise the root is unhidden.
- `controller.test.ts`: open/close toggles `hidden`, `aria-expanded`, `is-open`, `is-visible`. Reduced motion closes synchronously. An outside pointerdown closes. Focus out closes. An item click with close-on-action closes and does not call `preventDefault`. `pageshow` persisted closes.
- `keyboard.test.ts`: every direction mapping in 5.3, wrapping, Home/End, Escape returns focus, modifier keys are ignored, a custom item without focusables is skipped, and input fields inside custom items are left alone.
- `a11y-bridge.test.ts`: with an API stub, `open(toggle)` and `toggle('profile:adhdFriendly', toggle)` are called and propagation stops before a document capture spy. Without the API, the document capture spy receives the event. `ka11y:close` refocuses the toggle only when `pendingOpener` is set. Track window/document listeners in `beforeEach`/`afterEach` (testing rule).
- `edit.test.tsx` (parent and item): template inserted, action switch shows the right fields, trigger-options 404 shows the Notice, the aria-label warning shows. Mock `@wordpress/api-fetch`.
- `index.test.ts`: both blocks registered, child `parent` restriction.
- `hide-nav-on-scroll.test.ts`: `.kt-speed-dial` gets `mobile-nav-hidden`.

### 10.4 Playwright (`tests/e2e/speed-dial.spec.ts`, `tests/e2e/editor/speed-dial.spec.ts`)

- Fixture page created with WP-CLI `execFileSync` (block comments only, as in `content-tabs.spec.ts`). Cleanup is verified with `wp post list --name`.
- Frontend: the toggle is visible at the configured corner. Tab reaches the toggle, Enter opens it, ArrowUp focuses the first item, Escape closes and focus is back on the toggle. All targets are at least 44x44 (`getBoundingClientRect`). `href` starts with `tel:`/`mailto:` (asserted by shape, not value). The axe check passes open and closed.
- Mobile 390x844: offset above `.mobile-footer-nav` and no overlap with `.kotlinskidev-scrollto-top`/`.cmplz-manage-consent`. Scrolling down (`mobile-nav-hidden`) lowers it.
- Reduced motion on (the default) and a `no-preference` block: the transition runs and the state is correct after `transitionend`.
- Accessibility plugin: if `#ka11y-root` is absent, use `test.skip` with a reason. If it is present, clicking the item opens `#ka11y-panel` and closing returns focus to the speed-dial toggle.
- Editor: insert the block, the 3 default items appear, add a `url` item, reorder, save, and the reloaded post shows no invalid-block warning.

### 10.5 Storybook

- `src/blocks/speed-dial/edit.stories.tsx`: `Default` (3 items), `AllActions`, `TopLeftDown`, `LabelsAlways`. Follow `/storybook` and `content-tabs/edit.stories.tsx` (`RealBlockEdit`, `getDefaultAttributes`). Mock `apiFetch` for trigger options. Check that `npm run build-storybook` renders it without a blank canvas (`docs/storybook.md` gotcha: pass the full `metadata`).

### 10.6 Manual

- VoiceOver on iOS Safari, VoiceOver on macOS and NVDA with Firefox: "Quick actions, collapsed, button", then expanded, then the list with N items, then each item name.
- Light and dark mode contrast on the toggle and items (at least 3:1 for the graphic, 4.5:1 for the label text) with computed colours.
- RTL (`he_IL` test locale): the physical corner is kept and the labels sit on the inner side.

## 11. Milestones

### T30.1 Scaffold, metadata, PHP helpers (coder)

Depends on: owner answers D1-D14.

Files: `src/blocks/speed-dial/block.json`, `item/block.json`, `icons.json`, `index.ts` (registration with placeholder edit), `save.tsx`, `item/save.tsx`, `functions/speed-dial.php` (all helpers from 10.1), `functions.php` (require after `cache.php`), `functions/blocks.php` (two `register_block_type` calls), `tests/unit/SpeedDialTest.php`.

Acceptance: `npm run build` emits `speed-dial.js`. The blocks show in the inserter (with no settings yet). The 10.1 tests are green. `npm run lint:js` and `composer test:unit` are green.

Rollback: revert. Nothing renders yet.

### T30.2 Server render and Polylang (coder, then security-reviewer)

Depends on: T30.1.

Files: `src/blocks/speed-dial/render.php`, `item/render.php`, `functions/translated-text.php` (collector and markers), `functions/speed-dial.php` (localise `customAllowedBlocks` on `enqueue_block_editor_assets`), `tests/integration/tests/SpeedDialTest.php`.

Acceptance: 10.2 is green in the full suite. The reviewer confirms that every output is escaped, a `javascript:` URL is dropped and the trigger regex matches `API.md`.

Rollback: revert. The block saves its inner blocks and outputs nothing.

### T30.3 Editor UI and Storybook (coder)

Depends on: T30.1. Can run in parallel with T30.2.

Files: `src/blocks/speed-dial/edit.tsx`, `item/edit.tsx`, `item/action-fields.tsx`, `icon-select.tsx`, `edit.test.tsx`, `item/edit.test.tsx`, `index.test.ts`, `edit.stories.tsx`. Exclusion lists in `scroll-animations/index.tsx`, `position-z-index-controls/index.tsx`, `scroll-section-pin-boundary/index.tsx` and `hover-animation-controls/index.tsx`, with their tests updated.

Acceptance: 10.3 edit and index cases pass and 10.5 renders. Inserting, reordering and removing items works in the Site Editor footer. `npm run lint:i18n:js` passes.

Rollback: revert. The placeholder edit from T30.1 comes back.

### T30.4 Front-end behaviour (coder, then accessibility-reviewer)

Depends on: T30.2 (markup contract).

Files: `src/blocks/speed-dial/init.ts`, `controller.ts`, `keyboard.ts`, `a11y-bridge.ts`, their `*.test.ts` files, `src/scripts/hide-nav-on-scroll.ts`, `src/scripts/hide-nav-on-scroll.test.ts`. Add `viewScript` to `block.json`.

Acceptance: 10.3 behaviour cases pass. The reviewer checks section 5.3 against the APG disclosure pattern and confirms focus return through the plugin bridge on a local site with the plugin active.

Rollback: revert the view files and remove `viewScript`. The root stays `hidden` (D12), so nothing broken shows.

### T30.5 Styles, motion, budget (coder, then accessibility-reviewer and performance-reviewer)

Depends on: T30.4.

Files: `src/blocks/speed-dial/style.scss`, `src/styles/editor-overrides.scss` (static editor preview, if it does not fit in `style.scss`), `bin/asset-budget.json` (two entries from section 9).

Acceptance: `npm run check-asset-budget` passes and the numbers are in the PR. `npm run lint:css` passes. Contrast, forced colours and reduced motion are checked in Chromium emulation. Targets are at least 44 px. Light and dark both verified on the live toggle (`html.light-mode`/`dark-mode`).

Rollback: revert the SCSS and the budget entries together.

### T30.6 Translations (thinker for PL copy, then maker)

Depends on: T30.3, T30.4.

Files: `languages/kotlinskidev.pot`, `pl_PL.po`/`.mo`/`.l10n.php`, `en_US.*`, and the new `kotlinskidev-*-<md5>.json` for `speed-dial.js`.

Acceptance: `npm run i18n:check` passes with no untranslated strings. The PL labels read naturally ("Zadzwoń", "Napisz e-mail", "Dostępność", "Szybkie akcje").

Rollback: revert the language files. English fallback.

### T30.7 Placement and E2E (coder, then accessibility-reviewer)

Depends on: T30.5, T30.6, D2, D6.

Files: `parts/footer.html` (if D2 is approved), `tests/e2e/speed-dial.spec.ts`, `tests/e2e/editor/speed-dial.spec.ts`, `tests/e2e/utils.ts` (helpers only if they are reused), `docs/footer-architecture.md` (one paragraph).

Acceptance: 10.4 passes on the LocalWP site. `npm run test:patterns` passes if the footer changed. Overlap checks pass at both viewports.

Rollback: revert the footer part and the specs. The block stays available in the inserter.

### T30.8 Docs and release (maker)

Depends on: T30.7 and owner sign-off.

Files: `docs/treeview.md` (a `speed-dial/` tree plus `functions/speed-dial.php`, the tests and the footer note), `README.md` (block table row, block count), `CHANGELOG.md` (one `Added` entry, 2-3 sentences), then `npm run release --minor` (`style.css`, `package.json`, `package-lock.json`), `npm run verify`, and `graphify update .`.

Acceptance: CI version check passes. `check-version-sync` passes. The treeview lists every new file.

Rollback: revert the docs commit. The version bump is reverted together with it.

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| The dial is placed inside a transformed ancestor (`.main-wrapper`, scroll sections), so `position: fixed` breaks | Section 8 guidance, plus an editor `Notice` when the block's root ancestor is not a template part. E2E asserts the viewport position. |
| The dial overlaps Scroll to Top, the TOC toggle, Complianz or the plugin launcher | D6 and the section 8 offsets. The E2E overlap check in T30.7. |
| The plugin changes its trigger contract | Only `api: 1` surfaces from `API.md` are used. Its deprecation policy gives one minor release with a `console.warn`. The bridge checks `api === 1` and otherwise falls back to the declarative path. |
| The window capture listener conflicts with another script | It is scoped to `[data-kt-speed-dial-a11y]` inside `[data-kt-speed-dial]` and stops propagation only when the API handled the action. |
| `core/html` in a custom item is an XSS path | It is gated by the `unfiltered_html` capability at save time, as everywhere else. Security review in T30.2. Documented in the PR. |
| A shortcode prints a block of markup that breaks the round layout | Custom items get `li.kt-speed-dial__item--custom` with `max-inline-size` and no forced round shape. Editors can see the result in the preview. |
| Site Editor DB copy of the footer hides the file change | Section 8 note. The E2E fixture does not depend on the footer. |
| A per-device CSS matrix exceeds the budget | Emit classes only for the corners in use. Section 9 cut order. |
| Arrow keys clash with screen-reader browse mode | Arrows act only when focus is on the dial's own controls. Tab order stays complete (D9). |
