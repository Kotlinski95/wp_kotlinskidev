# Theme Cache Keys

`functions/cache.php` is the single source of truth for the transient and object-cache entries the theme creates. It defines `KOTLINSKIDEV_CACHE_PREFIX`, detects a new build through `kotlinskidev_build_fingerprint()` and purges stale build transients, flushes everything on theme switch or upgrade, and powers the Tools > Theme Cache admin page and the `wp kotlinskidev cache` command.

## Transients

| Key | Content | Invalidation |
| --- | --- | --- |
| `kotlinskidev_critical_css_{file}_{filemtime}_{breakpoints hash}` | Inlined critical CSS file contents | Auto-busted by filemtime on a new build, purged by `kotlinskidev_flush_build_transients()` |
| `kotlinskidev_critical_js_{filemtime}` | Inlined critical JS file contents | Auto-busted by filemtime on a new build |
| `kotlinskidev_i18n_{locale}` | JS translation array assembled from about 40 `__()` calls | Translation upgrade or manual flush |
| `kotlinskidev_img_sizes` | One map of `md5(url)` to width/height for the content filter, loaded once per request and written back at most once at shutdown | Per-entry on `edit_attachment` and `delete_attachment`. Legacy `img_size_{md5(url)}` entries may still exist until they expire or a manual flush runs |
| `kotlinskidev_popular_posts_{md5(args)}` | Post IDs for the popular-pages view-count query | 15 minute TTL |
| `kotlinskidev_svg_{attachment_id}` | Inlined SVG file contents for nav icons and image-block SVGs | One week TTL, `edit_attachment` and `delete_attachment` |
| `kotlinskidev_build_fingerprint` | Last-seen build ID from `build/build-id.php`, written by `bin/write-build-id.js` on every `npm run build` | Replaced when the fingerprint changes |
| `kotlinskidev_badge_fetch_{md5(url)}` | Parsed Open Graph data of a fetched Credly or Accredible badge URL (`functions/certificate-badge-fetch.php`) | One day TTL |
| `kotlinskidev_canvas_recipe_{scene_id}` | Validated layer recipe of a `kt_canvas_scene` post (`functions/canvas/scene.php`) | One week TTL, `save_post_kt_canvas_scene` and `delete_post` |
| `kotlinskidev_offers_{lang}` | Map of offer key to name, currency, placeholder flag and variants for one Polylang language (`functions/offers.php`) | One week TTL, `kt_offer` save, trash, delete, meta change and `pll_save_post` |

## Object cache

| Key | Content |
| --- | --- |
| `kotlinskidev_polish_search_page_id` | Page ID of the Polish search template, looked up at most once per request |

## In-memory only

`$cached_keys` in `kotlinskidev_get_or_create_keys()` holds the RSA key pair, `$lazy_class` in `control_block_lazy_loading()` holds the theme-mod value, and `$cache[$locale]` in `kotlinskidev_get_breadcrumb_settings()` holds the breadcrumb options. None of them is written to the database.

## Load order

`functions/cache.php` must stay near the top of `functions.php`, before every module that reads or writes theme transients: those modules rely on `KOTLINSKIDEV_CACHE_PREFIX` and the flush helpers.
