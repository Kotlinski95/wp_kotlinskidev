# kotlinskidev Theme — Directory Tree

Full current-state file/folder tree of the theme, annotated inline. Every `docs/*.md` file describes the current, implemented state — no plans, phases, or proposals. See `docs/footer-architecture.md`, `docs/header-architecture.md`, and `docs/navigation-structure.md` for the header/footer/mega-menu block architecture in more depth.

Keep this in sync with `CHANGELOG.md`: when a change adds/removes/renames a block, pattern, template, or function module, update the relevant line here too. `node_modules/` and `build/` (both gitignored, generated) are omitted.

```text
kotlinskidev/
├── audit/                                      # site-audit pipeline (perf/a11y/SEO/security), run via npm run audit + .github/workflows/site-audit.yml
│   ├── urls.json                               # baseUrl + sitemapPath + excludePatterns — config only, page list is discovered dynamically each run
│   ├── lighthouserc.js                         # LHCI collect+upload config (no assert — regression-diff.js is the pass/fail gate, not fixed score thresholds)
│   ├── pa11yci.js                              # pa11y-ci config (WCAG2AA), page list from lib/load-pages.js
│   ├── lib/
│   │   └── load-pages.js                       # reads audit/results/urls.generated.json, throws if audit:discover hasn't run yet
│   ├── scripts/
│   │   ├── discover-urls.js                    # fetches urls.json's sitemapPath (recursing into nested sitemapindex files), applies excludePatterns, writes urls.generated.json
│   │   ├── check-schema.js                     # SEO check: title/meta description length, canonical, JSON-LD validity, hreflang presence
│   │   ├── check-security-headers.js           # verifies response headers against docs/security-headers.md's target values
│   │   ├── merge-report.js                     # merges LHCI/pa11y/seo/security outputs into one per-URL JSON (audit/results/latest.json), connector-ready shape
│   │   └── regression-diff.js                  # diffs latest.json against the audit-history branch baseline, fails the run on regression past threshold
│   └── results/                                # gitignored — generated per run (incl. urls.generated.json), baseline persisted on the orphan audit-history branch instead
├── assets/                                     # static: css/ fonts/ icons/ images/ videos/
├── docs/                                       # architecture reference, workflow, and tooling docs (current state only)
│   ├── 522.md                                  # Cloudflare 522 incident runbook + root-cause notes
│   ├── accessibility.md                        # accessibility review checklist (WCAG 2.2 POUR, ARIA, EAA/ADA/Section 508 cross-ref)
│   ├── breakpoints.md                          # DB-driven breakpoint system
│   ├── build.md                                # Webpack build architecture — entry-derivation logic, why build/ stays (not Astra's assets/css-minified pattern)
│   ├── distribution.md                         # client-site theme distribution/update-check plan (packaging, GitHub Releases vs self-hosted license server)
│   ├── env.md                                  # environment/.env variable documentation
│   ├── footer-architecture.md                  # footer template/block architecture
│   ├── git-instructions.md                     # branch/PR naming conventions
│   ├── header-architecture.md                  # header template/block architecture
│   ├── legal-compliance.md                     # legal/privacy review checklist (GDPR, cookie consent, Impressum, EAA accessibility statement) + practical how-to steps for items with a concrete engineering fix (e.g. AI-generated media disclosure)
│   ├── mcp-server-usage.md                     # MCP server usage notes
│   ├── mcp-wordpress-setup.md                  # MCP WordPress integration setup notes
│   ├── monitoring.md                           # EC2 CloudWatch alarms/agent setup + PHP-FPM memory cleanup
│   ├── navigation-structure.md                 # desktop mega-menu + hamburger architecture
│   ├── performance.md                          # performance review checklist (JS runtime, rendering, network, WP backend)
│   ├── reference/                              # retired file-based artifacts kept for comparison only — not loaded/routed by WordPress
│   │   └── single-service_location-en.html     # pre-Polylang-strings EN city landing page, superseded by templates/single-service_location.html + kotlinskidev/translated-text; kept as a copy-reference, not wired into any template hierarchy
│   ├── security-headers.md                     # HTTP security header reference — GDPR/EU regulatory context, OWASP-sourced recommended values, CSP rollout plan, PHP-vs-Cloudflare split
│   ├── security.md                             # security review checklist (OWASP Top 10, WP hardening, MCP attack surface, ISO 27001 cross-ref)
│   ├── seo.md                                  # technical SEO review checklist (crawlability, schema, hreflang, Core Web Vitals overlap)
│   ├── storybook.md                            # Storybook architecture, the @wordpress/* version-alignment requirement, mocking table (MediaUpload/ServerSideRender/theme.json tokens), known gotchas, step-by-step recipe for a new block's story — see also the `storybook` Claude skill
│   ├── testing.md                              # JS/PHP unit, PHP integration, and e2e test setup + coverage baseline
│   ├── theme-colors.md                         # adaptive color token system
│   ├── tracking-spec.md                        # GA4 event/parameter reference, what's deliberately left to Enhanced Measurement, and the GA4 admin (Conversions/Dimensions/Explorations/Audiences) config checklist
│   └── treeview.md                             # this file — full annotated structure tree
├── functions/                                  # 94 PHP modules, require_once'd from functions.php (cache.php must load first)
│   ├── active-link-state.php                   # localizes the kt-link-current settings (enabled/blockClicks) onto wp-typescript as window.kotlinskidevActiveLinkState — actual link marking moved client-side to src/scripts/active-link-state.ts (was a render_block filter, ~104ms/page on a heavy homepage)
│   ├── actions.php                             # misc template_redirect / wp_head / wp_footer actions
│   ├── analytics-events.php                    # kotlinskidev_tracked_event_names() (single source of truth for the settings checkboxes below); localizes the saved kotlinskidev_enabled_analytics_events option onto wp-typescript as window.kotlinskiAnalyticsConfig.disabledEvents, which track-event.ts checks before any provider dispatch — a per-event kill switch across every platform at once, not per-platform (that stays in analytics-providers/routing.ts)
│   ├── admin-bar-styles.php                    # enqueues admin-bar style overrides, only when the bar is visible
│   ├── ai-disclosure-labels.php                # adds an "AI-generated" checkbox to Media Library attachment fields (_kotlinskidev_ai_generated post meta) + a render_block filter that appends a visible "AI-generated image/video" <span> to any core/image or core/cover block whose attachment id has that meta set, EU AI Act Art. 50(4) deployer disclosure duty
│   ├── article-card.php                        # kt_article_card CPT (title + linked_article_id/card_description meta, synced from the linked article via rest_insert_kt_article_card) + kotlinskidev_render_article_card_embed(), which renders templates/single-kt_article_card.html with explicit WP_Block context so its core/post-meta bindings resolve; kotlinskidev_merge_article_card_block_supports() (WP_HTML_Tag_Processor) merges the block's own color/spacing/border/typography Styles-panel overrides onto the template's existing root tag, called from src/blocks/article-card/render.php; PluginDocumentSettingPanel script (src/blocks/article-card/panel.tsx) enqueued only on the CPT's own edit screen
│   ├── article-query-manager.php               # meta boxes for per-article query control
│   ├── asset-paths.php                         # kotlinskidev_build_path()/kotlinskidev_build_url() — single source of truth for the build/js, build/css subfolder layout, required right after cache.php
│   ├── background-effects/                     # all background-effect-preset PHP, the second subfolder in functions/ alongside canvas/
│   │   ├── preset.php                          # kt_bg_effect_preset CPT (non-public, title+editor only, same shape as kt_canvas_scene) whose content holds exactly one kotlinskidev/bg-effect-preset-settings block; kotlinskidev_build_bg_effect_preset() parse_blocks()s the post, clamps effectType to the 5 recognized kt-bg-fx-* types (falls back to gradient-shift), sanitizes color1/2/3 and duration (1-30s, per-type default), cached in a kotlinskidev_bg_effect_preset_{preset_id} transient
│   │   └── render.php                          # render_block filter: reads $block['attrs']['backgroundEffectPresetId'], resolves it via preset.php, strips any already-baked kt-bg-fx-* class (so a stale manual-mode class from blocks.getSaveContent.extraProps can't stack with the preset's own) and sets the preset's class + --kt-bg-fx-duration/-color-1/-2/-3 inline style on the block's root tag via WP_HTML_Tag_Processor — same "resolved server-side, never baked into saved content" principle as functions/canvas/render.php, applied to what was previously a 100% client-side (extraProps-only) feature
│   ├── banner-slider.php                       # enqueues/inits banner-carousel block assets
│   ├── blocks.php                              # registers block categories + every block.json (source of truth for blocks)
│   ├── blog-topic-manager.php                  # category "description" field admin UI + blog topic taxonomy helpers; also hosts the 6 render functions (kotlinskidev_render_{blog_topics_grid,category_header,category_posts_grid,other_topics,article_tags,related_articles}_fresh_per_language()) that re-run get_categories()/get_posts()/WP_Query fresh on every request instead of the retired patterns/{blog-topics-grid,category-header,category-posts-grid,other-topics,article-tags,related-articles}.php wp:pattern references — called from each render.php of the 6 src/blocks/*-dynamic/ folders (registered in functions/blocks.php, see src/blocks/blog-topics-grid-dynamic/ for why), so category/post listings always match the current Polylang language and current queried post/category instead of freezing at whatever content was active when the pattern cache (or a Site-Editor-detached wp_template DB override) last captured them
│   ├── border-gradient.php                     # applies --kt-border-gradient/--kt-border-width to any border-supporting block that picked a gradient (excludes kotlinskidev/button)
│   ├── breadcrumbs.php                         # breadcrumb trail builder + renderer for the kotlinskidev/breadcrumbs block, also syncs Yoast's wpseo_breadcrumb_links schema to the same trail
│   ├── button-style-variants.php               # register_block_style()s core/button's 21 Style variants — reads theme.json's own styles.blocks.core/button.variations keys directly off disk (json_decode(file_get_contents(theme.json)), bypassing WP_Theme_JSON entirely) and auto-registers one per key with an auto-generated label, so a new Fill/Primary/Outline/Outline Primary color variant needs only a theme.json edit, no PHP change; the 5 gradient-outline* names stay a small fixed array here since their border comes from SCSS, not theme.json's color/border schema, so they have no variations key to discover. PHP registration (not JS) is required full stop — WP_Theme_JSON_Resolver's sanitize() strips any theme.json variations entry whose name isn't already server-registered
│   ├── breakpoints.php                         # central breakpoint values, exposed to editor + front end
│   ├── cache.php                               # build-fingerprint/transient cache manager — must load first
│   ├── canvas/                                  # all canvas-background PHP, consolidated (one of two subfolders in an otherwise-flat functions/ directory, alongside background-effects/)
│   │   ├── enqueue.php                          # kotlinskidev_post_has_canvas_scene_blocks() recursively scans the queried post's parse_blocks() output for any canvasSceneId attribute > 0, cached in a kotlinskidev_canvas_bg_present_{post_id}_{modified} transient (cloned from deferred-block-assets.php's above-fold scanner); only then enqueues the canvas-background-init build entry, so the engine never ships on pages that don't use the feature
│   │   ├── render.php                           # render_block filter: absint()s $block['attrs']['canvasSceneId'], resolves it via kotlinskidev_render_canvas_background_markup() (scene.php), and injects the resulting <div class="kt-canvas-bg" data-canvas-recipe="..."> as the wrapper's first child via a generic anchor-based preg_replace_callback (works regardless of the consuming block's own wrapper tag name) — never baked into saved content via blocks.getSaveContent.extraProps, so editing a scene later propagates to every page using it without a re-save. Also appends an optional <div class="kt-canvas-scrim"> right after it when $block['attrs']['canvasScrim'] is true, via kotlinskidev_render_canvas_scrim_markup() — a per-block-instance (not per-scene) semi-transparent overlay for keeping text readable over a busy animation, color/opacity sanitized the same way as a layer's own params
│   │   └── scene.php                            # kt_canvas_scene CPT (non-public, title+editor only, kt_modal-shaped) whose content is composed of the kotlinskidev/canvas-layer-{gradient,noise,grid-lines,blob,sweep,light-rays,curved-rays,star-field,orbit-trails,warp-field,nebula,aurora,neon-waves} blocks; kotlinskidev_build_canvas_recipe() parse_blocks()s the scene, allowlists only those 13 block names, and individually clamps/validates every param (hex/preset-var colors only, hard numeric min/max server-side regardless of the editor's own control range) into a cached kotlinskidev_canvas_recipe_{scene_id} transient — the DB only ever stores numbers/strings/colors, never executable code
│   ├── certificate-badge-fetch.php             # admin-ajax handler (kotlinskidev_fetch_certificate_badge) for the "Fetch details" button in certificate/panel.tsx — SSRF-guarded wp_remote_get() against an allowlisted Credly/Accredible host, parses Open Graph tags, sideloads the badge image via media_sideload_image(), caches the parsed result in a kotlinskidev_badge_fetch_{md5} transient (see cache.php registry)
│   ├── certificate.php                         # kt_certificate CPT (title + native featured image + cert_issuer/cert_issued_date/cert_description/cert_credential_id/cert_verify_url/cert_source_url meta); kotlinskidev_map_certificate_post() maps one WP_Post to the shared certificate array, consumed by kotlinskidev_get_certificates() (all published) and kotlinskidev_render_certificate_embed() (one, by ID); kotlinskidev_certificate_color_declaration() turns an optional secondaryTextColor/accentColor hex string into a bare `color:X !important;` CSS declaration (empty string when unset), merged into each element's own style attribute by the badge_card/feature_card renderers (compact_pill has no muted/accent elements, left unthreaded) to beat the has-{slug}-color utility class's own !important; three per-card renderers (kotlinskidev_render_certificate_{badge_card,feature_card,compact_pill}(), each taking an optional $wrapper_attrs string from get_block_wrapper_attributes() that swaps their hardcoded root-tag class/style for the block-supports-generated one) each have a grid-wrapping sibling (_badge_grid/_feature_cards/_compact_strip, used by src/blocks/certificates-grid-dynamic/, which always call the per-card renderer with no override) — kotlinskidev_render_certificate_embed()'s layout param picks the bare per-card renderer directly (no template/WP_Block involved) so src/blocks/certificate/ embeds compose freely inside any editor-built grid/carousel; PluginDocumentSettingPanel script (src/blocks/certificate/panel.tsx) enqueued only on the CPT's own edit screen
│   ├── contact-card.php                        # kotlinskidev_get_contact_info() reads the 4 global "Contact Info" settings (address/phone/email/hours); registers the kotlinskidev/contact-card dynamic block, wrapping address/phone/email in the same protected-content encrypted-span markup the Protected Content block uses (auto-revealed by src/scripts/protected-content.ts); also emits a ProfessionalService JSON-LD schema on singular service_location pages via wp_head, with the post's "city" meta as areaServed
│   ├── contact-form.php                        # handles contact-form block submission end-to-end; persists every submission via contact-form-submissions.php before attempting wp_mail(), so a failed send never means total data loss
│   ├── contact-form-submissions.php            # private wp-admin "Submissions" screen (dashicons-email-alt, manage_options): custom wp_kotlinskidev_contact_submissions table (dbDelta, versioned via admin_init self-heal), unread-count menu badge, single-submission detail view (marks read_at on first view), nonce-gated single/bulk delete — the audit trail for "I submitted the form but never got the email"
│   ├── class-contact-submissions-list-table.php # Kotlinskidev_Contact_Submissions_List_Table extends core WP_List_Table — status/name/email/topic/message/date columns, All/Unread/Sent/Failed filter links, sortable date/name, bulk delete
│   ├── copyrights.php                          # [copyrights] shortcode
│   ├── cover-image-classes.php                 # lazy-loading behavior control for cover blocks
│   ├── cover-video-preload.php                 # injects <link rel=preload> for cover-block video posters
│   ├── custom-css-vars.php                     # render_block filter: injects an editor-defined list of arbitrary CSS custom properties (name/value pairs) as inline style on kotlinskidev/icon and core/image, for theming multi-color SVGs via var(--x) in their own fill/stroke attributes
│   ├── customizer.php                          # Customizer panel registration
│   ├── deferred-block-assets.php               # filterable block-name→handle registry + per-page above-the-fold scan/cache for CSS defer decisions
│   ├── disable-comments.php                    # site-wide comment disabling
│   ├── enqueue-scripts.php                     # main script/style enqueue pipeline
│   ├── error-monitoring.php                    # Sentry PHP SDK (vendor/sentry/sentry via Composer — the theme's first real runtime Composer dependency; production deploys must run `composer install` or vendor/ won't exist and this silently no-ops). Loaded first in functions.php, right after cache.php, so it can catch fatals from anything that follows. Only registers Sentry\ErrorHandler's exception + fatal-error handlers (not the general error handler, so warnings/notices/deprecations are never sent — keeps free-tier event quota for real page-breaking failures only), and only when a kotlinskidev_sentry_dsn option is set AND WP_DEBUG is off, so local dev never reports
│   ├── faq-layout.php                          # applies kt-faq-independent-columns-N class to core/group per its faqLayout Advanced-panel choice
│   ├── feature-toggles.php                     # kotlinskidev_feature_enabled()/kotlinskidev_toggleable_features() — single source of truth for the Settings → Customization on/off switches (project cards, article cards, service locations, certificates); loaded right after cache.php so every feature module below can gate its own CPT/meta/block registration on it
│   ├── filters.php                             # misc content/attachment filters
│   ├── group-link.php                          # applies kt-group-link class + data-kt-group-link-url/target + role="link"/tabindex to a core/group with groupLinkUrl set
│   ├── icon-extension.php                      # leading-icon render_block splice for kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   ├── icon-library.php                        # adds an "Icons (SVG)" entry to the Media Library's post_mime_types type filter
│   ├── image-hover-overlay.php                 # inserts a heading/description overlay div into core/image when kotlinskidevOverlayEnabled is set
│   ├── language-switcher.php                   # [language_switcher] shortcode
│   ├── link-hover-effects.php                  # applies configurable link hover-effect classes to blocks
│   ├── load-more.php                           # render_block filter: adds kt-has-load-more class + data-kt-load-more-initial/-label/-align/-text-color/-bg-color/-border-color/-border-width/-border-radius/-hover-text-color/-hover-bg-color/-hover-border-color/-underline attributes to a core/group with loadMore.enabled set, read by src/scripts/load-more.ts to progressively reveal children and style the button (incl. hover)
│   ├── login.php                               # custom wp-login.php styling
│   ├── main-content-focus.php                  # injects tabindex="-1" onto the <main class="main-wrapper"> core/group at render time (skip-link focus target, kept out of stored markup so block validation doesn't flag an attribute the block itself can't declare)
│   ├── maintenance.php                         # maintenance-mode toggle + admin settings page
│   ├── marquee.php                             # prints the single shared kt-modal-marquee shell in wp_footer for kotlinskidev/marquee (src/blocks/marquee/) — an empty title/body populated client-side per click, kept outside any transformed ancestor
│   ├── modals.php                              # kt_modal CPT + size meta, resolves/dedupes/renders modal shells for any link with opensInModal+modalId, wp_footer
│   ├── model-viewer-mime.php                   # allows .glb uploads (model/gltf-binary), overrides finfo's mismatch verdict via wp_check_filetype_and_ext
│   ├── nav-reveal-render.php                   # render_block filter for core/navigation-link/-submenu, kotlinskidev/nav-*, kotlinskidev/button, kotlinskidev/social-section — reads navRevealAnimation/navRevealDelay/navRevealTranslate off $block['attrs'] and injects the class + --reveal-delay inline style via WP_HTML_Tag_Processor onto the block's own root tag (these are dynamic PHP-rendered blocks, so the editor-side blocks.getSaveContent.extraProps filter never reaches their frontend output). search-panel/language-panel are deliberately excluded here — they need the class on their *inner* .kt-search-panel__modal/.kt-lang-panel__modal div, not their outer wrapper, so they call the exported kotlinskidev_nav_reveal_class_and_style() helper directly from their own render.php instead. Also exports kotlinskidev_stagger_reveal_items(\$html, \$animation, \$class_markers, \$step=60) — walks every tag via WP_HTML_Tag_Processor and auto-staggers, in one continuous document-order sequence, every tag whose class list contains an EXACT token match for ANY of \$class_markers (not substring — "wp-block-navigation-item" must not also match the BEM child "wp-block-navigation-item__content"); used by search-panel/language-panel render.php to stagger their whole auto-generated content (search form, "Frequently visited pages" title, each popular-pages link / each language option) in one pass, no per-item editor config needed
│   ├── page-loader.php                         # renders page-loader markup on wp_body_open
│   ├── page-view-tracking.php                  # AJAX view tracking + Popular Pages query source
│   ├── patterns.php                            # registers 4 custom pattern categories
│   ├── polylang-accessibility.php              # a11y fixes for Polylang language-switcher markup
│   ├── polylang-content-resolution.php         # wp_navigation/wp_block/kt_modal/kt_project_card/kt_certificate Polylang-translatable; kotlinskidev_resolve_translatable_post() resolves by slug (wp_navigation/wp_block), kotlinskidev_resolve_translatable_post_id() resolves by post ID (kt_project_card, kt_certificate — called from functions/project-card.php and functions/certificate.php so a fixed embed shows the current language's translation)
│   ├── position-z-index.php                    # render_block filter (kotlinskidev_apply_position_z_index_classes()) merging kt-position-*/kt-z-* utility classes (src/styles/position-utilities.scss) onto any block carrying a kotlinskidevPosition/kotlinskidevZIndex attribute; runs uniformly for static-save and dynamic-render blocks alike, since render_block fires on a block's final output regardless of source — no per-block PHP carve-out needed, only the JS-side attribute registration (src/blocks/position-z-index-controls/) needs one
│   ├── project-card.php                        # kt_project_card CPT (title + native featured image + project_description/project_tags/project_url meta) + kotlinskidev_render_project_card_embed(), which resolves the passed cardId to the current language's translation via kotlinskidev_resolve_translatable_post_id() (functions/polylang-content-resolution.php) before rendering templates/single-kt_project_card.html with explicit WP_Block context AND setup_postdata() (core/post-title's render callback reads the global $post, not block context) so core/post-title, core/post-featured-image, and its core/post-meta bindings all resolve; injects the kt-image-hover-overlay markup (image-hover-overlay.php) around the featured image server-side using project_description; kotlinskidev_merge_project_card_block_supports() (WP_HTML_Tag_Processor) merges the block's own color/spacing/border/typography Styles-panel overrides onto the template's existing root tag instead of adding an extra wrapper div, which would've broken kt-equal-height-columns' `> *` direct-child selector on single-service_location.html; PluginDocumentSettingPanel script (src/blocks/project-card/panel.tsx) enqueued only on the CPT's own edit screen
│   ├── protection-helpers.php                  # RSA keypair + encrypt/decrypt for protected-content block; kotlinskidev_format_decrypted_content()'s optional $link_label/$button_style params let email/phone reveal a fixed label (e.g. "Call me") instead of the raw value, and reuse the global .kt-button__link/.kt-button__label classes (same gradient-border recipe as the nav Contact CTA) so a protected phone/email can look like a site button with no new CSS
│   ├── responsive-display.php                  # per-breakpoint show/hide block attribute
│   ├── responsive-font-size.php                # per-breakpoint font-size attribute
│   ├── responsive-height.php                   # per-breakpoint min-height attribute (reuses responsive-width.php's kotlinskidev_sanitize_css_length())
│   ├── responsive-order.php                    # per-breakpoint block reorder attribute
│   ├── responsive-spacing.php                  # per-breakpoint spacing attribute
│   ├── responsive-width.php                    # per-breakpoint width attribute
│   ├── scroll-animation-render.php             # render_block filter: injects scrollAnimation/scrollAnimationDelay/scrollAnimationTranslate as classes onto the actual rendered root tag of EVERY dynamic (render.php) block — the scroll-animations editor extension (src/blocks/scroll-animations/index.tsx) only applies via blocks.getSaveContent.extraProps, which only affects the saved static markup; a dynamic block's render_callback rebuilds that markup fresh and discards it. Idempotent (skips if the class is already present) so it is a safe no-op for the static blocks where extraProps already worked
│   ├── scroll-restoration.php                  # sets history.scrollRestoration = 'manual' inline in <head> (wp_head priority 1) so the browser never auto-jumps to a saved scroll position before layout/marquee/ScrollTrigger settle — src/scripts/restoration.ts then does the actual restore
│   ├── scroll-section-pin-boundary-render.php  # render_block companion to src/blocks/scroll-section-pin-boundary/index.tsx's editor.BlockEdit toggle — applies the scroll-section-pin-boundary class onto a dynamic (render.php) block's real rendered root tag the same way scroll-animation-render.php does; idempotent, no-op for static blocks already covered by that extension's own blocks.getSaveContent.extraProps filter
│   ├── scroll-top-top.php                      # scroll-to-top markup (fixed-arrow/bar variants) + [scroll_to_top] shortcode
│   ├── search-page-styles.php                  # conditional style fixes on search results pages
│   ├── service-locations.php                   # service_location CPT (editor+custom-fields support, no archive — the "choose your city" hub is two real Pages, see below) + single "city" post-meta field, sanitized on write and exposed to REST/block editor via custom-fields support. City page body is one real, fully block-editable FSE template — templates/single-service_location.html — shared by every language: text nodes are kotlinskidev/translated-text blocks resolved via pll__() (functions/translated-text.php) instead of a per-language duplicate template, replacing an earlier single opaque PHP-rendered dynamic block that traded editability for dodging a WP core bug (a plain wp:pattern reference caches its content once, at whatever locale was active when WP_Theme::get_pattern_cache() last populated, freezing translated text in one language for every visitor). Three of the five city-bound headings/paragraphs carry a kt-gradient-text className, since Block Bindings disables inline RichText controls (bold/italic/gradient) for a bound element — gives them the same sitewide gradient without needing the toolbar. Enqueues src/blocks/service-location/panel.tsx (PluginDocumentSettingPanel for the "city" field) on the CPT's own edit screen. Also registers 2 PHP-only dynamic blocks (render_callback, no block.json/build step): kotlinskidev/city-grid (columnsDesktop/columnsTablet/columnsMobile + linkTextColor attributes, controls in src/blocks/city-grid/index.tsx) and kotlinskidev/city-map (embed iframe + an expand button wired to src/scripts/city-map-lightbox.ts's fullsize overlay), both rendered fresh every request, plus a third — kotlinskidev/contact-card (functions/contact-card.php) — also listed in the same SSR-preview registration below. Both "Find us in {city}" section templates now use a two-column layout: an eyebrow + city heading + SEO paragraph + kotlinskidev/contact-card on the left, kotlinskidev/city-map on the right — see functions/contact-card.php. A small inline-JS `registerBlockType()` (enqueued on `enqueue_block_editor_assets`, no build step) using `ServerSideRender` so the block editor shows their real rendered output — and a `pre_determine_locale` filter + a `kotlinskidevLang` REST field (registered for `page`/`service_location`) so that preview also renders in the *edited post's* Polylang language. Also a lang→slug map + rewrite rule + post_type_link filter so each city's own URL translates automatically (adding a language is one array entry)
│   ├── security-headers.php                    # Referrer-Policy/Permissions-Policy/CSP-Report-Only via the wp_headers filter, skips wp-admin/REST — see docs/security-headers.md
│   ├── seo-noindex-compat.php                  # detects active SEO plugin (Yoast/Rank Math/AIOSEO/SEOPress), returns query-args noindex exclusion
│   ├── search-page-dynamic-blocks.php          # registers 4 PHP-only dynamic blocks (render_callback, no block.json) replacing the retired patterns/{search-header,search-form,search-results,popular-content}.php wp:pattern references on templates/search.html — kotlinskidev/search-header-dynamic, -search-form-dynamic (get_categories() lang-scoped), -search-results-dynamic (WP_Query lang-scoped, embeds -popular-content-dynamic when the query is empty), -popular-content-dynamic (WP_Query lang-scoped) — so search results, the category filter dropdown, and the pre-filled query always match the real current request instead of a frozen snapshot
│   ├── settings-page.php                       # main theme settings admin page — 10 tabs incl. Customization (feature-toggles.php's on/off switches)
│   ├── site-identity.php                       # minimal site logo/title setup
│   ├── slider-modal-trigger.php                # opens a kt_modal when a wpe/slider slide (core/cover, .swiper-slide, modalId set) is clicked
│   ├── social-link-tooltip.php                 # adds .kt-tooltip + data-tooltip to core/social-link anchors, sourced from the screen-reader-only label
│   ├── svg-gradient-defs.php                   # injects inline SVG gradient <defs> into wp_body_open
│   ├── svg-support.php                         # allows SVG uploads + inline SVG rendering
│   ├── tag-archive-manager.php                 # registers 3 PHP-only dynamic blocks (render_callback, no block.json) replacing the retired patterns/{tag-header,tag-posts-grid,related-tags}.php wp:pattern references on templates/tag.html — kotlinskidev/tag-header-dynamic, -tag-posts-grid-dynamic (WP_Query lang-scoped), -related-tags-dynamic (get_tags()/get_posts() lang-scoped) — so a tag archive always matches the current tag/Polylang language instead of a frozen snapshot
│   ├── text-gradient.php                       # applies .kt-gradient-text + a --kt-text-gradient css var to any block that picked a gradient via the kotlinskidev/text-gradient editor extension (src/blocks/text-gradient/)
│   ├── text-line-clamp.php                     # appends a Read more/Read less toggle + --kt-line-clamp-lines var to core/paragraph when kotlinskidevLineClampEnabled is set
│   ├── text-shadow-support.php                 # text-shadow style attribute for shadow-supporting blocks
│   ├── theme-setup.php                         # theme supports registration, deregisters jQuery
│   ├── theme-switcher.php                      # dark/light shortcode + JS config output
│   ├── tracking-scripts.php                    # Facebook Pixel + Google Analytics snippets, consent-gated via Complianz's type="text/plain" data-category="marketing"/"statistics" manual-blocking convention
│   ├── translated-text.php                     # registers kotlinskidev/translated-text block strings (incl. optional href) with Polylang on admin_init by scanning templates/*.html + parts/*.html for the block plus kotlinskidev/content-tabs-nav-link's "label" and any core/group's loadMore.buttonLabel attribute, calling pll_register_string() per string found — must run in a classic admin request since pll_register_string() no-ops on frontend/REST
│   └── video-poster.php                        # poster image attribute for cover-video blocks
├── includes/                                   # 3 misc PHP modules (i18n, parallax, hover animations)
│   ├── hover-animations.php                    # enqueues hover-animation editor controls + render_block filter
│   ├── i18n.php                                # theme textdomain loading + localizes translation strings
│   └── parallax-frontend.php                   # renders parallax data attributes on cover blocks
├── languages/                                  # .po/.mo translations (en_US, pl_PL)
│   ├── en_US.l10n.php
│   ├── en_US.mo
│   ├── en_US.po
│   ├── kotlinskidev.pot
│   ├── messages.mo
│   ├── pl_PL.l10n.php
│   ├── pl_PL.mo
│   └── pl_PL.po
├── parts/                                      # FSE template parts
│   ├── footer.html                             # logo/brand content-block, nav simple-grid, kotlinskidev-footer__contact (phone/email kotlinskidev/contact-detail blocks), copyrights, scroll-to-top
│   └── header.html                             # site logo, kotlinskidev/navigation, theme-switcher, kotlinskidev/breadcrumbs
├── patterns/                                   # 71 reusable block patterns
│   ├── about-2.php                             # About Section 2
│   ├── about-me-editorial.php                  # About Me Editorial — portrait right, credentials meta rows (design system "About me" slot me-b)
│   ├── about-us.php                            # About Us Section
│   ├── article-hero.php                        # Article Hero Section
│   ├── blog-cards.php                          # Blog Cards Grid
│   ├── certificates-badge-grid.php             # CSS-grid wp:group scaffold of individual kotlinskidev/certificate {certificateId:0} picker blocks (3 empty slots) instead of the single auto-querying certificates-grid-dynamic block — so editors can pick which certificates to show and in what order, add/remove/reorder them like kotlinskidev/project-card; empty (not real) IDs per .claude/rules/php-patterns.md's "avoid hardcoding post IDs in patterns" rule
│   ├── certificates-compact-strip.php          # single kotlinskidev/certificates-grid-dynamic {"layout":"compact-strip"} — one-line issuer pill row for a footer or under a hero
│   ├── certificates-feature-cards.php          # single kotlinskidev/certificates-grid-dynamic {"layout":"feature-cards"} — logo + context line per credential, for a homepage block
│   ├── collaborations-described-cards.php      # Collaborations Described Cards — 6 client-work cards with category/year, title, one-line result and Read more link (design system "Collaborations" slot B)
│   ├── collaborations-hairline-grid.php        # Collaborations Hairline Grid — no card fill, 1px-rule-divided logo cells, auto-fit 5-up/2-up (design system "Collaborations" slot E)
│   ├── collaborations-separate-tiles.php       # Collaborations Separate Tiles — bordered logo tiles with hover lift + accent edge (design system "Collaborations" slot F)
│   ├── collaborations-split.php                # Collaborations Split — copy left, logo wall right, stacks and centres on mobile (design system "Collaborations" slot H)
│   ├── compact-service-pair.php                # Compact Service Pair — icon/heading/copy card trio in a responsive auto-fit grid (design system "Banner templates" slot D)
│   ├── contact-page.php                        # Contact Us
│   ├── contact-with-form.php                   # Contact with Form
│   ├── content-tabs-media.php                  # Content Tabs with Media (kotlinskidev/content-tabs example, image + heading + copy per tab)
│   ├── content-tabs-services.php               # Services with Content Tabs (kotlinskidev/content-tabs example)
│   ├── counter-block.php                       # Counter Blocks
│   ├── counter-with-desc.php                   # Counter Block with Description
│   ├── cta-block-2.php                         # Call to Action 2
│   ├── cta-block.php                           # Call to Action
│   ├── cv-centered-facts.php                   # CV Centered Facts — centred name/role, 4-stat proof row, multi-button CTA row (design system "CV / resume" slot C)
│   ├── cv-document-preview.php                 # CV Document Preview — page-1 thumbnail beside two labelled PDF download rows (design system "CV / resume" slot B)
│   ├── cv-profile-card.php                     # CV Profile Card — circular photo, one primary gradient download + secondary link row (design system "CV / resume" slot A)
│   ├── cv-slim-bar.php                         # CV Slim Bar — one-line photo/name/download bar for an article end or footer (design system "CV / resume" slot D)
│   ├── deploy-pipeline.php                     # Deploy Pipeline — CI/CD status-card mockup with a CSS `@keyframes` spinner + progress sweep, `prefers-reduced-motion` guarded (design system "Banner templates" slot G)
│   ├── faq-accordion.php                       # FAQ Accordion
│   ├── faq-section.php                         # FAQ Section
│   ├── featured-content-2.php                  # Featured Content 2
│   ├── featured-content.php                    # Featured Content
│   ├── features-and-benefits.php               # Features and Benefits
│   ├── features-section.php                    # Features Section
│   ├── header-default.php                      # Header Default — orphaned, not referenced anywhere
│   ├── header.php                              # Header
│   ├── hero-banner.php                         # Hero Banner
│   ├── highlight-features.php                  # Highlight Features
│   ├── home-banner.php                         # Home Banner
│   ├── how-to-prepare-checklist.php            # How To Prepare Checklist — heading/CTA row above a 4-item pre-call checklist grid (design system "How to prepare" slot D)
│   ├── how-to-prepare-phase-cards.php          # How To Prepare Phase Cards — your-side/my-side responsibility split, 7 bullets each (design system "How to prepare" slot C)
│   ├── how-to-prepare-step-strip.php           # How To Prepare Step Strip — 5-phase condensed card grid for a homepage block (design system "How to prepare" slot B)
│   ├── how-to-prepare-timeline.php             # How To Prepare Timeline — 9-step numbered rail with connector lines and you-bring/I-deliver chips (design system "How to prepare" slot A)
│   ├── latest-work.php                         # Latest Works Section
│   ├── link-cards-feature-stack.php            # Link Cards Feature Stack — one large featured project card + 3-row icon link stack (design system "Link cards" slot D, uses assets/icons/services/*)
│   ├── link-cards-icon-led.php                 # Link Cards Icon Led — textured icon head overlapping a text plate, uses assets/icons/services/*.svg (design system "Link cards" slot C)
│   ├── link-cards-image-band.php               # Link Cards Image Band — image band + text plate, whole-card link (design system "Link cards" slot A)
│   ├── link-cards-typographic.php              # Link Cards Typographic — no imagery, big faded index number + gradient edge accent (design system "Link cards" slot B)
│   ├── logo-showcase.php                       # Logos Showcase
│   ├── mission-goal.php                        # Mission & Goal Content
│   ├── mission-vision.php                      # Mission & Vision Section
│   ├── number-stats.php                        # Counter Stats with Sticky Section
│   ├── photo-gallery.php                       # Photo Gallery
│   ├── pricing-tables.php                      # Pricing Tables
│   ├── profile-links-card.php                  # Profile Links Card
│   ├── project-carousel-bottom-peek.php        # Project Carousel Bottom Peek — always-dark spotlight card, huge headline over a device screenshot cropped by the section's own bottom edge (design system "Project carousel banners" slot D)
│   ├── service-content.php                     # Service Section with big Image (slug: services-content)
│   ├── service-grid.php                        # Service Grid (slug: services-grid)
│   ├── service-icons-grid.php                  # Service Icons Grid — 4 native icon/heading/copy cards using assets/icons/services/*.svg, native `layout:grid` auto-fit (design system "Service Card Icons")
│   ├── service-locations-grid.php              # Service Locations Grid — thin wrapper around the kotlinskidev/city-grid dynamic block (functions/service-locations.php); previously baked a WP_Query directly into the pattern, which only ran once at pattern-cache time and went stale
│   ├── services-section.php                    # Service Section
│   ├── simple-banner.php                       # Simple Banner
│   ├── simple-text.php                         # Simple Text Section
│   ├── tech-stack-chip-clusters.php            # Tech Stack Chip Clusters — scannable category-label + pill-cluster rows, good for an About page (design system "Technology stack" slot B)
│   ├── tech-stack-grouped-cards.php            # Tech Stack Grouped Cards — 4 bordered cards, each an icon head + name/note definition rows, full detail for a dedicated stack page (design system "Technology stack" slot A)
│   ├── tech-stack-icon-tiles.php               # Tech Stack Icon Tiles — 12 original monoline glyphs (assets/icons/tech-stack/*.svg, not vendor logos) in a hover-accented tile grid (design system "Technology stack" slot D)
│   ├── template-404.php                        # 404 Template
│   ├── testimonial-section.php                 # Testimonial Section
│   ├── testimonials-grid.php                   # Testimonials Grid (slug: testimonial-grid)
│   ├── vertical-timeline-layout.php            # Vertical Timeline Layout
│   ├── work-with-me-option-cards.php           # Work With Me Option Cards — 6-card full menu of ways to collaborate, best as its own page (design system "Work with me" slot A)
│   └── work-with-me-split.php                  # Work With Me Split — pitch card left, condensed 6-row option list right, good for a homepage block (design system "Work with me" slot B)
├── polylang/                                   # language flag icons
│   ├── en_US.png
│   └── pl_PL.png
├── src/                                        # TypeScript/SCSS source, compiled by webpack into build/ (gitignored)
│   ├── blocks/                                 # 72 top-level dirs (60 registered blocks + 26 JS-only block-extension filters + 1 post-editor settings panel (service-location) across them — canvas-background/ nests 13 blocks + 1 extension in one dir, so block/extension counts exceed the top-level dir count)
│   │   ├── above-fold/                         # extension: Advanced-tab "Load above the fold" toggle, shown only on blocks registered in functions/deferred-block-assets.php
│   │   │   └── index.tsx
│   │   ├── active-link-state/                  # extension: Advanced-tab opt-out for the sitewide active-page link highlight
│   │   │   └── index.tsx
│   │   ├── animated-counter/                   # extension: count-up-on-scroll for heading/paragraph/group/columns
│   │   │   └── index.tsx
│   │   ├── article-card/                       # dynamic block (render.php, ServerSideRender preview) — cardId attribute only, embeds a kt_article_card post (functions/article-card.php) by ID; card layout/style is edited once in the Site Editor's single-kt_article_card template and propagates to every embed; full color/spacing/border/typography supports (both "border" and legacy "__experimentalBorder" keys) let an individual embed also be restyled per-instance
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit standalone with block.json's default cardId
│   │   │   ├── edit.tsx                        # Inspector card picker (post combobox over kt_article_card) + ServerSideRender preview
│   │   │   ├── index.tsx
│   │   │   ├── panel.tsx                       # PluginDocumentSettingPanel on the kt_article_card edit screen — links the card to an article, sets the optional description override
│   │   │   └── render.php
│   │   ├── article-tags-dynamic/               # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_article_tags_fresh_per_language() (functions/blog-topic-manager.php), placed in templates/article.html — see blog-topics-grid-dynamic/ below for why this folder-based form replaced a bare PHP-only register_block_type()
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── background-effects-controls/        # extension: curated animated CSS background/border effect classes (kt-bg-fx-*), applied via className like hover-animation-controls; manual mode (backgroundEffect/backgroundEffectColor1-3) still bakes into saved content via blocks.getSaveContent.extraProps, but a new backgroundEffectPresetId ComboboxControl over kt_bg_effect_preset posts takes over instead when set — disables the manual Effect select, skips extraProps entirely, and resolution happens server-side via functions/background-effects/render.php so editing a preset propagates everywhere without a re-save, matching the canvasSceneId pattern
│   │   │   └── index.tsx
│   │   ├── banner-carousel/                    # full-width Swiper banner slider
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts                         # exports initBannerCarousel(el) (returns the Swiper instance) so Storybook can mount/destroy a real carousel outside the site's own DOMContentLoaded bootstrap
│   │   │   ├── save.stories.tsx                # Storybook: real Swiper (arrows/pagination/autoplay/multi-slide/fade variants) over a hand-built static markup twin of save.tsx's JSX — the real save() crashes via useBlockProps.save()'s extraPropsFromHooks pipeline reading undefined block.json supports outside a full WP admin bootstrap. Renders via createPortal(..., document.body): nesting the same markup inside the story's normal .editor-styles-wrapper/.kt-storybook-frame ancestor chain leaves every non-first slide's image decoded (canvas drawImage confirms real pixels) but never composited/painted after a slide transition — confirmed via a real DOM element move (not just a config/CSS change) that the ancestor chain itself is the cause, not the image, not React's reconciliation, not any single CSS rule found by inspection
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── bg-effect-preset-settings/          # kt_bg_effect_preset-only block: effectType/color1/color2/color3/duration Inspector controls (SelectControl resets duration to the new type's own default on change) for the one settings block a preset's editor content holds; save()=>null, resolved server-side by functions/background-effects/preset.php's parse_blocks() scan, never rendered directly — same shape as a canvas-background layer block but standalone (not centrally registered via an index.ts aggregator, since there's only one of it)
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   └── index.ts
│   │   ├── blog-topics-grid-dynamic/           # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_blog_topics_grid_fresh_per_language() (functions/blog-topic-manager.php) in get_block_wrapper_attributes() — placed in templates/articles.html. Folder-based register_block_type() (functions/blocks.php) + block.json (apiVersion 3 auto-injects the style attribute from supports.spacing) replaced this block's old bare register_block_type('kotlinskidev/blog-topics-grid-dynamic', ['render_callback' => ...]) in functions/blog-topic-manager.php, which had no client-side registration and so couldn't be added/removed/reordered in the Site Editor or given margin/padding — same fix applied to its 5 siblings (article-tags-dynamic, category-header-dynamic, category-posts-grid-dynamic, other-topics-dynamic, related-articles-dynamic)
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── border-gradient/                    # extension: gradient option merged into the native Border panel for any block with border support (excludes kotlinskidev/button)
│   │   │   └── index.tsx
│   │   ├── breadcrumbs/                        # fixed overlay breadcrumb trail below the header, hidden on homepage by default, slides in/out in sync with the header's own scroll state
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: real BlockEdit dispatcher via RealBlockEdit (shows the InspectorControls sidebar toggle), 3 route variants via BreadcrumbsRouteContext
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts                        # registerBlockType now passes full metadata (was metadata.name only) — the name-only form rendered blank with zero console output once stories went through the real BlockEdit dispatcher, since it skips the attributes/supports WP's PHP bootstrap normally fills in
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── button/                             # standalone CTA button, independent normal/hover color+gradient; useInnerBlocks toggle (default off, so all existing instances are unaffected) swaps the plain-text RichText label for an InnerBlocks area allowing core/paragraph, kotlinskidev/protected-content, kotlinskidev/icon — core/button has no InnerBlocks support at all, so this is the only way to nest e.g. a protected phone number inside a button; render.php renders the wrapper as a bare `<span class="kt-button__link">` instead of `<a>` whenever useInnerBlocks is on AND its own url is empty, since a nested child with its own real link (protected-content's revealed tel:/mailto: anchor) would otherwise end up inside this block's own `<a>`, nesting anchors
│   │   │   ├── ButtonColorControls.tsx
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── canvas-background/                  # every canvas-background block consolidated here — the one subfolder in an otherwise-flat src/blocks/ directory, besides true WP parent/child nesting (hero-carousel/slide etc.)
│   │   │   ├── index.ts                         # central registration: imports each child's block.json+edit.tsx, defines one shared Save()=>null, registerBlockType()s all 13 layer blocks, and imports ./controls/index — this ONE file is editor.ts's only import for the whole directory, which is what makes webpack fold all 14 modules into editor.js instead of 14 separate per-block chunks (also what makes the layer blocks' editor UI work at all — their block.json files declare no editorScript, relying entirely on this bundling path)
│   │   │   ├── controls/                        # extension: canvasSceneId attribute (number, Inspector ComboboxControl over kt_canvas_scene posts) plus canvasScrim/canvasScrimColor/canvasScrimOpacity (boolean + ColorGradientControl + RangeControl, shown once a scene is picked) on any block except the usual excluded set + the 13 layer-* blocks themselves; deliberately only 2 filters (blocks.registerBlockType + editor.BlockEdit), no blocks.getSaveContent.extraProps — resolution happens exclusively in functions/canvas/render.php's render_block filter so editing a scene propagates without a re-save
│   │   │   │   └── index.tsx
│   │   │   ├── layer-aurora/                    # kt_canvas_scene-only layer block: speed/colorStart/colorEnd/opacity Inspector controls for a WebGL drifting, classic-simplex-noise aurora glow rising from the bottom edge, same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/aurora.ts
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-blob/                      # kt_canvas_scene-only layer block: count/speed/color/radiusPct Inspector controls for a soft moving glow-blob; save() returns null (registered centrally via canvas-background/index.ts), attrs are only ever read by functions/canvas/scene.php's parse_blocks() scan, never rendered directly
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-curved-rays/               # kt_canvas_scene-only layer block: rayCount/speed/color/opacity Inspector controls for a WebGL bezier-curved pulsing ray effect (own offscreen <canvas>+shader, cached per-instance, context-loss-hardened — see src/scripts/canvas-background/layers/curved-rays.ts)
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-gradient/                  # kt_canvas_scene-only layer block: colorStart/colorEnd/angleDeg/speed Inspector controls for a background-gradient layer
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-grid-lines/                # kt_canvas_scene-only layer block: opacity/lineCount/color Inspector controls for a faint grid-line layer
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-light-rays/                # kt_canvas_scene-only layer block: rayCount/speed/color/opacity Inspector controls for a WebGL fbm-noise light-rays effect (own offscreen <canvas>+shader, same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/light-rays.ts)
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-nebula/                    # kt_canvas_scene-only layer block: speed/zoom/color/opacity Inspector controls for a WebGL procedural nebula sky — a 27-cell Voronoi search for star points (blackbody-temperature tinted) plus two reduced-to-5-octave fbm calls for cloud density, same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/nebula.ts
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-neon-waves/                # kt_canvas_scene-only layer block: speed/intensity/color/opacity Inspector controls for a WebGL raymarched field of glowing, grayscale neon wave lines (10-step fixed-iteration raymarch loop), same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/neon-waves.ts
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-noise/                     # kt_canvas_scene-only layer block: opacity/jitterAmount/grainSize Inspector controls for a grain/noise texture layer
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-orbit-trails/              # kt_canvas_scene-only layer block: speed/decay/color/opacity Inspector controls for a WebGL pulsing, color-cycling orbit with fading feedback trails — the only layer using a ping-pong framebuffer (two offscreen render targets swapped each frame) rather than a single-pass shader, see src/scripts/canvas-background/layers/orbit-trails.ts
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-star-field/                # kt_canvas_scene-only layer block: layerCount/speed/color/opacity Inspector controls for a WebGL parallax depth-scrolling star field (own offscreen <canvas>+shader, same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/star-field.ts)
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   ├── layer-sweep/                     # kt_canvas_scene-only layer block: speed/angleDeg/width/color Inspector controls for a diagonal light-sweep layer
│   │   │   │   ├── block.json
│   │   │   │   └── edit.tsx
│   │   │   └── layer-warp-field/                # kt_canvas_scene-only layer block: speed/density/color/opacity Inspector controls for a procedural, slowly-rotating 3D star field with a breathing zoom (own offscreen <canvas>+shader, same context-loss-hardened pattern as layer-curved-rays — see src/scripts/canvas-background/layers/warp-field.ts)
│   │   │       ├── block.json
│   │   │       └── edit.tsx
│   │   ├── category-header-dynamic/            # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_category_header_fresh_per_language() (functions/blog-topic-manager.php), placed in templates/category.html — see blog-topics-grid-dynamic/ above for why this folder-based form replaced a bare PHP-only register_block_type()
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── category-posts-grid-dynamic/        # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_category_posts_grid_fresh_per_language() (functions/blog-topic-manager.php), placed in templates/category.html — see blog-topics-grid-dynamic/ above for why this folder-based form replaced a bare PHP-only register_block_type()
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── certificate/                        # dynamic block (render.php, ServerSideRender preview) — certificateId (post combobox over kt_certificate) + layout (badge-grid/feature-cards/compact-strip, same 3 options as certificates-grid-dynamic) attributes, plus per-instance secondaryTextColor/accentColor (ColorGradientControl, "Card Colors" panel) overriding the issuer/issued-date/verify-link/date-pill text colors that otherwise inherit the block's own has-{slug}-color utility class (which carries !important and would otherwise beat any Styles-panel text color); also the one ServerSideRender/dynamic-preview block position-z-index-controls is carved out for (kotlinskidevPosition/kotlinskidevZIndex declared explicitly below, same REST-schema reason as hover-animation-controls), since a certificate card is a common host for an absolutely-positioned canvas-background layer and needs its own Advanced-tab Position/z-index control available too; embeds one certificate's badge/issuer/link, edited once on the certificate post and propagated to every embed; full color/spacing/border/typography supports (declared under both "border" and the legacy "__experimentalBorder" key — this site's installed WP 7.1 core only reads the latter for server-side render, confirmed by probing wp_has_border_feature_support() directly) so editors can restyle the card from the native Styles panel; also the one ServerSideRender/dynamic-preview block hover-animation-controls is enabled on — block.json declares its hoverAnimation/hoverBackgroundColor/hoverTextColor/hoverBorderColor/etc. attributes explicitly, since the REST block-renderer schema used by ServerSideRender 400s on any attribute the block's own block.json doesn't declare. Other ServerSideRender/dynamic-preview blocks (article-card, project-card, city-grid, city-map, the *-dynamic blocks) stay excluded from this and several other cross-cutting filters (responsive-width/height/spacing/order, link-hover-effects, scroll-animations, background-effects-controls, active-link-state, scroll-section-pin-boundary) for the same reason — each would need the same block.json schema treatment before its filter could be re-enabled
│   │   │   ├── block.json
│   │   │   ├── edit.tsx                        # Inspector certificate picker + Layout select + ServerSideRender preview
│   │   │   ├── index.tsx
│   │   │   ├── panel.tsx                       # PluginDocumentSettingPanel on the kt_certificate edit screen — "Fetch details" button posts to admin-ajax (kotlinskidev_fetch_certificate_badge) for a pasted Credly/Accredible URL, pre-fills title/featured image/meta; all fields stay editable for a manual PDF-sourced certificate
│   │   │   └── render.php
│   │   ├── certificates-grid-dynamic/          # dynamic block (render.php, ServerSideRender preview) — layout attribute (badge-grid/feature-cards/compact-strip) + viewAllUrl (compact-strip only), wraps kotlinskidev_render_certificates_grid() (functions/certificate.php) which queries every published kt_certificate post; replaces the 3 certificates-*.php patterns' old hardcoded PHP arrays
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── city-grid/                          # extension: per-breakpoint column count + link text color controls for the PHP-only kotlinskidev/city-grid dynamic block (functions/service-locations.php)
│   │   │   └── index.tsx
│   │   ├── contact-card/                       # extension: "Gap between fields" range control for the PHP-only kotlinskidev/contact-card dynamic block (functions/contact-card.php), applied as a --kt-contact-card-gap CSS custom property
│   │   │   └── index.tsx
│   │   ├── contact-detail/                     # kotlinskidev/contact-detail — dynamic block rendering one field (address/phone/email/hours) from kotlinskidev_get_contact_info() (functions/contact-card.php), for placing individually in layouts like the footer instead of the whole kt-contact-card grid; phone/email reuse kotlinskidev_render_protected_contact_field()
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   └── render.php
│   │   ├── contact-form/                       # contact-form-ts/form — contact form + CAPTCHA, posts to admin-post.php
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export with block.json's default attributes
│   │   │   ├── index.tsx
│   │   │   ├── init.ts                         # viewScript: fires form_start (GA4) on first focusin into .contact-form-ts, once
│   │   │   ├── render.php                      # also fires generate_lead/form_error (GA4) inline via window.kotlinskiAnalytics on the contact-success/contact-error redirect
│   │   │   └── style.scss
│   │   ├── content-block/                      # resolves a wp_block reusable post by slug (Polylang-aware)
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export with block.json's default attributes
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── content-tabs/                       # nav-link strip + dynamic content-panel switcher
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes + a placeholder clientId
│   │   │   ├── edit.tsx
│   │   │   ├── save.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts                         # frontend click/keyboard (WAI-ARIA tabs) behavior
│   │   │   ├── portal-context.tsx              # React Context carrying nav/panels slot DOM nodes + active item id
│   │   │   ├── render.php
│   │   │   ├── style.scss
│   │   │   ├── item/                           # repeatable: bundles one nav-link + arbitrary panel content
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── save.tsx
│   │   │   │   └── render.php
│   │   │   └── nav-link/                       # the clickable tab label, full native styling supports
│   │   │       ├── block.json
│   │   │       ├── edit.tsx
│   │   │       ├── save.tsx
│   │   │       └── render.php
│   │   ├── copyrights/                         # footer copyright/year text
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export (no attributes — ServerSideRender-only)
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── cover-lazy-loading/                 # extension: force-disable native lazy loading on cover/image
│   │   │   └── index.tsx
│   │   ├── custom-css-vars/                    # extension: dynamic name/value CSS-custom-property repeater, scoped to kotlinskidev/icon + core/image (SVG theming, e.g. a multi-color logo referencing var(--logo-icon-bg) etc. in its own fill/stroke attributes)
│   │   │   └── index.tsx
│   │   ├── equal-height-columns/               # extension: "Equal height" toggle — core/columns stretches each column's direct child to fill the tallest column; a core/group with a grid layout stretches each grid item to fill its row (class baked into saved static HTML via blocks.getSaveContent.extraProps)
│   │   │   ├── index.test.tsx
│   │   │   └── index.tsx
│   │   ├── faq-layout/                         # extension: Advanced-tab "FAQ columns behavior" (default grid / independent columns + count) for core/group wrapping core/details
│   │   │   └── index.tsx
│   │   ├── gallery-lightbox/                   # image/video gallery with lightbox + mobile media variant
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: interactive editor placeholder (thumbnail + count badge) via useInteractiveAttributes()
│   │   │   ├── edit.tsx
│   │   │   ├── index.tsx
│   │   │   ├── init.ts                         # exports initGalleryLightbox (was module-local) so save.stories.tsx can mount the real lightbox; fires lightbox_open/lightbox_navigate (GA4) via scripts/track-event.ts
│   │   │   ├── save.stories.tsx                # Storybook: real click-to-open lightbox (live Swiper) via createPortal + initGalleryLightbox() — hand-built markup twin of Save, not real useBlockProps.save() (same crash class as banner-carousel)
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── google-maps/                        # googlemaps/google-maps-block — Google Maps embed
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   └── render.php
│   │   ├── group-link/                         # extension: makes a whole core/group clickable/keyboard-activatable via a picked URL, without hijacking clicks on nested links/buttons/form fields
│   │   │   └── index.tsx
│   │   ├── hero-carousel/                      # full-bleed hero/Swiper carousel, image or video background
│   │   │   ├── slide/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── render.php
│   │   │   │   └── save.tsx
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── holder/                             # single grid cell, parent-locked to simple-grid
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with no props
│   │   │   ├── edit.tsx
│   │   │   ├── render.php
│   │   │   └── save.tsx
│   │   ├── hover-animation-controls/           # extension "Hover Effects": ~13 canned hover animation classes, combinable transform effects (hoverAnimationExtra), start/end opacity fade, background/text/border hover color (alpha-capable); also enabled for kotlinskidev/certificate (block.json declares the attributes so the REST block-renderer schema accepts them)
│   │   │   └── index.tsx
│   │   ├── icon/                               # standalone SVG icon block — Media Library picker, size/color/aria-label, renders via kotlinskidev_inline_nav_icon()
│   │   ├── icon-extension/                     # extension: leading icon for kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   │   │   └── index.tsx
│   │   ├── image-hover-overlay/                # extension: adds a heading/description hover-reveal overlay + color pickers to core/image
│   │   │   └── index.tsx
│   │   ├── language-panel/                     # Polylang language switcher trigger + dropdown — render.php applies kotlinskidev_nav_reveal_class_and_style() directly onto .kt-lang-panel__modal, and kotlinskidev_stagger_reveal_items() onto the "Wybierz język:" label + each Polylang-rendered li (markers wp-block-kotlinskidev-nav-paragraph, wp-block-navigation-item) so the label and every language option stagger-fade in as one sequence (functions/nav-reveal-render.php)
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders LanguagePanelEdit via buildEditProps() (full BlockEditProps shape)
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── link-hover-effects/                 # extension: opt out of global link hover styling per block
│   │   │   └── index.tsx
│   │   ├── load-more/                          # extension: "Load More" toggle for core/group — one Inspector panel with items-to-show count, button label, and button style (position, colors, border, hover colors, underline) via style-controls.tsx; revealed items via src/scripts/load-more.ts reading functions/load-more.php's data attributes
│   │   │   ├── index.test.tsx
│   │   │   ├── index.tsx
│   │   │   ├── style-controls.tsx
│   │   │   └── types.ts
│   │   ├── marquee/                            # parent/item pair — continuously scrolling row of technology/skill items, direction configurable (normal/reverse); pure CSS @keyframes animation on .kt-marquee__track (translateX 0 to var(--kt-marquee-shift), speed via --kt-marquee-duration), not a carousel library — a Swiper-based continuousAutoplay implementation was tried first and replaced after repeated loop-boundary/stall bugs proved structural to forcing a slide library into a continuous-ticker role. render.php renders $content once; init.ts clones that single real set at runtime (cloneNode, not innerHTML) until the track is wide enough that one repeat unit alone covers the container — a fixed "duplicate once, shift -50%" technique (tried first) only stays seamless when one unit ≥ container width, confirmed broken live on a short item list in a near-full-width section (and cross-checked against wolanski-web.pl's own reference marquee, which repeats its 11-item set 5× for the same reason) — capped by a lifetime MAX_CLONE_ITERATIONS budget shared across the initial measurement and every later ResizeObserver-triggered top-up; every clone beyond the first real set is marked aria-hidden/non-tabbable, and every image (real + cloned) forced to loading="eager" so a late lazy-load can't desync one repeat's width from another (the icons' own fixed CSS size already prevents this too — belt-and-suspenders). Hover/focus/press/kt-modal-open toggle an .is-paused class (animation-play-state) via JS event listeners, not CSS :hover/:focus-within — needed so a kt-modal's own close-time refocus of the trigger (modal-manager.ts) can be explicitly overridden rather than leaving the marquee stuck paused, with a scroll-triggered fallback resume as a second line of defense; clicking an item with a configured modal opens that item's own kt_modal CPT post via data-kt-modal-target (functions/modals.php's generic system, not functions/marquee.php's older #kt-modal-marquee shell, which nothing currently targets)
│   │   │   ├── block.json
│   │   │   ├── edit.test.tsx
│   │   │   ├── edit.tsx
│   │   │   ├── index.test.ts
│   │   │   ├── index.ts
│   │   │   ├── init.ts                         # viewScript: click-to-populate the shared modal shell before modal-manager.ts's own document click listener opens it (both run synchronously within the same click event, so listener order doesn't matter)
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.test.tsx
│   │   │   │   ├── edit.tsx
│   │   │   │   └── render.php
│   │   │   ├── render.php
│   │   │   ├── save.test.tsx
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── modal-settings-panel/                # PluginDocumentSettingPanel for the kt_modal post type — size (small/medium/large/full), enqueued only on kt_modal edit screens
│   │   │   └── index.tsx
│   │   ├── modal-trigger/                      # extension: adds opensInModal + modalId to kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   │   │   ├── index.tsx                       # withModalTriggerControls (editor.BlockEdit HOC) now exported
│   │   │   └── index.stories.tsx               # Storybook: InspectorControls story renders the real kotlinskidev/button through RealBlockEdit, so the real editor.BlockEdit filter (this module's own addFilter) fires naturally and the Modal panel actually shows in the sidebar; Frontend story exercises real click-to-open via initModalManager() against functions/modals.php's exact modal-shell markup
│   │   ├── model-viewer/                       # interactive .glb model, click-to-toggle via THREE.AnimationMixer + optional drag-to-rotate (OrbitControls) + auto-detected screen-text texture swap, IO-gated + WebGL-feature-detected dynamic import() of a three.js runtime chunk kept out of every other bundle
│   │   ├── nav-banner/                         # nav-scoped: image+heading+description+CTA for mega-menu panels
│   │   │   ├── block.json
│   │   │   ├── render.php
│   │   │   └── index.stories.tsx               # Storybook: Default (mock image via mock-assets.ts) + Empty (placeholder state)
│   │   ├── nav-content/                        # shared editor bundle for nav-banner/image/link/paragraph — all 4 Edit components + attribute interfaces now exported so each block's own folder can import and story them independently
│   │   │   └── index.tsx
│   │   ├── nav-image/                          # nav-scoped: plain (optionally linked) image
│   │   │   ├── block.json
│   │   │   ├── render.php
│   │   │   └── index.stories.tsx               # Storybook: Default (mock image) + Empty (placeholder state)
│   │   ├── nav-language-panel/                 # nav-scoped sibling of language-panel — same Edit component, registered under a second block name; Storybook coverage lives in language-panel/index.stories.tsx, no separate story needed
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-link/                           # nav-scoped styled link/menu-item, independent color/gradient
│   │   │   ├── block.json
│   │   │   ├── render.php
│   │   │   └── index.stories.tsx               # Storybook: interactive label/URL via useInteractiveAttributes()
│   │   ├── nav-paragraph/                      # nav-scoped free-text paragraph, gradient/color-clip text
│   │   │   ├── block.json
│   │   │   ├── render.php
│   │   │   └── index.stories.tsx               # Storybook: interactive content via useInteractiveAttributes()
│   │   ├── nav-popular-pages/                  # nav-scoped sibling of popular-pages
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-reveal-animation/               # extension: "Reveal on Menu Open" Inspector panel (fade/flip/appear type, free-ms delay, distance). core/navigation-link/-submenu, kotlinskidev/nav-*, social-section, search-panel + language-panel are name-scoped (architecturally/by-design nav-or-dropdown-only); the general-purpose kotlinskidev/button is additionally gated on having a core/navigation ancestor (getBlockParentsByBlockName) so the panel never shows on an unrelated page. Triggers off the kt:nav-panel-open/-close custom events (dispatched by hamburger.ts/mega-menu.ts/dropdown-panel.ts) instead of IntersectionObserver
│   │   │   ├── index.test.tsx
│   │   │   └── index.tsx
│   │   ├── nav-search-panel/                   # nav-scoped sibling of search-panel
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── navigation/                         # full replacement for core/navigation — mega-menu + mobile overlay
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export with block.json's default attributes
│   │   │   ├── index.tsx
│   │   │   ├── nav-icon-filter.tsx
│   │   │   └── render.php
│   │   ├── other-topics-dynamic/               # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_other_topics_fresh_per_language() (functions/blog-topic-manager.php), placed in templates/category.html — see blog-topics-grid-dynamic/ above for why this folder-based form replaced a bare PHP-only register_block_type()
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── parallax/                           # extension: parallax background-scroll toggle + Intensity slider (0-30, default 15) for core/cover
│   │   │   └── index.tsx
│   │   ├── popular-pages/                      # most-viewed pages list, Yoast-noindex-filtered
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders PopularPagesEdit via buildEditProps() (full BlockEditProps shape)
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── position-z-index-controls/          # extension: Advanced-tab Position (static/relative/absolute/sticky) + Stacking order (z-index, below/0-5) selects, registering kotlinskidevPosition/kotlinskidevZIndex attributes and live editor.BlockListBlock canvas-preview classes on every non-dynamic-preview block, plus kotlinskidev/certificate specifically (its only carved-out dynamic-preview block, same pattern as hover-animation-controls — needs the attributes declared explicitly in certificate/block.json too, for ServerSideRender's REST schema); the actual kt-position-*/kt-z-* class (src/styles/position-utilities.scss) is applied frontend-side by functions/position-z-index.php's render_block filter, which runs uniformly for static and dynamic blocks alike, so no blocks.getSaveContent.extraProps is needed here
│   │   ├── pricing-cards/                      # parent/item pair (mirrors process-steps/scroll-section-item) — side-by-side pricing tiers, editors add/remove via sidebar "+ Add Tier"/"Remove Last Tier"; per-card "featured" toggle adds a floating badge + accent border/glow, with its own font-size + color/gradient controls scoped to just the badge span (not native block supports, which would leak onto the card's other text); card content is unrestricted InnerBlocks (feature bullets are stacked kotlinskidev/translated-text blocks, not core/list, so each line stays per-language translatable); cards stretch equal-height with the CTA pinned to the bottom via margin-top:auto, stack vertically under $breakpoint-mobile; parent uses useInnerBlocksProps() (not <InnerBlocks/>) so the editor's 3-column row matches the frontend exactly
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with a placeholder clientId (no attributes prop)
│   │   │   ├── edit.tsx
│   │   │   ├── edit.test.tsx
│   │   │   ├── index.test.ts
│   │   │   ├── index.ts
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── edit.test.tsx
│   │   │   │   ├── render.php
│   │   │   │   ├── save.tsx
│   │   │   │   └── save.test.tsx
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   ├── save.test.tsx
│   │   │   └── style.scss
│   │   ├── process-steps/                      # parent/item pair (mirrors scroll-section/scroll-section-item) — numbered step timeline, editors add/remove steps via sidebar "+ Add Step"/"Remove Last Step" (1 to 5+, no code change); step numbers, connecting line and first-step highlight are pure CSS (counter-increment + :first-child), no per-step attribute; stacks into a vertical timeline under $breakpoint-mobile; parent uses useInnerBlocksProps() (not <InnerBlocks/>) so the editor's 3-column row matches the frontend exactly
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with a placeholder clientId (no attributes prop)
│   │   │   ├── edit.tsx
│   │   │   ├── edit.test.tsx
│   │   │   ├── index.test.ts
│   │   │   ├── index.ts
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── edit.test.tsx
│   │   │   │   ├── render.php
│   │   │   │   ├── save.tsx
│   │   │   │   └── save.test.tsx
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   ├── save.test.tsx
│   │   │   └── style.scss
│   │   ├── project-card/                       # dynamic block (render.php, ServerSideRender preview) — cardId attribute only, embeds a kt_project_card post (functions/project-card.php) by ID; card layout/style is edited once in the Site Editor's single-kt_project_card template and propagates to every embed; full color/spacing/border/typography supports (both "border" and legacy "__experimentalBorder" keys) let an individual embed also be restyled per-instance
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default cardId
│   │   │   ├── edit.tsx                        # Inspector card picker (post combobox over kt_project_card) + ServerSideRender preview
│   │   │   ├── index.tsx
│   │   │   ├── panel.tsx                       # PluginDocumentSettingPanel on the kt_project_card edit screen — description (hover overlay text), tags, project URL
│   │   │   └── render.php
│   │   ├── protected-content/                  # RSA-encrypted, bot-obfuscated content (email/phone/address/other); linkLabel + buttonStyle attributes let phone/email reveal a fixed label styled as a site button instead of the raw value — core/button can't be a workaround (no InnerBlocks support, so nothing can nest inside it)
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export with block.json's default attributes
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── related-articles-dynamic/           # dynamic block (render.php, ServerSideRender preview, no attributes) wrapping kotlinskidev_render_related_articles_fresh_per_language() (functions/blog-topic-manager.php), placed in templates/article.html — see blog-topics-grid-dynamic/ above for why this folder-based form replaced a bare PHP-only register_block_type()
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── responsive-display/                 # extension: per-breakpoint show/hide
│   │   │   └── index.tsx
│   │   ├── responsive-font-size/               # extension: per-breakpoint font-size override
│   │   │   └── index.tsx
│   │   ├── responsive-height/                  # extension: per-breakpoint min-height override (e.g. overrides core Cover block's 430px default on mobile)
│   │   │   └── index.tsx
│   │   ├── responsive-image/                   # static image block, swaps desktop/mobile image at a breakpoint
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── responsive-order/                   # extension: per-breakpoint flex/grid order
│   │   │   └── index.tsx
│   │   ├── responsive-spacing/                 # extension: per-breakpoint padding/margin per side
│   │   │   └── index.tsx
│   │   ├── responsive-width/                   # extension: per-breakpoint width/max-width
│   │   │   └── index.tsx
│   │   ├── scroll-animations/                  # extension: scroll-triggered entrance animation + delay
│   │   │   └── index.tsx
│   │   ├── scroll-section/                     # horizontal-pan-on-vertical-scroll section (GSAP ScrollTrigger) — pins .scroll-section itself with GSAP's own pinSpacing:true (spacer sized once, no per-frame reconciliation). The nearest ancestor with the scroll-section-pin-boundary class (toggled via the scroll-section-pin-boundary extension below) gets pinned instead of the bare section, letting neighboring content peek above/below during the scrub; style.scss strips the kt-full-bleed-breakout mixin's static transform from any .full-width ancestor so GSAP's own pinType auto-detection stays on native, compositor-driven "fixed"
│   │   │   ├── docs/
│   │   │   │   └── SKILL.md
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── render.php
│   │   │   │   └── save.tsx
│   │   │   ├── CLAUDE.md
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── scroll-section-pin-boundary/        # extension: "Scroll Section Pinning (GSAP)" toggle on every block (minus a small dynamic-preview/raw-markup exclusion list) — applies the scroll-section-pin-boundary class scroll-section/init.ts looks for, same blocks.registerBlockType/editor.BlockEdit/blocks.getSaveContent.extraProps pattern as scroll-animations
│   │   │   └── index.tsx
│   │   ├── scroll-to-top/                      # "back to top" — fixed-arrow or full-width-bar variant
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export with block.json's default attributes
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss                      # bar-variant layout only (fixed-arrow styling stays in styles/scroll.scss)
│   │   ├── search-panel/                       # search trigger button opening a modal/dropdown panel — render.php applies kotlinskidev_nav_reveal_class_and_style() directly onto .kt-search-panel__modal, and kotlinskidev_stagger_reveal_items() onto the search form, the popular-pages title, and each kt-popular-pages__item (markers wp-block-search, kt-popular-pages__title, kt-popular-pages__item) so the whole dropdown's content stagger-fades in as one sequence (functions/nav-reveal-render.php)
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders SearchPanelEdit via buildEditProps() (full BlockEditProps shape)
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── service-location/                   # not a block — build entry only, enqueued via enqueue_block_editor_assets (functions/service-locations.php)
│   │   │   └── panel.tsx                       # PluginDocumentSettingPanel on the service_location edit screen — sets the "city" post-meta field that every bound heading/paragraph on the page reads
│   │   ├── shared/                             # shared editor UI: ColorGradientControl, PanelColorGradientSettings (native Text/Background-style collapsed row+popover), NavIconPicker
│   │   │   ├── color-gradient-control.ts
│   │   │   └── nav-icon-picker.tsx
│   │   ├── simple-grid/                        # CSS-grid container, column count derives from Holder children
│   │   │   ├── block.json
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── slider/                             # wpe/slider — generic Swiper carousel, InnerBlocks (core/cover) slides; centerSlides+peek for a centered-peek layout
│   │   │   ├── assets/
│   │   │   ├── block.json
│   │   │   ├── constants.ts
│   │   │   ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │   │   ├── edit.tsx
│   │   │   ├── editor.scss
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   ├── style.scss
│   │   │   └── swiper-init.ts
│   │   ├── slider-modal-trigger/               # extension: adds modalId to core/cover slides inside wpe/slider (className contains swiper-slide)
│   │   │   └── index.tsx
│   │   ├── social-section/                     # social-links row, ancestor: core/navigation
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   └── render.php
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   ├── social-item-edit.stories.tsx    # Storybook: renders the named SocialItemEdit export via buildEditProps() (full BlockEditProps shape), using item/block.json's defaults
│   │   │   └── social-section-edit.stories.tsx # Storybook: renders the named SocialSectionEdit export via buildEditProps() (full BlockEditProps shape)
│   │   ├── text-gradient/                      # extension: "Text Gradient" row in the native Color panel for any block with color-text support (core/paragraph, core/heading, etc.), rendered via core's own PanelColorGradientSettings so it looks/behaves exactly like the native Text/Background rows — see functions/text-gradient.php for the frontend/render side
│   │   │   ├── index.test.tsx
│   │   │   └── index.tsx
│   │   ├── text-justify-controls/              # extension: toolbar Justify align button for paragraph/heading
│   │   │   └── index.tsx
│   │   ├── text-line-clamp/                    # extension: "Truncate Text" line-clamp + Read more/Read less toggle for core/paragraph
│   │   │   └── index.tsx
│   │   ├── text-shadow-support/                # extension: text-shadow swatch picker for shadow-supporting blocks
│   │   │   ├── TextShadowSwatches.tsx
│   │   │   └── index.tsx
│   │   ├── theme-switcher/                     # dark/light mode toggle button
│   │   │   ├── block.json
│   │   │   ├── index.stories.tsx               # Storybook: renders the named Edit export (no attributes — ServerSideRender-only)
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   └── translated-text/                    # heading/paragraph translated via Polylang strings (pll__()), so one template markup is shared across all languages instead of a per-language duplicate template — see functions/translated-text.php for the admin-side string registration
│   │       ├── block.json
│   │       ├── edit.stories.tsx                # Storybook: renders Edit with block.json's default attributes
│   │       ├── edit.tsx
│   │       ├── index.ts
│   │       └── render.php
│   ├── formats/                                # custom RichText format types
│   │   ├── glow-text/
│   │   │   └── index.tsx                       # registers the kotlinskidev/glow-text RichText format — wraps the selection in <span class="has-enhanced-hover-glow" style="--hover-text-spotlight-color:...">, reusing hover-glow.scss/hover-glow.ts entirely as-is (same class the block-level Hover Effects panel's toggle uses, so no new CSS/JS needed); popover UI mirrors gradient-highlight's (solid color only, no gradient — matches the block-level glow's own gradient-text exclusion)
│   │   └── gradient-highlight/
│   │       ├── editor.scss                     # editor-only styling for the format's popover UI
│   │       ├── index.tsx                       # registers the gradient-highlight RichText format
│   │       └── style.scss                      # frontend + editor shared styling for the rendered span
│   ├── scripts/                                # frontend TS modules, bundled via src/index.ts / src/critical.ts
│   │   ├── accessibility.ts                    # DOM/motion/video a11y helpers, reduced-motion checks
│   │   ├── active-link-state.ts                 # single-pass DOM scan on load: marks <a href> pointing at location.pathname with kt-link-current/aria-current and blocks its click (unless a data-link-navigates ancestor + aria-haspopup panel trigger); reads window.kotlinskidevActiveLinkState (enabled/blockClicks) localized by functions/active-link-state.php — replaced a render_block PHP filter that cost ~104ms/page (redundant per-anchor URL parsing + ancestor re-scanning of already-processed block content)
│   │   ├── analytics-providers/                # multi-vendor analytics dispatch — add a new tracking system here, call sites (track-event.ts's trackEvent()) never change
│   │   │   ├── types.ts                        # AnalyticsProvider interface ({ id, isReady(), send() }) + shared AnalyticsEventParams type
│   │   │   ├── gtag-provider.ts                 # sends event name/params through to window.gtag('event', ...) verbatim
│   │   │   ├── gtag-provider.test.ts
│   │   │   ├── meta-pixel-provider.ts           # maps our event names to Meta's own standard events where one exists (generate_lead → Lead, etc. via STANDARD_EVENT_NAMES) and falls back to fbq('trackCustom', ...) otherwise
│   │   │   ├── meta-pixel-provider.test.ts
│   │   │   ├── routing.ts                       # EVENT_PROVIDER_IDS: which provider(s) each event name reaches, defaulting to gtag-only — the one place to add a provider to (or remove one from) a specific event
│   │   │   └── routing.test.ts
│   │   ├── analytics.ts                        # sitewide side effects — via main.js only (never import into a per-block bundle, duplicates the listener): delegated document click listener firing cta_click/select_content(content_type:"project")/language_switch from existing markup conventions (.wp-block-button__link/.kt-button__link, .kt-project-card, .kt-lang-panel__list a[hreflang]) or an explicit data-ga-event/data-ga-* attribute, plus cookie_consent_click/accessibility_toggle_click for two third-party plugin trigger buttons we don't render ourselves (Complianz's .cmplz-btn.cmplz-manage-consent, OneTap's .onetap-toggle — delegation here instead of editing plugin files, brittle if either plugin renames its class); page_not_found fires once on load via the error404 body class; exposes window.kotlinskiAnalytics.trackEvent for PHP-rendered inline scripts (e.g. contact-form/render.php); re-exports track-event.ts's trackEvent
│   │   ├── animated-counter.ts                 # counts up numeric values on scroll into view
│   │   ├── canvas-background/                  # DB-managed, zero-deploy canvas background engine (functions/canvas/scene.php resolves the recipe server-side, this just consumes it)
│   │   │   ├── init.ts                          # eager glue (own webpack entry, manually declared in webpack.config.js — not auto-scanned like src/blocks/): queries .kt-canvas-bg[data-canvas-recipe], persistent IntersectionObserver toggles each instance's active flag (not one-shot unobserve), dynamic import()s ./runtime only once a host nears the viewport
│   │   │   ├── runtime.ts                       # heavy chunk (canvas-background-runtime): one shared module-level requestAnimationFrame loop drives every mounted instance and fully stops once none are active; mount()/setActive() exports; resolves var(--wp--preset--color--*) params to concrete colors via a fresh per-call probe element (cached per instance, invalidated on html[class] change so light/dark toggling updates live); DPR-aware ResizeObserver sizing; a shared MutationObserver sweeps instances whose host left the DOM
│   │   │   ├── registry.ts                      # fixed layerType → draw-function map — the only place a layer recipe's JSON is ever consumed, never eval()/Function()
│   │   │   ├── types.ts                         # CanvasRecipe/CanvasLayer/CanvasDrawContext shared types
│   │   │   ├── engine.test.ts                   # mount/pause-resume/reduced-motion/shared-loop-stop coverage against runtime.ts, mocking rAF/ResizeObserver/canvas 2D context
│   │   │   └── layers/                          # one draw(ctx, drawContext) function per src/blocks/canvas-background/layer-* block type (gradient, noise, grid-lines, blob, sweep — pure Canvas2D; light-rays, curved-rays, star-field, warp-field, nebula, aurora, neon-waves — own offscreen WebGL canvas+shader each, single-pass, cached per-instance via the shared cache object, all with webglcontextlost/restored recovery; orbit-trails — same WebGL+context-loss pattern but two-pass, ping-ponging a pair of offscreen framebuffers each frame to accumulate a fading feedback trail)
│   │   ├── common.ts                           # shared small helpers
│   │   ├── cookie-consent.ts                   # replaces Complianz consent button with custom cookie icon
│   │   ├── editor-theme-toggle.ts              # dark/light toggle button inside the block editor canvas
│   │   ├── faq-accordion.ts                    # WAAPI height-animated open/close for FAQ details accordion; fires faq_expand (GA4) via track-event.ts on open only, not close
│   │   ├── group-link.ts                       # click/keyboard delegation for .kt-group-link, skips nested interactive elements
│   │   ├── hamburger.ts                        # mobile nav overlay open/close, submenu collapse, scroll-lock
│   │   ├── hide-nav-on-scroll.ts               # hides/shows nav bar based on scroll direction
│   │   ├── hover-glow.ts                       # cursor-following glow for any block with "Enhanced Glow" enabled in the Hover Effects panel — not button-only: kotlinskidev/button, core/button, and any other block (paragraph, heading, group, etc.) — rAF-throttled pointermove sets --kt-glow-x/y relative to the painted text element itself (.kt-button__label, .wp-block-button__link, or the element itself for the generic case), gated behind (hover: hover) and (pointer: fine) and skipped under prefers-reduced-motion
│   │   ├── hover-glow.test.ts
│   │   ├── image-lightbox.ts                   # lightbox open/close/context capture for gallery images; fires lightbox_open (GA4) via track-event.ts on activation
│   │   ├── language-panel.ts                   # wraps initDropdownPanels for .kt-lang-panel
│   │   ├── language.ts                         # small language-related DOM script
│   │   ├── line-clamp.ts                       # ResizeObserver-driven overflow check + click toggle for .kt-line-clamp-toggle (Read more/Read less); fires read_more_click (GA4) via track-event.ts on every toggle, action param distinguishes expand/collapse
│   │   ├── load-more.ts                        # scans [data-kt-load-more-initial], hides children past the limit, wraps a reveal-on-click button in a .kt-load-more__wrapper (alignment), applies its style data attributes as inline styles, and swaps to hover-color overrides on mouseenter/focus (reverting on mouseleave/blur) — reusable across any core/group flagged by functions/load-more.php; fires load_more_click (GA4) via track-event.ts on reveal, with an items_revealed count
│   │   ├── mega-menu.ts                        # desktop mega-menu open/close/backdrop + delay timers
│   │   ├── nav-reveal.ts                   # listens for kt:nav-panel-open/-close (dispatched by hamburger.ts/mega-menu.ts/dropdown-panel.ts), toggles .visible on *-on-reveal elements — both descendants of the dispatched container AND the container itself, since search/language-panel put the class directly on the dispatched modal — so content stagger/fades in via --reveal-delay instead of on scroll
│   │   ├── modal-manager.ts                    # delegated click handler for [data-kt-modal-target]/a[href^="#kt-modal-"], focus trap + inert background, reuses scroll-lock + panel-coordinator; initModalManager() now exported with an immediate-run fallback (matching gallery-lightbox/init.ts) so Storybook (page already loaded) can call it directly instead of waiting on a DOMContentLoaded that already fired; fires modal_open (GA4) via track-event.ts on every open, with the opened modal's id — separate from gallery-lightbox's own lightbox_open
│   │   ├── page-views.ts                       # posts page-view AJAX beacon on scroll/visibility-change
│   │   ├── protected-content.ts                # frontend reveal/decrypt handler for protected-content block; fires protected_content_reveal (GA4) via track-event.ts on a successful reveal only, not on a failed decrypt
│   │   ├── restoration.ts                      # stores scrollY on pagehide (localStorage), restores it on pageshow for back_forward and reload navigations only (not a plain navigate) — pageshow fires after window's load event, so the restore always happens after marquee/ScrollTrigger have already settled, pairing with functions/scroll-restoration.php's history.scrollRestoration = 'manual' to stop the browser's own earlier, unsynced auto-restore. Restoring retries scrollTo() every animation frame (bounded by a stable-frame count + hard frame cap) rather than a single call, since a pinSpacing:false scroll-section only grows the document's real scrollHeight in response to scroll events — a one-shot scrollTo() gets silently clamped to the still-small, ungrown height and never catches up
│   │   ├── scroll-animations.ts                # IntersectionObserver entrance-animation trigger
│   │   ├── scroll-to-top.ts                    # fixed-arrow visibility/progress ring + bar-variant click wiring; fires scroll_to_top_click (GA4) via track-event.ts with a fixed/bar variant param, from the one shared handler both variants (and keyboard activation) call
│   │   ├── search-panel.ts                     # wraps initDropdownPanels for .kt-search-panel, autofocuses input; fires search_panel_open (GA4) via track-event.ts on open
│   │   ├── smooth-scroll-offset.ts             # smooth-scrolls anchor links with header-height offset
│   │   ├── track-event.ts                      # trackEvent(name, params) — first checks window.kotlinskiAnalyticsConfig.disabledEvents (localized by functions/analytics-events.php from the wp-admin Tracking settings, no-ops for every provider if listed), then looks up analytics-providers/routing.ts for which provider(s) this event reaches and calls send() on each that's isReady(); stateless dispatcher, no direct vendor calls of its own, safe to import into any per-block bundle without duplicating anything — analytics.ts re-exports it and adds the sitewide side-effecting delegation on top
│   │   ├── sticky-header.ts                    # enables/disables sticky header based on scroll threshold
│   │   ├── theme-switcher.ts                   # dark/light theme apply + OS prefers-color-scheme listener; fires theme_mode_toggle (GA4) via track-event.ts only on a real user toggle, not the initial stored/OS-default apply
│   │   └── utils.ts                            # shared debounce/getBreakpoints/getScrollTop/isMobile helpers
│   ├── styles/                                 # SCSS source partials
│   │   ├── above-the-fold.scss                 # critical layout-shift prevention rules
│   │   ├── accessibility.scss                  # skip-link, prefers-reduced-motion handling
│   │   ├── admin-bar.scss                      # admin-bar-specific overrides (editor-only bundle)
│   │   ├── ai-disclosure.scss                  # .kt-ai-disclosure-badge — absolutely-positioned bottom-left corner label, opaque background so it reads on any image
│   │   ├── animations.scss                     # hover animation class definitions; transform effects (jump/scale/rotate/bounce) compose via --kt-hover-fx-* custom properties so multiple can combine on one element
│   │   ├── article-card.scss                   # .kt-article-card outer card shell (shadow, top corner radius); most per-part styling now lives as block-supports attributes on templates/single-kt_article_card.html instead
│   │   ├── background-effects.scss             # curated animated CSS background/border/text effect classes (kt-bg-fx-*), paired with background-effects-controls
│   │   ├── blog.scss                           # breadcrumbs + taxonomy/tag styling
│   │   ├── border-gradient.scss                # .kt-has-gradient-border utility class (universal border-gradient extension)
│   │   ├── button.scss                         # .kt-button component styles
│   │   ├── button-style-variants.scss          # default ::before border gradient for the 4 core/button .is-style-gradient-outline-{light,dark,adaptive,adaptive-contrast} variants registered in functions/button-style-variants.php; builds on nav.scss's generalized [class*="is-style-gradient-outline"] block (background/mask/hover already handled there) — the fill-*/outline-* variants need no SCSS at all, their color/border comes straight from theme.json's styles.blocks.core/button.variations
│   │   ├── canvas-background.scss              # .kt-canvas-bg positioning (absolute inset:0, pointer-events:none, border-radius:inherit) + a static CSS gradient fallback shown until src/scripts/canvas-background/init.ts mounts a <canvas> (or permanently, with JS disabled) — safe to ship sitewide, unlike the JS engine which is conditionally enqueued. Also .kt-canvas-scrim — same absolute/inset:0 positioning, painted via DOM order above .kt-canvas-bg (both sit at z-index:-1, so later-in-markup wins) and below the host's normal-flow content; its actual color/opacity come from an inline style PHP writes per-block-instance, not from this stylesheet
│   │   ├── certificate.scss                    # .kt-certificate-{badge-card,feature-card,compact-pill} — default visual styling (border/background/padding/layout) for the kotlinskidev/certificate block's 3 layouts, overridden in the cascade by get_block_wrapper_attributes()'s own inline style/classes whenever an editor sets a color/spacing/border/typography value in the Styles panel; .kt-certificate__verify-link — sliding-underline-hover mixin (gradient underline on hover/focus) for the Verify/View-credential links in functions/certificate.php's badge-card and feature-card renderers
│   │   ├── city-grid.scss                      # .kt-city-grid responsive column-count + link text color custom properties, paired with the city-grid extension
│   │   ├── city-map.scss                       # .kt-city-map embed wrapper + expand button, and the .kt-city-map-lightbox fullsize overlay (paired with src/scripts/city-map-lightbox.ts), for the kotlinskidev/city-map dynamic block
│   │   ├── collab-split.scss                   # mobile text-align override for .kotlinskidev-collab-split-heading/-copy, paired with patterns/collaborations-split.php
│   │   ├── complianz.scss                      # Complianz cookie-consent plugin dark/light overrides
│   │   ├── components.scss                     # editor placeholder components
│   │   ├── contact-card.scss                   # .kt-contact-card two-column address/hours/phone/email grid for the kotlinskidev/contact-card dynamic block
│   │   ├── contact-detail.scss                 # .kt-contact-detail__label — optional field-name prefix for the kotlinskidev/contact-detail dynamic block
│   │   ├── device-mockup.scss                  # .kt-device-mockup bezel/glow decorative wrapper for patterns/project-carousel-bottom-peek.php's screenshot frame
│   │   ├── editor-overrides.scss               # block-editor canvas style overrides (editor-only bundle), incl. forcing .wp-block-buttons > .wp-block-button.wp-block-group (a core/group styled as a button, not a real core/button) back to auto-width — core/group's "flow" layout support stretches it full-width in the editor only
│   │   ├── equal-height-columns.scss           # .kt-equal-height-columns: flex-column columns + flex:1 direct children for core/columns, and height:100% grid items for a core/group grid, paired with the equal-height-columns extension
│   │   ├── faq-accordion.scss                  # FAQ details 2-col grid, +/− icon, animating-state overflow
│   │   ├── footer.scss                         # footer layout (top/brand/nav sections)
│   │   ├── global.scss                         # broad utility classes, social-link overrides
│   │   ├── gradients.scss                      # gradient background utility class
│   │   ├── group-link.scss                     # cursor + focus-visible styling for .kt-group-link, paired with the group-link extension
│   │   ├── hover-glow.scss                      # .has-enhanced-hover-glow cursor glow as a text-clipped radial-gradient background-image (background-clip: text) on the hover color — kotlinskidev/button's .kt-button__label, core/button's .wp-block-button__link directly, and (new) any other block directly, same fixed 5rem radius everywhere (root-relative, deliberately not scaled to the element's own font-size — an em-based radius looked oversized/washed-out on large headings in practice); can't bleed onto a background since it's clipped to text glyphs, not blended; scoped to (hover: hover)/(pointer: fine), disabled under prefers-reduced-motion; spotlight-gradient/text-clip/reduced-motion-reset boilerplate shared via mixins.scss's kt-glow-* mixins
│   │   ├── image-hover-overlay.scss            # hover/focus-within reveal + editor preview for .kt-image-hover-overlay, paired with the image-hover-overlay extension
│   │   ├── kotlinskiwind.scss                  # hand-rolled Tailwind-like utility classes
│   │   ├── language-panel.scss                 # language switcher panel styling
│   │   ├── language.scss                       # language button styling
│   │   ├── lazy.scss                           # contact-form success/error state + lazy-load styles
│   │   ├── line-clamp.scss                     # .kt-line-clamp truncation + .kt-line-clamp-toggle gradient-text button, paired with the text-line-clamp extension
│   │   ├── link-card.scss                      # .kt-link-card hover/overflow treatment (+ --lift/--hover-surface modifiers) and .kt-pill-link hover, shared by the native-block link-card/pill patterns
│   │   ├── link-hover-effects.scss             # link hover-effect utility classes
│   │   ├── link.scss                           # link styling, underline-hover effect + exception lists
│   │   ├── load-more.scss                      # .kt-load-more-hidden + .kt-load-more__wrapper + .kt-load-more__button (incl. hover state), paired with the load-more extension
│   │   ├── logo-dim.scss                       # .kt-logo-dim grayscale-until-hover treatment for collaborator/logo-wall image tiles
│   │   ├── mega-menu.scss                      # desktop mega-menu structure/positioning
│   │   ├── mixins.scss                         # shared SCSS mixins (kt-panel-trigger, kt-not(), reveal-animation-base/reveal-opacity-only/reveal-fade-direction/reveal-flip-animation/reveal-generate-translate-distances/reveal-generate-flip-rotations shared by scroll-animations.scss + nav-reveal-animations.scss, kt-glow-spotlight/kt-glow-text-clip/kt-glow-reduced-motion-text-reset shared by hover-glow.scss, etc.)
│   │   ├── mobile-footer-menu.scss             # fixed mobile bottom-nav menu
│   │   ├── modal.scss                          # kt-modal overlay shell — fixed, z-index 99999, size variants, always-in-DOM
│   │   ├── nav.scss                            # main site header/nav layout, logo styling
│   │   ├── nav-reveal-animations.scss     # fade/flip -on-reveal classes (critical, header is always above the fold) sharing mixins.scss's reveal-* mixins with scroll-animations.scss; transition-delay reads the --reveal-delay custom property set per-block
│   │   ├── order.scss                          # responsive block-order utility styles
│   │   ├── page.scss                           # generic page/post layout
│   │   ├── parallax-critical.scss              # parallax cover-block styling (critical split)
│   │   ├── parallax.scss                       # parallax cover-block styling (deferred split)
│   │   ├── plugins.scss                        # third-party plugin overrides
│   │   ├── project-card.scss                   # .kt-project-card outer shell + circular arrow-link button + tags line; image/title/button styling itself lives as block-supports attributes on templates/single-kt_project_card.html
│   │   ├── responsive-height.scss              # .kt-has-responsive-height-{desktop,tablet,mobile} utility classes
│   │   ├── responsive-width.scss               # .kt-has-responsive-width utility class
│   │   ├── scroll-animations-critical.scss     # scroll entrance animation mixins (critical split)
│   │   ├── scroll-animations.scss              # scroll entrance animation mixins (deferred split)
│   │   ├── scroll.scss                         # scroll-to-top button + progress ring
│   │   ├── search-panel.scss                   # search dropdown panel + modal, popular-pages list
│   │   ├── search.scss                         # search form/input/results styling
│   │   ├── shortcodes.scss                     # empty placeholder file
│   │   ├── social.scss                         # social nav/menu block styling
│   │   ├── step-timeline.scss                  # .kt-timeline-rail/-badge/-connector rail layout for patterns/how-to-prepare-timeline.php
│   │   ├── submenu.scss                        # mobile/dropdown submenu tree styling
│   │   ├── tailwind.scss                       # small text-shadow utility classes
│   │   ├── text-justify.scss                   # .has-text-align-justify utility
│   │   ├── theme-colors.scss                   # adaptive color vars + gradient-text/gradient-border-bg mixins (gradient-border itself lives in mixins.scss)
│   │   ├── theme.scss                          # theme-switcher component styling
│   │   ├── timeline.scss                       # vertical career-timeline pattern styling
│   │   └── variables.scss                      # SCSS breakpoint variables, imported by ~20 partials
│   ├── types/                                  # TS type shims/augmentations
│   │   ├── swiper-bundle.d.ts
│   │   └── wp-block-editor-augment.d.ts
│   ├── utils/                                  # shared TS helpers reused across blocks/scripts
│   │   ├── carousel/
│   │   │   ├── CarouselPanel.tsx               # shared carousel settings InspectorControls panel
│   │   │   ├── _carousel-nav.scss              # shared carousel nav-arrow/pagination SCSS partial
│   │   │   ├── buildConfig.ts                  # builds a Swiper config object from block attributes
│   │   │   ├── initSwiper.ts                   # instantiates Swiper with Navigation/Pagination/Keyboard/Autoplay
│   │   │   └── types.ts                        # CarouselSettings TS interface shared by carousel blocks
│   │   ├── class-picker/
│   │   │   ├── index.tsx                       # editor HOC: checkbox-list InspectorControls for custom class toggling
│   │   │   └── style.scss                      # styling for the class-picker inspector panel
│   │   ├── zoom/
│   │   │   └── attachImageZoom.ts              # pinch-to-zoom/pan gesture handler for image lightbox
│   │   ├── animation-options.ts            # ANIMATION_TRANSLATE_OPTIONS + buildAnimationTypeOptions()/supportsDistanceControl() shared by scroll-animations/index.tsx + nav-reveal-animation/index.tsx so neither duplicates the animation type/distance option lists
│   │   ├── dropdown-panel.ts                   # generic trigger/modal dropdown-panel controller (used by language-panel.ts + search-panel.ts); dispatches kt:nav-panel-open/-close on the modal element so nav-reveal.ts can stagger its contents in, same mechanism as the mega-menu/hamburger
│   │   ├── dynamic-preview-blocks.ts           # DYNAMIC_PREVIEW_BLOCKS: PHP-only ServerSideRender blocks (city-grid, city-map) excluded from every sitewide unconditional attribute-injecting editor filter, since WP's block-renderer REST schema rejects any attribute the block's own PHP schema doesn't declare
│   │   ├── nav-reveal-events.ts           # NAV_PANEL_OPEN_EVENT/NAV_PANEL_CLOSE_EVENT constants + dispatchNavPanelOpen()/dispatchNavPanelClose() CustomEvent helpers shared by hamburger.ts, mega-menu.ts, and scripts/nav-reveal.ts
│   │   ├── panel-coordinator.ts                # registry: opening one panel closes all others
│   │   ├── scroll-lock.ts                      # reference-counted documentElement scroll-lock
│   │   └── storybook-edit-props.ts             # Storybook-only helpers: getDefaultAttributes()/buildEditProps() build story args from block.json; useInteractiveAttributes() wires setAttributes to useArgs() + logs via storybook/actions; RealBlockEdit renders a block through @wordpress/block-editor's real BlockEdit dispatcher (not the bare Edit function) — required for InspectorControls.Slot to show Fill content and for editor.BlockEdit filters to fire
│   ├── admin-bar.ts                            # entry: imports admin-bar.scss only
│   ├── critical.scss                           # critical (above-the-fold) SCSS bundle entry
│   ├── critical.ts                             # entry: critical bundle — theme class applied early to avoid flash
│   ├── editor.ts                               # entry: block-editor-only bundle
│   ├── index.scss                              # deferred (non-critical) SCSS bundle entry
│   ├── index.ts                                # entry: main frontend bundle
│   └── test-globals.d.ts                       # Jest global type shims
├── styles/                                     # 9 colour-scheme variation JSON files
│   ├── blue.json                               # colour scheme variation
│   ├── cyber-cyan.json                         # colour scheme variation
│   ├── deep-indigo.json                        # colour scheme variation
│   ├── emerald-forest.json                     # colour scheme variation
│   ├── golden-amber.json                       # colour scheme variation
│   ├── green.json                              # colour scheme variation
│   ├── ocean-teal.json                         # colour scheme variation
│   ├── rose-pink.json                          # colour scheme variation
│   └── sunset-orange.json                      # colour scheme variation
├── templates/                                  # 13 FSE block templates (no 404.html — see Known Issues)
│   ├── article.html                            # single blog post
│   ├── articles.html                           # blog archive/hub
│   ├── blank-with-header-footer.html           # canvas with header/footer, empty content area
│   ├── blank.html                              # bare canvas, no header/footer
│   ├── category.html                           # category archive
│   ├── index.html                              # homepage
│   ├── page.html                               # generic page
│   ├── search.html                             # search results
│   ├── single-kt_article_card.html             # shared article-card layout — image/paragraph/button bound to per-card post-meta via core/post-meta bindings; edited once here, propagates to every kotlinskidev/article-card embed (rendered via kotlinskidev_render_article_card_embed(), functions/article-card.php, not the default single-post template flow)
│   ├── single-kt_certificate.html              # layout for the kt_certificate CPT's own direct single-post view (/kt_certificate/{slug}/) — core/post-featured-image + core/post-title plus core/post-meta-bound issuer/issued-date paragraphs and a verify-link button (cert_verify_url); NOT used by kotlinskidev/certificate embeds, which render via plain PHP string builders in functions/certificate.php instead
│   ├── single-kt_project_card.html             # shared project-card layout — core/post-featured-image + core/post-title (context-aware, no meta duplication) plus a core/post-meta-bound arrow-link button (project_url) and tags paragraph (project_tags); edited once here, propagates to every kotlinskidev/project-card embed (rendered via kotlinskidev_render_project_card_embed(), functions/project-card.php)
│   ├── single-service_location.html            # shared city landing page for every language — fully editable in the Site Editor (reorder, Style panel, insert blocks); language-varying text/links use kotlinskidev/translated-text (resolved via pll__()) instead of a per-language duplicate template; city mentions bound to the "city" post-meta so one edit updates every city page
│   └── tag.html                                # tag archive
├── tests/                                      # JS/PHP unit, PHP integration, and Playwright e2e — see docs/testing.md for the full layer breakdown
│   ├── Pest.php                                # PHP unit bootstrap — stubs add_action/add_filter for Brain Monkey + a minimal WP_HTML_Tag_Processor (tests/TestCase.php extends this setup)
│   ├── TestCase.php                            # base class for all PHP unit tests
│   ├── Unit/                                   # 58 PHP unit test files (Pest 5 + Brain Monkey), one per functions/*.php|includes/*.php module + selected src/blocks/**/render.php files
│   ├── e2e/                                    # Playwright, run via `npm run test:e2e` (wp-scripts test-playwright) against the live LocalWP site, never wp-env
│   │   ├── .env                                # WP_TEST_ADMIN_USER/PASSWORD for authenticated specs — gitignored
│   │   ├── .env.example                        # documents the required .env keys, committed
│   │   ├── global-setup.js                     # logs in once via /login/, saves session to artifacts/.auth/admin.json; no-ops with a warning if credentials are absent
│   │   ├── utils.ts                            # shared content-agnostic helpers: acceptCookies, clickAndExpectNavigation, getFirstLiveLink, NOT_CURRENT_PAGE
│   │   ├── wp-cli.ts                           # WP-CLI fixture helpers: createFixturePage/deleteFixturePage/createFixturePost/deleteFixturePostsByType/deletePost/getPostUrl/getRegisteredPatterns
│   │   ├── homepage.spec.ts                    # smoke test — homepage loads
│   │   ├── header.spec.ts                      # 31 tests — parts/header.html (mega-nav, search/language dropdowns, hamburger overlay, sticky header)
│   │   ├── footer.spec.ts                      # 9 tests — parts/footer.html (nav grid, brand block, copyrights, scroll-to-top, mobile bottom nav)
│   │   ├── consent-mode.spec.ts                # 5 tests — functions/tracking-scripts.php's GA4 Consent Mode v2: gtag.js loads with every signal denied by default, accept-all/deny-all/statistics-only/marketing-only each drive the real Complianz banner and assert the resulting gtag consent update — regression guard for a Complianz plugin update silently breaking consent gating
│   │   ├── animated-counter.spec.ts            # frontend — kotlinskidev/animated-counter block extension
│   │   ├── banner-carousel.spec.ts             # frontend — kotlinskidev/banner-carousel block
│   │   ├── canvas-background.spec.ts           # frontend — kt_canvas_scene + canvasSceneId render_block pipeline: data-canvas-recipe attribute, canvas mounts once in view, single static frame under reduced motion vs. a genuinely changing frame under no-preference (screenshot-buffer equality, not pixel-diffing)
│   │   ├── cover-lazy-loading.spec.ts          # frontend — kotlinskidev/cover-lazy-loading block extension
│   │   ├── gallery-lightbox.spec.ts            # frontend — kotlinskidev/gallery-lightbox block
│   │   ├── hover-animation-controls.spec.ts    # frontend — kotlinskidev/hover-animation-controls block extension
│   │   ├── layout-header-offset.spec.ts        # --kt-header-height/--kt-breadcrumbs-height CSS custom properties (global.scss): both always resolve to valid unit-bearing lengths (regression guard for a past bare-zero calc() type mismatch that silently zeroed out <main>'s padding-top sitewide), homepage gets header-height only, a regular page with breadcrumbs gets header+breadcrumbs combined, content never overlaps the fixed breadcrumbs bar
│   │   ├── mobile-footer-nav-gsap-transform.spec.ts  # regression guard — on a page with a GSAP-pinned scroll-section, .mobile-footer-nav (parts/footer.html, position:fixed) stays viewport-relative (no transformed ancestor breaking its containing block), spans the full viewport width (not shrunk by a stray max-width:fit-content), and is the real topmost hit-testable element at its own center point; searches live content for a page with a scroll-section block, per this project's content-agnostic testing convention
│   │   ├── model-viewer.spec.ts                # frontend — kotlinskidev/model-viewer block (real WebGL via headless Chromium: load, click/keyboard toggle, reduced-motion)
│   │   ├── parallax.spec.ts                    # frontend — kotlinskidev/parallax block extension
│   │   ├── protected-content.spec.ts           # frontend — kotlinskidev/protected-content block
│   │   ├── responsive-display.spec.ts          # frontend — kotlinskidev/responsive-display block extension
│   │   ├── responsive-order.spec.ts            # frontend — kotlinskidev/responsive-order block extension
│   │   ├── scroll-animations.spec.ts           # frontend — kotlinskidev/scroll-animations block extension
│   │   ├── slider.spec.ts                      # frontend — wpe/slider block: continuousAutoplay (start-on-visible, freeze/resume on hover-focus-click, no snap), regular autoplay, pagination, progress circle
│   │   ├── service-location.spec.ts            # frontend — city post-meta binding resolves to real text (not the raw placeholder), gradient-text applied to exactly the 3 contrast-safe city mentions, per-city map iframe, PL/EN Polylang pair (skips if none currently published); FAQ sticky-left column stays visible once scrolled deep into its row after opening every accordion (native position:sticky regression guard)
│   │   └── editor/                             # authenticated specs — opt in per-file via test.use({ storageState })
│   │       ├── site-editor.spec.ts             # confirms the Site Editor loads under the test account instead of redirecting to login
│   │       ├── patterns-validity.spec.ts       # one test per registered theme pattern — asserts none trigger Gutenberg's "Block contains unexpected or invalid content." warning
│   │       ├── service-location.spec.ts        # single-service_location template canvas exposes multiple distinct role="document" blocks (not one opaque preview — see .claude/rules/testing.md for why block wrappers aren't role="heading"/"group"); City Details panel loads with a non-empty value on a real post
│   │       └── {block}.spec.ts                 # editor-side counterpart to each frontend block spec above (animated-counter, banner-carousel, canvas-background, cover-lazy-loading, gallery-lightbox, hover-animation-controls, parallax, protected-content, responsive-display, responsive-order, scroll-animations)
│   └── integration/                            # PHP integration (Pest + wp-phpunit + WP_UnitTestCase) — own isolated toolchain (Pest 1.23/PHPUnit 9.6), separate composer.json/vendor from the root
│       ├── Pest.php                            # integration-suite bootstrap
│       ├── TestCase.php                        # extends WP_UnitTestCase
│       ├── bootstrap.php                       # boots wp-phpunit against a dedicated kotlinskidev_test MySQL database
│       └── tests/                              # 75 test files, one per functions/*.php|includes/*.php module needing real WP_Query/DOM/admin-page coverage
├── .env
├── .env.example
├── .envrc
├── .mcp.json
├── .nvmrc
├── .prettierignore
├── .prettierrc.json
├── .storybook/                                 # Storybook config (react-webpack5) — documents src/blocks/*/*.stories.tsx in isolation; run npm run storybook / build-storybook; mock-server-side-render.tsx aliases @wordpress/server-side-render to per-block static mock HTML (BLOCK_MOCKS map) since Storybook has no WP REST backend to call, sourcing photos from mock-assets.ts (real theme assets/images/*.webp — logo.webp blurs badly once scaled into a full-size card, so use the larger photos instead); exports BreadcrumbsRouteContext so a block whose real markup varies by page (not by any block attribute — breadcrumbs' trail depends on is_category()/is_single()/is_page(), never on an attribute) can pick a mock variant per-story instead of per-control; mock-media-upload.tsx registers a fake editor.MediaUpload filter + dispatches core/block-editor's mediaUpload setting, since @wordpress/block-editor's real MediaUpload is a `() => null` placeholder outside a full WP admin bootstrap and MediaUploadCheck hides its children without that setting; preview.tsx imports the real src/critical.scss + src/index.scss (all frontend SCSS, not just editor overrides) plus @wordpress/block-library's compiled CSS for core-block base styles, toggles html.light-mode/dark-mode (not body — theme-colors.scss's color-scheme rules target html) via a Theme toolbar, and defines custom mobile/breakpoint-edge/desktop viewport presets; frame.scss makes the Story+Inspector layout stack under the theme's own 782px breakpoint instead of staying side-by-side
├── 404.php                                     # classic 404 handler (no FSE templates/404.html exists yet); closes </body></html> after wp_footer() — header.php now opens <body>, this and page-search.php now close it
├── 500.html                                    # static PWA offline/error fallback
├── CHANGELOG.md                                # Keep a Changelog + semver history
├── CLAUDE.md                                   # Claude Code project instructions
├── composer.json                               # PHP runtime + dev dependencies (sentry/sentry is the only runtime one; rest is require-dev tooling)
├── composer.lock
├── README.md                                   # project overview + npm commands
├── content.php                                 # legacy classic-theme partial
├── footer.php                                  # legacy classic-theme footer (superseded by parts/footer.html)
├── functions.php                               # thin require_once loader for functions/
├── header.php                                  # doctype/head/wp_head() + <body <?php body_class(); ?>>/wp_body_open() — required by 404.php and page-search.php, the theme's two live classic template overrides
├── index.php                                   # classic-theme fallback (WP resolves templates/*.html first)
├── offline.html                                # PWA offline fallback page
├── package-lock.json                           # npm lockfile
├── package.json                                # npm scripts + dependencies, theme version
├── page-search.php                             # custom page template backing the Search/Szukaj pages; now also calls wp_footer() and closes </body></html> (previously called neither)
├── page.php                                    # legacy classic-theme page template
├── screenshot.png                              # theme directory screenshot
├── single.php                                  # legacy classic-theme single-post template
├── style.css                                   # WP theme header (Name/Version/Description) + minimal CSS
├── tailwind.config.js                          # Tailwind JIT config (see Known Issues — build step unclear)
├── tailwind.css                                # Tailwind entry (base import commented out)
├── theme.json                                  # global styles/settings: palette, spacing, typography
├── tsconfig.json                               # strict TS config, @utils/* alias
└── webpack.config.js                           # extends @wordpress/scripts defaults, per-block entries
```

## Known Issues / Cleanup Candidates

Found while compiling this reference — not fixed, just flagged:

1. **`404.php` references pattern slug `kotlinskidev/footer-dynamic`, which doesn't exist anywhere in the theme.** The 404 page's footer silently renders nothing for that call.
2. **`patterns/header-default.php` appears orphaned** — contains unresolved placeholder shortcodes (`[theme_shortcode_here]`, `[language_shortcode_here]`), not referenced anywhere except itself. `parts/header.html` is hand-built with blocks directly, not via this pattern.
3. **Three blocks don't use the `kotlinskidev/` namespace**: `googlemaps/google-maps-block`, `contact-form-ts/form`, `wpe/slider` — intentional/working, but inconsistent with the rest of the theme's naming.
4. **README claims `npm run build` runs a two-step "Webpack + Tailwind minification" build**; the actual `build` script is plain `wp-scripts build` with no visible Tailwind step. Either stale README or a step that moved elsewhere.
5. **`src/styles/shortcodes.scss` is an empty placeholder file.**
6. **`functions/search-page-styles.php` has a stray leftover code fragment** (`function to`) worth a cleanup pass.
7. **`index.php`, `page.php`, `single.php`, `content.php` are dead** — superseded by `templates/*.html`, and each references template parts (`get_template_part('nav')`, `content-page.php`) that don't exist in this theme, confirming they're unreachable leftovers rather than live fallbacks. **`header.php`/`footer.php` are not dead**: `header.php` (doctype/`<head>`/`wp_head()`/`<body>` open) is required by both `404.php` and `page-search.php`, the theme's two genuinely-live classic template overrides (`page-search.php` is assigned to the published "Search"/"Szukaj" pages) — confirmed via `wp post list --meta_key=_wp_page_template`. `footer.php` itself is still unused (both call sites build their own footer output inline instead of `get_footer()`).
