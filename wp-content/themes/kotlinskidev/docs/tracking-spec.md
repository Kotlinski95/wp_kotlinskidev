# Analytics Tracking Spec

Every custom event this theme tracks, where it's fired from, which analytics platform(s) it reaches,
and the GA4 admin configuration that's still required by hand (Google gives no API for most of this —
it has to be done once in the GA4 UI, not via code).

## How it's wired

- `functions/tracking-scripts.php` loads `gtag.js` + the Facebook Pixel, both gated behind Complianz's
  manual-blocking convention (`type="text/plain" data-category="statistics"`/`"marketing"`) — a vendor
  script only starts recording once a visitor accepts the matching consent category.
- **Every call site — every block's `init.ts`, `analytics.ts`'s delegated click handler, every inline
  PHP `<script>` — calls the same `trackEvent(name, params)` from `src/scripts/track-event.ts`.** No
  call site ever names a vendor (`gtag`/`fbq`) directly; that's the whole point of the layer below.
- `src/scripts/analytics-providers/` is where vendor-specific code lives, and the only place a new
  tracking system gets added:
  - `types.ts` — the `AnalyticsProvider` shape every vendor implements: `id`, `isReady()`, `send(name, params)`.
  - `gtag-provider.ts` / `meta-pixel-provider.ts` — one file per vendor. `isReady()` checks whether that
    vendor's own script has loaded (i.e. consent was granted for its category); `send()` makes the real
    call, translating our event names to that vendor's own vocabulary where one exists (e.g.
    `generate_lead` → Meta's standard `Lead` event; anything unmapped falls back to `fbq('trackCustom', ...)`).
  - `routing.ts` — `EVENT_PROVIDER_IDS`, one object mapping an event name to which provider(s) it
    should reach. Unlisted events default to `["gtag"]` only. This is **the single place** to control
    which platform sees which event — nothing else needs to change.
  - `track-event.ts` looks up the routed providers for an event and calls `send()` on every one that's
    `isReady()`, skipping the rest silently (no vendor loaded yet ≠ an error).
- `src/scripts/analytics.ts` is the **only** file that should ever be imported by `src/index.ts` (the
  sitewide bundle) — it owns the delegated document-level click listener and the one-time
  `page_not_found` check, on top of re-exporting `trackEvent`. Block-specific `init.ts` files import
  `track-event.ts` directly instead of `analytics.ts`, so a per-block webpack bundle never duplicates
  the sitewide listener (the providers themselves are pure/stateless, so duplicating *them* across
  bundles is harmless).
- PHP-rendered inline `<script>` tags (e.g. the contact form's success/error redirect) call
  `window.kotlinskiAnalytics.trackEvent(...)`, the one global `analytics.ts` exposes for exactly this —
  it goes through the same `track-event.ts` dispatcher as everything else.

## Turning an event on/off from wp-admin

Settings → Kotlinski.dev → Tracking → "Custom Event Tracking" lists all 9 events as checkboxes,
enabled by default. Unchecking one stops it reaching **every** platform (gtag and Meta both) — it's a
kill switch per event, not per platform. Per-platform routing stays a code decision in `routing.ts`,
since that's an engineering call (which conversion API gets which signal), not a content-admin one.

Wired via `functions/analytics-events.php`: `kotlinskidev_tracked_event_names()` is the single source of
truth both the settings checkboxes and `wp_localize_script()`'s output read from — the saved option
(`kotlinskidev_enabled_analytics_events`) is localized onto the main script as
`window.kotlinskiAnalyticsConfig.disabledEvents`, and `track-event.ts` checks it before doing anything
else, ahead of routing/provider lookup entirely.

### Adding a new tracking system (e.g. LinkedIn Insight Tag, TikTok Pixel)

1. Add its loader script to `functions/tracking-scripts.php`, consent-gated the same way.
2. New file in `analytics-providers/` implementing `AnalyticsProvider` (`isReady()` + `send()`), with
   its own event-name mapping table if it has standard events.
3. Add its id to `AnalyticsProviderId` in `types.ts`, register it in `routing.ts`'s `ALL_PROVIDERS`.
4. Add it to whichever events in `EVENT_PROVIDER_IDS` should reach it (or leave the rest on the
   `gtag`-only default).

No existing call site changes — every `trackEvent(...)` call across the whole codebase reaches the new
vendor automatically for whichever events you routed to it.

## Events

| Event | Providers | Fired from | Parameters | Trigger |
|---|---|---|---|---|
| `cta_click` | gtag | `analytics.ts` (delegated click) | `link_text`, `link_url` | Click on any `.wp-block-button__link`, `.kt-button__link`, or `.wp-element-button` not inside a `.kt-project-card` — covers every editor-authored CTA (Hire Me, Download CV, etc.) with zero per-page setup. |
| `select_content` | gtag | `analytics.ts` (delegated click) | `content_type` (`"project"`), `item_name` | Click anywhere inside a `.kt-project-card` (the project-card block template) — takes priority over `cta_click` for the card's own "View project" button. Uses GA4's reserved `select_content` name (not an invented one) so it's understood natively by GA4's own reports/templates. |
| `language_switch` | gtag | `analytics.ts` (delegated click) | `language` (hreflang), `link_url` | Click on a Polylang language-switcher link inside `.kt-lang-panel__list` or `.wp-block-polylang-language-switcher`. |
| `form_start` | gtag | `contact-form/init.ts` | `form_name` | First `focusin` into any `.contact-form-ts` field, once per page load. |
| `generate_lead` | gtag, meta | `contact-form/render.php` (inline script) | `form_name` | Page load with `?contact-success` present (after a real POST to `admin-post.php`). Reaches both GA4 (its own reserved lead-gen event name — mark as a Conversion) and Meta (mapped to the `Lead` standard event) via `routing.ts`. |
| `form_error` | gtag | `contact-form/render.php` (inline script) | `form_name`, `error_type` | Page load with `?contact-error` present. `error_type` is `captcha`, or empty for a generic failure. |
| `lightbox_open` | gtag | `gallery-lightbox/init.ts`, `image-lightbox.ts` | `item_name` (+ `item_index` for the gallery block) | Trigger click (gallery block) or overlay activation (core WP image lightbox). |
| `lightbox_navigate` | gtag | `gallery-lightbox/init.ts` | `item_index` | Swiper `slideChange` inside an open gallery-lightbox modal. |
| `page_not_found` | gtag | `analytics.ts` (load) | `page_location` | Fires once if `document.body` has WordPress's own `error404` class. |
| `read_more_click` | gtag | `line-clamp.ts` | `action` (`expand`/`collapse`) | Click on a `.kt-line-clamp-toggle` "Read more"/"Read less" button. |
| `faq_expand` | gtag | `faq-accordion.ts` | `question` | A `core/details` FAQ accordion item opening (not on close). |
| `scroll_to_top_click` | gtag | `scroll-to-top.ts` | `variant` (`fixed`/`bar`) | Click or Enter/Space on the scroll-to-top button, either variant. |
| `cookie_consent_click` | gtag | `analytics.ts` (delegated click) | — | Click on Complianz's own `.cmplz-btn.cmplz-manage-consent` button (third-party plugin markup — brittle if Complianz changes that class). |
| `accessibility_toggle_click` | gtag | `analytics.ts` (delegated click) | — | Click on the OneTap accessibility plugin's `.onetap-toggle` trigger (third-party plugin markup, same caveat as above). |
| `search_panel_open` | gtag | `search-panel.ts` | — | The `.kt-search-panel__modal` dropdown opening — before any query is typed/submitted. |
| `modal_open` | gtag | `modal-manager.ts` | `modal_id` | Any generic `kt-modal` opening (marquee items, anything else using `[data-kt-modal-target]`) — separate from `lightbox_open`, which is the gallery/image lightbox specifically. |
| `load_more_click` | gtag | `load-more.ts` | `items_revealed` | Click on a `.kt-load-more__button`. |
| `theme_mode_toggle` | gtag | `theme-switcher.ts` | `mode` (`light`/`dark`) | User-initiated dark/light toggle — not the initial load-time mode apply (stored preference or OS default), only an actual click/keypress on the switch. |
| `protected_content_reveal` | gtag | `protected-content.ts` | `type`, `action` (`copy`/`click`) | Real engagement with an already-revealed password/scraper-gated field (`kt-contact-card`, `contact-detail`, etc.) — copying its value via `.kt-copy-btn`, or clicking a revealed `tel:`/`mailto:` link. Deliberately **not** fired on the passive decrypt-and-reveal itself (an `IntersectionObserver` firing for every visitor who scrolls past the block was near-100% noise, not a real signal). |

"Providers" is the default from `routing.ts`'s `EVENT_PROVIDER_IDS` — edit that file to change which
platform(s) any event reaches, nothing else in this table needs code changes to match.

### Generic opt-in: `data-ga-event`

Any element can opt into a custom event without touching `analytics.ts`: add `data-ga-event="my_event"`
plus any `data-ga-*` attributes, which are converted to snake_case params (`data-ga-item-name` →
`item_name`). This takes priority over every other delegated rule.

## Deliberately not reimplemented

GA4's own **Enhanced Measurement** already covers these automatically once enabled — reimplementing them
in JS would either duplicate events or drift out of sync with Google's own definitions:

- **Scroll depth** (`scroll` event, 90% threshold)
- **Outbound clicks** (`click` event for any link to a different domain — covers GitHub/LinkedIn/live
  project links from the ticket)
- **File downloads** (`file_download` event, common extensions)
- **Video engagement** (`video_start`/`video_progress`/`video_complete` for embedded YouTube/Vimeo)
- **Site search** (`view_search_results` event) — WordPress's search URL param is `s`
  (`page-search.php` redirects to `?s=...`), which is in GA4's default recognized search-parameter list.
  Just confirm it's still listed under Enhanced Measurement → Site search in GA4 admin.

## GA4 admin configuration checklist

Everything below is done once in the GA4 UI (Admin → this property) — there's no code path for it.

- [ ] **Realtime report** — confirm the property is receiving data at all (visit the site with consent
      granted, check Realtime within a minute).
- [ ] **Enhanced Measurement** (Admin → Data Streams → your stream) — confirm scroll/outbound
      clicks/downloads/video/site-search toggles are on; add `s` to the search term parameter list if
      it isn't already there by default.
- [ ] **Mark as Conversions** (Admin → Events): `generate_lead` at minimum. Consider `form_start` →
      `form_error` funnel visibility, or a `file_download` conversion if a CV/PDF download matters most.
- [ ] **Custom Dimensions** (Admin → Custom definitions) for any parameter you want to slice reports
      by beyond the defaults — at least `item_name` (scoped to event) for project/lightbox reporting,
      and `link_text` for CTA reporting.
- [ ] **Explorations** (Explore tab): a free-form exploration on `select_content`/`item_name` for
      portfolio engagement, and one on `cta_click`/`link_text` for CTA performance.
- [ ] **Audiences** (Admin → Audiences): visitors who fired `select_content` (interested in work), and
      visitors who fired `generate_lead` (converted) for remarketing/analysis.
- [ ] **DebugView** — with `?gtm_debug=1` or the GA4 DebugView Chrome extension, click through the
      site and confirm every event above fires with the expected parameters.
- [ ] **Consent QA** — in a private/incognito window with the Complianz banner NOT yet accepted, confirm
      no `collect` request appears in the Network tab; accept statistics cookies and confirm it starts.
