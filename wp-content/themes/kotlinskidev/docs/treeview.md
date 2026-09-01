# kotlinskidev Theme — Directory Tree

Full current-state file/folder tree of the theme, annotated inline. Every `docs/*.md` file describes the current, implemented state — no plans, phases, or proposals. See `docs/footer-architecture.md`, `docs/header-architecture.md`, and `docs/navigation-structure.md` for the header/footer/mega-menu block architecture in more depth.

Keep this in sync with `CHANGELOG.md`: when a change adds/removes/renames a block, pattern, template, or function module, update the relevant line here too. `node_modules/` and `build/` (both gitignored, generated) are omitted.

```text
kotlinskidev/
├── assets/                                     # static: css/ fonts/ icons/ images/ videos/
├── docs/                                       # architecture reference, workflow, and tooling docs (current state only)
│   ├── 522.md                                  # Cloudflare 522 incident runbook + root-cause notes
│   ├── accessibility.md                        # accessibility review checklist (WCAG 2.2 POUR, ARIA, EAA/ADA/Section 508 cross-ref)
│   ├── breakpoints.md                          # DB-driven breakpoint system
│   ├── env.md                                  # environment/.env variable documentation
│   ├── footer-architecture.md                  # footer template/block architecture
│   ├── git-instructions.md                     # branch/PR naming conventions
│   ├── header-architecture.md                  # header template/block architecture
│   ├── legal-compliance.md                     # legal/privacy review checklist (GDPR, cookie consent, Impressum, EAA accessibility statement)
│   ├── mcp-server-usage.md                     # MCP server usage notes
│   ├── mcp-wordpress-setup.md                  # MCP WordPress integration setup notes
│   ├── monitoring.md                           # EC2 CloudWatch alarms/agent setup + PHP-FPM memory cleanup
│   ├── navigation-structure.md                 # desktop mega-menu + hamburger architecture
│   ├── performance.md                          # performance review checklist (JS runtime, rendering, network, WP backend)
│   ├── security-headers.md                     # HTTP security header reference — GDPR/EU regulatory context, OWASP-sourced recommended values, CSP rollout plan, PHP-vs-Cloudflare split
│   ├── security.md                             # security review checklist (OWASP Top 10, WP hardening, MCP attack surface, ISO 27001 cross-ref)
│   ├── seo.md                                  # technical SEO review checklist (crawlability, schema, hreflang, Core Web Vitals overlap)
│   ├── testing.md                              # JS/PHP unit, PHP integration, and e2e test setup + coverage baseline
│   ├── theme-colors.md                         # adaptive color token system
│   └── treeview.md                             # this file — full annotated structure tree
├── functions/                                  # 69 PHP modules, require_once'd from functions.php (cache.php must load first)
│   ├── active-link-state.php                   # marks links pointing at the current page with kt-link-current/aria-current and disables their click, gated by Advanced settings + per-block opt-out
│   ├── actions.php                             # misc template_redirect / wp_head / wp_footer actions
│   ├── admin-bar-styles.php                    # enqueues admin-bar style overrides, only when the bar is visible
│   ├── article-card.php                        # kt_article_card CPT (title + linked_article_id/card_description meta, synced from the linked article via rest_insert_kt_article_card) + kotlinskidev_render_article_card_embed(), which renders templates/single-kt_article_card.html with explicit WP_Block context so its core/post-meta bindings resolve; PluginDocumentSettingPanel script (src/blocks/article-card/panel.tsx) enqueued only on the CPT's own edit screen
│   ├── article-query-manager.php               # meta boxes for per-article query control
│   ├── banner-slider.php                       # enqueues/inits banner-carousel block assets
│   ├── blocks.php                              # registers block categories + every block.json (source of truth for blocks)
│   ├── blog-topic-manager.php                  # category "description" field admin UI + blog topic taxonomy
│   ├── border-gradient.php                     # applies --kt-border-gradient/--kt-border-width to any border-supporting block that picked a gradient (excludes kotlinskidev/button)
│   ├── breadcrumbs.php                         # breadcrumb trail builder + renderer for the kotlinskidev/breadcrumbs block, also syncs Yoast's wpseo_breadcrumb_links schema to the same trail
│   ├── breakpoints.php                         # central breakpoint values, exposed to editor + front end
│   ├── cache.php                               # build-fingerprint/transient cache manager — must load first
│   ├── contact-card.php                        # kotlinskidev_get_contact_info() reads the 4 global "Contact Info" settings (address/phone/email/hours); registers the kotlinskidev/contact-card dynamic block, wrapping address/phone/email in the same protected-content encrypted-span markup the Protected Content block uses (auto-revealed by src/scripts/protected-content.ts); also emits a ProfessionalService JSON-LD schema on singular service_location pages via wp_head, with the post's "city" meta as areaServed
│   ├── contact-form.php                        # handles contact-form block submission end-to-end
│   ├── copyrights.php                          # [copyrights] shortcode
│   ├── cover-image-classes.php                 # lazy-loading behavior control for cover blocks
│   ├── cover-video-preload.php                 # injects <link rel=preload> for cover-block video posters
│   ├── customizer.php                          # Customizer panel registration
│   ├── deferred-block-assets.php               # filterable block-name→handle registry + per-page above-the-fold scan/cache for CSS defer decisions
│   ├── disable-comments.php                    # site-wide comment disabling
│   ├── enqueue-scripts.php                     # main script/style enqueue pipeline
│   ├── faq-layout.php                          # applies kt-faq-independent-columns-N class to core/group per its faqLayout Advanced-panel choice
│   ├── filters.php                             # misc content/attachment filters
│   ├── group-link.php                          # applies kt-group-link class + data-kt-group-link-url/target + role="link"/tabindex to a core/group with groupLinkUrl set
│   ├── icon-extension.php                      # leading-icon render_block splice for kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   ├── icon-library.php                        # adds an "Icons (SVG)" entry to the Media Library's post_mime_types type filter
│   ├── image-hover-overlay.php                 # inserts a heading/description overlay div into core/image when kotlinskidevOverlayEnabled is set
│   ├── language-switcher.php                   # [language_switcher] shortcode
│   ├── link-hover-effects.php                  # applies configurable link hover-effect classes to blocks
│   ├── load-more.php                           # render_block filter: adds kt-has-load-more class + data-kt-load-more-initial/-label attributes to a core/group with loadMore.enabled set, read by src/scripts/load-more.ts to progressively reveal children
│   ├── login.php                               # custom wp-login.php styling
│   ├── main-content-focus.php                  # injects tabindex="-1" onto the <main class="main-wrapper"> core/group at render time (skip-link focus target, kept out of stored markup so block validation doesn't flag an attribute the block itself can't declare)
│   ├── maintenance.php                         # maintenance-mode toggle + admin settings page
│   ├── modals.php                              # kt_modal CPT + size meta, resolves/dedupes/renders modal shells for any link with opensInModal+modalId, wp_footer
│   ├── model-viewer-mime.php                   # allows .glb uploads (model/gltf-binary), overrides finfo's mismatch verdict via wp_check_filetype_and_ext
│   ├── page-loader.php                         # renders page-loader markup on wp_body_open
│   ├── page-view-tracking.php                  # AJAX view tracking + Popular Pages query source
│   ├── patterns.php                            # registers 4 custom pattern categories
│   ├── polylang-accessibility.php              # a11y fixes for Polylang language-switcher markup
│   ├── polylang-content-resolution.php         # wp_navigation/wp_block/kt_modal Polylang-translatable, resolve by slug
│   ├── project-card.php                        # kt_project_card CPT (title + native featured image + project_description/project_tags/project_url meta) + kotlinskidev_render_project_card_embed(), which renders templates/single-kt_project_card.html with explicit WP_Block context AND setup_postdata() (core/post-title's render callback reads the global $post, not block context) so core/post-title, core/post-featured-image, and its core/post-meta bindings all resolve; injects the kt-image-hover-overlay markup (image-hover-overlay.php) around the featured image server-side using project_description; PluginDocumentSettingPanel script (src/blocks/project-card/panel.tsx) enqueued only on the CPT's own edit screen
│   ├── protection-helpers.php                  # RSA keypair + encrypt/decrypt for protected-content block
│   ├── responsive-display.php                  # per-breakpoint show/hide block attribute
│   ├── responsive-font-size.php                # per-breakpoint font-size attribute
│   ├── responsive-order.php                    # per-breakpoint block reorder attribute
│   ├── responsive-spacing.php                  # per-breakpoint spacing attribute
│   ├── responsive-width.php                    # per-breakpoint width attribute
│   ├── scroll-top-top.php                      # scroll-to-top markup (fixed-arrow/bar variants) + [scroll_to_top] shortcode
│   ├── search-page-styles.php                  # conditional style fixes on search results pages
│   ├── service-locations.php                   # service_location CPT (editor+custom-fields support, no archive — the "choose your city" hub is two real Pages, see below) + single "city" post-meta field, sanitized on write and exposed to REST/block editor via custom-fields support. City page body is two real, fully block-editable FSE templates — templates/single-service_location.html (PL, default) and templates/single-service_location-en.html (EN) — routed by language via a `single_template_hierarchy` filter checking pll_current_language(), replacing an earlier single opaque PHP-rendered dynamic block that traded editability for dodging a WP core bug (a plain wp:pattern reference caches its content once, at whatever locale was active when WP_Theme::get_pattern_cache() last populated, freezing translated text in one language for every visitor). Three of the five city-bound headings/paragraphs in both templates carry a kt-gradient-text className, since Block Bindings disables inline RichText controls (bold/italic/gradient) for a bound element — gives them the same sitewide gradient without needing the toolbar. Enqueues src/blocks/service-location/panel.tsx (PluginDocumentSettingPanel for the "city" field) on the CPT's own edit screen. Also registers 2 PHP-only dynamic blocks (render_callback, no block.json/build step): kotlinskidev/city-grid (columnsDesktop/columnsTablet/columnsMobile + linkTextColor attributes, controls in src/blocks/city-grid/index.tsx) and kotlinskidev/city-map (embed iframe + an expand button wired to src/scripts/city-map-lightbox.ts's fullsize overlay), both rendered fresh every request, plus a third — kotlinskidev/contact-card (functions/contact-card.php) — also listed in the same SSR-preview registration below. Both "Find us in {city}" section templates now use a two-column layout: an eyebrow + city heading + SEO paragraph + kotlinskidev/contact-card on the left, kotlinskidev/city-map on the right — see functions/contact-card.php. A small inline-JS `registerBlockType()` (enqueued on `enqueue_block_editor_assets`, no build step) using `ServerSideRender` so the block editor shows their real rendered output — and a `pre_determine_locale` filter + a `kotlinskidevLang` REST field (registered for `page`/`service_location`) so that preview also renders in the *edited post's* Polylang language. Also a lang→slug map + rewrite rule + post_type_link filter so each city's own URL translates automatically (adding a language is one array entry)
│   ├── security-headers.php                    # Referrer-Policy/Permissions-Policy/CSP-Report-Only via the wp_headers filter, skips wp-admin/REST — see docs/security-headers.md
│   ├── seo-customizer.php                      # SEO Customizer fields — currently commented out, not loaded
│   ├── seo-noindex-compat.php                  # detects active SEO plugin (Yoast/Rank Math/AIOSEO/SEOPress), returns query-args noindex exclusion
│   ├── settings-page.php                       # main theme settings admin page
│   ├── site-identity.php                       # minimal site logo/title setup
│   ├── slider-modal-trigger.php                # opens a kt_modal when a wpe/slider slide (core/cover, .swiper-slide, modalId set) is clicked
│   ├── social-link-tooltip.php                 # adds .kt-tooltip + data-tooltip to core/social-link anchors, sourced from the screen-reader-only label
│   ├── svg-gradient-defs.php                   # injects inline SVG gradient <defs> into wp_body_open
│   ├── svg-support.php                         # allows SVG uploads + inline SVG rendering
│   ├── text-gradient.php                       # applies .kt-gradient-text + a --kt-text-gradient css var to any block that picked a gradient via the kotlinskidev/text-gradient editor extension (src/blocks/text-gradient/)
│   ├── text-line-clamp.php                     # appends a Read more/Read less toggle + --kt-line-clamp-lines var to core/paragraph when kotlinskidevLineClampEnabled is set
│   ├── text-shadow-support.php                 # text-shadow style attribute for shadow-supporting blocks
│   ├── theme-setup.php                         # theme supports registration, deregisters jQuery
│   ├── theme-switcher.php                      # dark/light shortcode + JS config output
│   ├── tracking-scripts.php                    # Facebook Pixel + Google Analytics snippets
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
│   ├── footer.html                             # logo/brand content-block, nav simple-grid, copyrights, scroll-to-top
│   └── header.html                             # site logo, kotlinskidev/navigation, theme-switcher, kotlinskidev/breadcrumbs
├── patterns/                                   # 54 reusable block patterns
│   ├── about-2.php                             # About Section 2
│   ├── about-us.php                            # About Us Section
│   ├── article-hero.php                        # Article Hero Section
│   ├── article-tags.php                        # Article Tags
│   ├── blog-cards.php                          # Blog Cards Grid
│   ├── blog-topics-grid.php                    # Blog Topics Grid
│   ├── category-header.php                     # Category Header
│   ├── category-posts-grid.php                 # Category Posts Grid
│   ├── contact-page.php                        # Contact Us
│   ├── contact-with-form.php                   # Contact with Form
│   ├── content-tabs-media.php                  # Content Tabs with Media (kotlinskidev/content-tabs example, image + heading + copy per tab)
│   ├── content-tabs-services.php               # Services with Content Tabs (kotlinskidev/content-tabs example)
│   ├── counter-block.php                       # Counter Blocks
│   ├── counter-with-desc.php                   # Counter Block with Description
│   ├── cta-block-2.php                         # Call to Action 2
│   ├── cta-block.php                           # Call to Action
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
│   ├── latest-work.php                         # Latest Works Section
│   ├── logo-showcase.php                       # Logos Showcase
│   ├── mission-goal.php                        # Mission & Goal Content
│   ├── mission-vision.php                      # Mission & Vision Section
│   ├── number-stats.php                        # Counter Stats with Sticky Section
│   ├── other-topics.php                        # Other Topics Grid
│   ├── photo-gallery.php                       # Photo Gallery
│   ├── popular-content.php                     # Popular Content
│   ├── pricing-tables.php                      # Pricing Tables
│   ├── profile-links-card.php                  # Profile Links Card
│   ├── related-articles.php                    # Related Articles Section
│   ├── related-tags.php                        # Related Tags
│   ├── search-form.php                         # Enhanced Search Form
│   ├── search-header.php                       # Search Header
│   ├── search-results.php                      # Enhanced Search Results
│   ├── service-content.php                     # Service Section with big Image (slug: services-content)
│   ├── service-grid.php                        # Service Grid (slug: services-grid)
│   ├── service-locations-grid.php              # Service Locations Grid — thin wrapper around the kotlinskidev/city-grid dynamic block (functions/service-locations.php); previously baked a WP_Query directly into the pattern, which only ran once at pattern-cache time and went stale
│   ├── services-section.php                    # Service Section
│   ├── simple-banner.php                       # Simple Banner
│   ├── simple-text.php                         # Simple Text Section
│   ├── tag-header.php                          # Tag Header
│   ├── tag-posts-grid.php                      # Tag Posts Grid
│   ├── template-404.php                        # 404 Template
│   ├── testimonial-section.php                 # Testimonial Section
│   ├── testimonials-grid.php                   # Testimonials Grid (slug: testimonial-grid)
│   └── vertical-timeline-layout.php            # Vertical Timeline Layout
├── polylang/                                   # language flag icons
│   ├── en_US.png
│   └── pl_PL.png
├── src/                                        # TypeScript/SCSS source, compiled by webpack into build/ (gitignored)
│   ├── blocks/                                 # 58 custom block dirs: 35 registered blocks + 22 JS-only block-extension filters + 1 post-editor settings panel
│   │   ├── above-fold/                         # extension: Advanced-tab "Load above the fold" toggle, shown only on blocks registered in functions/deferred-block-assets.php
│   │   │   └── index.tsx
│   │   ├── active-link-state/                  # extension: Advanced-tab opt-out for the sitewide active-page link highlight
│   │   │   └── index.tsx
│   │   ├── animated-counter/                   # extension: count-up-on-scroll for heading/paragraph/group/columns
│   │   │   └── index.tsx
│   │   ├── article-card/                       # dynamic block (render.php, ServerSideRender preview) — cardId attribute only, embeds a kt_article_card post (functions/article-card.php) by ID; card layout/style is edited once in the Site Editor's single-kt_article_card template and propagates to every embed
│   │   │   ├── block.json
│   │   │   ├── edit.tsx                        # Inspector card picker (post combobox over kt_article_card) + ServerSideRender preview
│   │   │   ├── index.tsx
│   │   │   ├── panel.tsx                       # PluginDocumentSettingPanel on the kt_article_card edit screen — links the card to an article, sets the optional description override
│   │   │   └── render.php
│   │   ├── background-effects-controls/        # extension: curated animated CSS background/border effect classes (kt-bg-fx-*), applied via className like hover-animation-controls
│   │   │   └── index.tsx
│   │   ├── banner-carousel/                    # full-width Swiper banner slider
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── border-gradient/                    # extension: gradient option merged into the native Border panel for any block with border support (excludes kotlinskidev/button)
│   │   │   └── index.tsx
│   │   ├── breadcrumbs/                        # fixed overlay breadcrumb trail below the header, hidden on homepage by default, slides in/out in sync with the header's own scroll state
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── button/                             # standalone CTA button, independent normal/hover color+gradient
│   │   │   ├── ButtonColorControls.tsx
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── button-styles/                      # extension: registers a "Gradient Outline" style for core/button
│   │   │   └── index.ts
│   │   ├── city-grid/                          # extension: per-breakpoint column count + link text color controls for the PHP-only kotlinskidev/city-grid dynamic block (functions/service-locations.php)
│   │   │   └── index.tsx
│   │   ├── contact-card/                       # extension: "Gap between fields" range control for the PHP-only kotlinskidev/contact-card dynamic block (functions/contact-card.php), applied as a --kt-contact-card-gap CSS custom property
│   │   │   └── index.tsx
│   │   ├── contact-form/                       # contact-form-ts/form — contact form + CAPTCHA, posts to admin-post.php
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── content-block/                      # resolves a wp_block reusable post by slug (Polylang-aware)
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── content-tabs/                       # nav-link strip + dynamic content-panel switcher
│   │   │   ├── block.json
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
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── cover-lazy-loading/                 # extension: force-disable native lazy loading on cover/image
│   │   │   └── index.tsx
│   │   ├── equal-height-columns/               # extension: "Equal height" toggle — core/columns stretches each column's direct child to fill the tallest column; a core/group with a grid layout stretches each grid item to fill its row (class baked into saved static HTML via blocks.getSaveContent.extraProps)
│   │   │   ├── index.test.tsx
│   │   │   └── index.tsx
│   │   ├── faq-layout/                         # extension: Advanced-tab "FAQ columns behavior" (default grid / independent columns + count) for core/group wrapping core/details
│   │   │   └── index.tsx
│   │   ├── gallery-lightbox/                   # image/video gallery with lightbox + mobile media variant
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.tsx
│   │   │   ├── init.ts
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── google-maps/                        # googlemaps/google-maps-block — Google Maps embed
│   │   │   ├── block.json
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
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── holder/                             # single grid cell, parent-locked to simple-grid
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── render.php
│   │   │   └── save.tsx
│   │   ├── hover-animation-controls/           # extension: ~13 canned hover animation classes, combinable transform effects (hoverAnimationExtra), start/end opacity fade
│   │   │   └── index.tsx
│   │   ├── icon/                               # standalone SVG icon block — Media Library picker, size/color/aria-label, renders via kotlinskidev_inline_nav_icon()
│   │   ├── icon-extension/                     # extension: leading icon for kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   │   │   └── index.tsx
│   │   ├── image-hover-overlay/                # extension: adds a heading/description hover-reveal overlay + color pickers to core/image
│   │   │   └── index.tsx
│   │   ├── language-panel/                     # Polylang language switcher trigger + dropdown
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── link-hover-effects/                 # extension: opt out of global link hover styling per block
│   │   │   └── index.tsx
│   │   ├── load-more/                          # extension: "Load More" toggle for core/group — items-to-show count + button label, revealed items via src/scripts/load-more.ts reading functions/load-more.php's data attributes
│   │   │   ├── index.test.tsx
│   │   │   └── index.tsx
│   │   ├── modal-settings-panel/                # PluginDocumentSettingPanel for the kt_modal post type — size (small/medium/large/full), enqueued only on kt_modal edit screens
│   │   │   └── index.tsx
│   │   ├── modal-trigger/                      # extension: adds opensInModal + modalId to kotlinskidev/button, kotlinskidev/nav-link, core/button, core/navigation-link, core/navigation-submenu
│   │   │   └── index.tsx
│   │   ├── model-viewer/                       # interactive .glb model, click-to-toggle via THREE.AnimationMixer + optional drag-to-rotate (OrbitControls) + auto-detected screen-text texture swap, IO-gated + WebGL-feature-detected dynamic import() of a three.js runtime chunk kept out of every other bundle
│   │   ├── nav-banner/                         # nav-scoped: image+heading+description+CTA for mega-menu panels
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-content/                        # shared editor bundle for nav-banner/image/link/paragraph
│   │   │   └── index.tsx
│   │   ├── nav-image/                          # nav-scoped: plain (optionally linked) image
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-language-panel/                 # nav-scoped sibling of language-panel
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-link/                           # nav-scoped styled link/menu-item, independent color/gradient
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-paragraph/                      # nav-scoped free-text paragraph, gradient/color-clip text
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-popular-pages/                  # nav-scoped sibling of popular-pages
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── nav-search-panel/                   # nav-scoped sibling of search-panel
│   │   │   ├── block.json
│   │   │   └── render.php
│   │   ├── navigation/                         # full replacement for core/navigation — mega-menu + mobile overlay
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── nav-icon-filter.tsx
│   │   │   └── render.php
│   │   ├── parallax/                           # extension: parallax background-scroll toggle for core/cover
│   │   │   └── index.tsx
│   │   ├── popular-pages/                      # most-viewed pages list, Yoast-noindex-filtered
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── project-card/                       # dynamic block (render.php, ServerSideRender preview) — cardId attribute only, embeds a kt_project_card post (functions/project-card.php) by ID; card layout/style is edited once in the Site Editor's single-kt_project_card template and propagates to every embed
│   │   │   ├── block.json
│   │   │   ├── edit.tsx                        # Inspector card picker (post combobox over kt_project_card) + ServerSideRender preview
│   │   │   ├── index.tsx
│   │   │   ├── panel.tsx                       # PluginDocumentSettingPanel on the kt_project_card edit screen — description (hover overlay text), tags, project URL
│   │   │   └── render.php
│   │   ├── protected-content/                  # RSA-encrypted, bot-obfuscated content (email/phone/address/other)
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── responsive-display/                 # extension: per-breakpoint show/hide
│   │   │   └── index.tsx
│   │   ├── responsive-font-size/               # extension: per-breakpoint font-size override
│   │   │   └── index.tsx
│   │   ├── responsive-image/                   # static image block, swaps desktop/mobile image at a breakpoint
│   │   │   ├── block.json
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
│   │   ├── scroll-section/                     # sticky horizontal-scroll section (GSAP ScrollTrigger)
│   │   │   ├── docs/
│   │   │   │   └── SKILL.md
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   ├── edit.tsx
│   │   │   │   ├── render.php
│   │   │   │   └── save.tsx
│   │   │   ├── CLAUDE.md
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── init.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── scroll-to-top/                      # "back to top" — fixed-arrow or full-width-bar variant
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss                      # bar-variant layout only (fixed-arrow styling stays in styles/scroll.scss)
│   │   ├── search-panel/                       # search trigger button opening a modal/dropdown panel
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── service-location/                   # not a block — build entry only, enqueued via enqueue_block_editor_assets (functions/service-locations.php)
│   │   │   └── panel.tsx                       # PluginDocumentSettingPanel on the service_location edit screen — sets the "city" post-meta field that every bound heading/paragraph on the page reads
│   │   ├── shared/                             # shared editor UI: ColorGradientControl, PanelColorGradientSettings (native Text/Background-style collapsed row+popover), NavIconPicker
│   │   │   ├── color-gradient-control.ts
│   │   │   └── nav-icon-picker.tsx
│   │   ├── simple-grid/                        # CSS-grid container, column count derives from Holder children
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── slider/                             # wpe/slider — generic Swiper carousel, InnerBlocks (core/cover) slides; centerSlides+peek for a centered-peek layout
│   │   │   ├── assets/
│   │   │   ├── block.json
│   │   │   ├── constants.ts
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
│   │   │   └── render.php
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
│   │   └── theme-switcher/                     # dark/light mode toggle button
│   │       ├── block.json
│   │       ├── index.tsx
│   │       └── render.php
│   ├── formats/                                # custom RichText format types
│   │   └── gradient-highlight/
│   │       ├── editor.scss                     # editor-only styling for the format's popover UI
│   │       ├── index.tsx                       # registers the gradient-highlight RichText format
│   │       └── style.scss                      # frontend + editor shared styling for the rendered span
│   ├── scripts/                                # frontend TS modules, bundled via src/index.ts / src/critical.ts
│   │   ├── accessibility.ts                    # DOM/motion/video a11y helpers, reduced-motion checks
│   │   ├── animated-counter.ts                 # counts up numeric values on scroll into view
│   │   ├── common.ts                           # shared small helpers
│   │   ├── cookie-consent.ts                   # replaces Complianz consent button with custom cookie icon
│   │   ├── editor-theme-toggle.ts              # dark/light toggle button inside the block editor canvas
│   │   ├── faq-accordion.ts                    # WAAPI height-animated open/close for FAQ details accordion
│   │   ├── group-link.ts                       # click/keyboard delegation for .kt-group-link, skips nested interactive elements
│   │   ├── gsap-sticky.ts                      # GSAP-based sticky element behavior
│   │   ├── hamburger.ts                        # mobile nav overlay open/close, submenu collapse, scroll-lock
│   │   ├── hide-nav-on-scroll.ts               # hides/shows nav bar based on scroll direction
│   │   ├── image-lightbox.ts                   # lightbox open/close/context capture for gallery images
│   │   ├── language-panel.ts                   # wraps initDropdownPanels for .kt-lang-panel
│   │   ├── language.ts                         # small language-related DOM script
│   │   ├── line-clamp.ts                       # ResizeObserver-driven overflow check + click toggle for .kt-line-clamp-toggle (Read more/Read less)
│   │   ├── load-more.ts                        # scans [data-kt-load-more-initial], hides children past the limit, inserts a reveal-on-click button — reusable across any core/group flagged by functions/load-more.php
│   │   ├── mega-menu.ts                        # desktop mega-menu open/close/backdrop + delay timers
│   │   ├── modal-manager.ts                    # delegated click handler for [data-kt-modal-target]/a[href^="#kt-modal-"], focus trap + inert background, reuses scroll-lock + panel-coordinator
│   │   ├── page-views.ts                       # posts page-view AJAX beacon on scroll/visibility-change
│   │   ├── protected-content.ts                # frontend reveal/decrypt handler for protected-content block
│   │   ├── restoration.ts                      # restores scroll position / bfcache navigation handling
│   │   ├── scroll-animations.ts                # IntersectionObserver entrance-animation trigger
│   │   ├── scroll-to-top.ts                    # fixed-arrow visibility/progress ring + bar-variant click wiring
│   │   ├── search-panel.ts                     # wraps initDropdownPanels for .kt-search-panel, autofocuses input
│   │   ├── smooth-scroll-offset.ts             # smooth-scrolls anchor links with header-height offset
│   │   ├── sticky-header.ts                    # enables/disables sticky header based on scroll threshold
│   │   ├── theme-switcher.ts                   # dark/light theme apply + OS prefers-color-scheme listener
│   │   └── utils.ts                            # shared debounce/getBreakpoints/getScrollTop/isMobile helpers
│   ├── styles/                                 # SCSS source partials
│   │   ├── above-the-fold.scss                 # critical layout-shift prevention rules
│   │   ├── accessibility.scss                  # skip-link, prefers-reduced-motion handling
│   │   ├── admin-bar.scss                      # admin-bar-specific overrides (editor-only bundle)
│   │   ├── animations.scss                     # hover animation class definitions; transform effects (jump/scale/rotate/bounce) compose via --kt-hover-fx-* custom properties so multiple can combine on one element
│   │   ├── article-card.scss                   # .kt-article-card outer card shell (shadow, top corner radius); most per-part styling now lives as block-supports attributes on templates/single-kt_article_card.html instead
│   │   ├── background-effects.scss             # curated animated CSS background/border/text effect classes (kt-bg-fx-*), paired with background-effects-controls
│   │   ├── blog.scss                           # breadcrumbs + taxonomy/tag styling
│   │   ├── border-gradient.scss                # .kt-has-gradient-border utility class (universal border-gradient extension)
│   │   ├── button.scss                         # .kt-button component styles
│   │   ├── city-grid.scss                      # .kt-city-grid responsive column-count + link text color custom properties, paired with the city-grid extension
│   │   ├── city-map.scss                       # .kt-city-map embed wrapper + expand button, and the .kt-city-map-lightbox fullsize overlay (paired with src/scripts/city-map-lightbox.ts), for the kotlinskidev/city-map dynamic block
│   │   ├── complianz.scss                      # Complianz cookie-consent plugin dark/light overrides
│   │   ├── components.scss                     # editor placeholder components
│   │   ├── contact-card.scss                   # .kt-contact-card two-column address/hours/phone/email grid for the kotlinskidev/contact-card dynamic block
│   │   ├── editor-overrides.scss               # block-editor canvas style overrides (editor-only bundle)
│   │   ├── equal-height-columns.scss           # .kt-equal-height-columns: flex-column columns + flex:1 direct children for core/columns, and height:100% grid items for a core/group grid, paired with the equal-height-columns extension
│   │   ├── faq-accordion.scss                  # FAQ details 2-col grid, +/− icon, animating-state overflow
│   │   ├── footer.scss                         # footer layout (top/brand/nav sections)
│   │   ├── global.scss                         # broad utility classes, social-link overrides
│   │   ├── gradients.scss                      # gradient background utility class
│   │   ├── group-link.scss                     # cursor + focus-visible styling for .kt-group-link, paired with the group-link extension
│   │   ├── image-hover-overlay.scss            # hover/focus-within reveal + editor preview for .kt-image-hover-overlay, paired with the image-hover-overlay extension
│   │   ├── kotlinskiwind.scss                  # hand-rolled Tailwind-like utility classes
│   │   ├── language-panel.scss                 # language switcher panel styling
│   │   ├── language.scss                       # language button styling
│   │   ├── lazy.scss                           # contact-form success/error state + lazy-load styles
│   │   ├── line-clamp.scss                     # .kt-line-clamp truncation + .kt-line-clamp-toggle gradient-text button, paired with the text-line-clamp extension
│   │   ├── link-hover-effects.scss             # link hover-effect utility classes
│   │   ├── link.scss                           # link styling, underline-hover effect + exception lists
│   │   ├── load-more.scss                      # .kt-load-more-hidden + .kt-load-more__button, paired with the load-more extension
│   │   ├── mega-menu.scss                      # desktop mega-menu structure/positioning
│   │   ├── mixins.scss                         # shared SCSS mixins (kt-panel-trigger, kt-not(), etc.)
│   │   ├── mobile-footer-menu.scss             # fixed mobile bottom-nav menu
│   │   ├── modal.scss                          # kt-modal overlay shell — fixed, z-index 99999, size variants, always-in-DOM
│   │   ├── nav.scss                            # main site header/nav layout, logo styling
│   │   ├── order.scss                          # responsive block-order utility styles
│   │   ├── page.scss                           # generic page/post layout
│   │   ├── parallax-critical.scss              # parallax cover-block styling (critical split)
│   │   ├── parallax.scss                       # parallax cover-block styling (deferred split)
│   │   ├── plugins.scss                        # third-party plugin overrides
│   │   ├── project-card.scss                   # .kt-project-card outer shell + circular arrow-link button + tags line; image/title/button styling itself lives as block-supports attributes on templates/single-kt_project_card.html
│   │   ├── responsive-width.scss               # .kt-has-responsive-width utility class
│   │   ├── scroll-animations-critical.scss     # scroll entrance animation mixins (critical split)
│   │   ├── scroll-animations.scss              # scroll entrance animation mixins (deferred split)
│   │   ├── scroll.scss                         # scroll-to-top button + progress ring
│   │   ├── search-panel.scss                   # search dropdown panel + modal, popular-pages list
│   │   ├── search.scss                         # search form/input/results styling
│   │   ├── shortcodes.scss                     # empty placeholder file
│   │   ├── social.scss                         # social nav/menu block styling
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
│   │   ├── dropdown-panel.ts                   # generic trigger/modal dropdown-panel controller
│   │   ├── dynamic-preview-blocks.ts           # DYNAMIC_PREVIEW_BLOCKS: PHP-only ServerSideRender blocks (city-grid, city-map) excluded from every sitewide unconditional attribute-injecting editor filter, since WP's block-renderer REST schema rejects any attribute the block's own PHP schema doesn't declare
│   │   ├── panel-coordinator.ts                # registry: opening one panel closes all others
│   │   └── scroll-lock.ts                      # reference-counted documentElement scroll-lock
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
│   ├── single-kt_project_card.html             # shared project-card layout — core/post-featured-image + core/post-title (context-aware, no meta duplication) plus a core/post-meta-bound arrow-link button (project_url) and tags paragraph (project_tags); edited once here, propagates to every kotlinskidev/project-card embed (rendered via kotlinskidev_render_project_card_embed(), functions/project-card.php)
│   ├── single-service_location-en.html         # English-language city landing page — real native blocks (no gettext), served instead of single-service_location.html via a `single_template_hierarchy` filter when pll_current_language() is "en" (functions/service-locations.php); city mentions bound to the "city" post-meta so one edit updates every EN city page
│   ├── single-service_location.html            # Polish-language (default) city landing page — real native blocks, fully editable in the Site Editor (reorder, Style panel, insert blocks); city mentions bound to the "city" post-meta so one edit updates every PL city page
│   └── tag.html                                # tag archive
├── tests/                                      # JS/PHP unit, PHP integration, and Playwright e2e — see docs/testing.md for the full layer breakdown
│   ├── Pest.php                                # PHP unit bootstrap — stubs add_action/add_filter for Brain Monkey + a minimal WP_HTML_Tag_Processor (tests/TestCase.php extends this setup)
│   ├── TestCase.php                            # base class for all PHP unit tests
│   ├── Unit/                                   # 76 PHP unit test files (Pest 5 + Brain Monkey), one per functions/*.php|includes/*.php module + selected src/blocks/**/render.php files
│   ├── e2e/                                    # Playwright, run via `npm run test:e2e` (wp-scripts test-playwright) against the live LocalWP site, never wp-env
│   │   ├── .env                                # WP_TEST_ADMIN_USER/PASSWORD for authenticated specs — gitignored
│   │   ├── .env.example                        # documents the required .env keys, committed
│   │   ├── global-setup.js                     # logs in once via /login/, saves session to artifacts/.auth/admin.json; no-ops with a warning if credentials are absent
│   │   ├── utils.ts                            # shared content-agnostic helpers: acceptCookies, clickAndExpectNavigation, getFirstLiveLink, NOT_CURRENT_PAGE
│   │   ├── wp-cli.ts                           # WP-CLI fixture helpers: createFixturePage/deleteFixturePage/createFixturePost/deleteFixturePostsByType/deletePost/getPostUrl/getRegisteredPatterns
│   │   ├── homepage.spec.ts                    # smoke test — homepage loads
│   │   ├── header.spec.ts                      # 31 tests — parts/header.html (mega-nav, search/language dropdowns, hamburger overlay, sticky header)
│   │   ├── footer.spec.ts                      # 9 tests — parts/footer.html (nav grid, brand block, copyrights, scroll-to-top, mobile bottom nav)
│   │   ├── animated-counter.spec.ts            # frontend — kotlinskidev/animated-counter block extension
│   │   ├── banner-carousel.spec.ts             # frontend — kotlinskidev/banner-carousel block
│   │   ├── cover-lazy-loading.spec.ts          # frontend — kotlinskidev/cover-lazy-loading block extension
│   │   ├── gallery-lightbox.spec.ts            # frontend — kotlinskidev/gallery-lightbox block
│   │   ├── hover-animation-controls.spec.ts    # frontend — kotlinskidev/hover-animation-controls block extension
│   │   ├── model-viewer.spec.ts                # frontend — kotlinskidev/model-viewer block (real WebGL via headless Chromium: load, click/keyboard toggle, reduced-motion)
│   │   ├── parallax.spec.ts                    # frontend — kotlinskidev/parallax block extension
│   │   ├── protected-content.spec.ts           # frontend — kotlinskidev/protected-content block
│   │   ├── responsive-display.spec.ts          # frontend — kotlinskidev/responsive-display block extension
│   │   ├── responsive-order.spec.ts            # frontend — kotlinskidev/responsive-order block extension
│   │   ├── scroll-animations.spec.ts           # frontend — kotlinskidev/scroll-animations block extension
│   │   ├── slider.spec.ts                      # frontend — wpe/slider block: continuousAutoplay (start-on-visible, freeze/resume on hover-focus-click, no snap), regular autoplay, pagination, progress circle
│   │   ├── service-location.spec.ts            # frontend — city post-meta binding resolves to real text (not the raw placeholder), gradient-text applied to exactly the 3 contrast-safe city mentions, per-city map iframe, PL/EN Polylang pair (skips if none currently published)
│   │   └── editor/                             # authenticated specs — opt in per-file via test.use({ storageState })
│   │       ├── site-editor.spec.ts             # confirms the Site Editor loads under the test account instead of redirecting to login
│   │       ├── patterns-validity.spec.ts       # one test per registered theme pattern — asserts none trigger Gutenberg's "Block contains unexpected or invalid content." warning
│   │       ├── service-location.spec.ts        # single-service_location template canvas exposes multiple distinct role="document" blocks (not one opaque preview — see .claude/rules/testing.md for why block wrappers aren't role="heading"/"group"); City Details panel loads with a non-empty value on a real post
│   │       └── {block}.spec.ts                 # editor-side counterpart to each frontend block spec above (animated-counter, banner-carousel, cover-lazy-loading, gallery-lightbox, hover-animation-controls, parallax, protected-content, responsive-display, responsive-order, scroll-animations)
│   └── integration/                            # PHP integration (Pest + wp-phpunit + WP_UnitTestCase) — own isolated toolchain (Pest 1.23/PHPUnit 9.6), separate composer.json/vendor from the root
│       ├── Pest.php                            # integration-suite bootstrap
│       ├── TestCase.php                        # extends WP_UnitTestCase
│       ├── bootstrap.php                       # boots wp-phpunit against a dedicated kotlinskidev_test MySQL database
│       └── tests/                              # 67 test files, one per functions/*.php|includes/*.php module needing real WP_Query/DOM/admin-page coverage
├── .env
├── .env.example
├── .envrc
├── .mcp.json
├── .nvmrc
├── .prettierignore
├── .prettierrc.json
├── 404.php                                     # classic 404 handler (no FSE templates/404.html exists yet)
├── 500.html                                    # static PWA offline/error fallback
├── CHANGELOG.md                                # Keep a Changelog + semver history
├── CLAUDE.md                                   # Claude Code project instructions
├── README.md                                   # project overview + npm commands
├── content.php                                 # legacy classic-theme partial
├── footer.php                                  # legacy classic-theme footer (superseded by parts/footer.html)
├── functions.php                               # thin require_once loader for functions/
├── header.php                                  # legacy classic-theme header (superseded by parts/header.html)
├── index.php                                   # classic-theme fallback (WP resolves templates/*.html first)
├── offline.html                                # PWA offline fallback page
├── package-lock.json                           # npm lockfile
├── package.json                                # npm scripts + dependencies, theme version
├── page-search.php                             # custom page template backing the Search/Szukaj pages
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
7. **Classic template files at the theme root** (`index.php`, `page.php`, `single.php`, `content.php`, `header.php`, `footer.php`) are superseded by `templates/*.html` and `parts/*.html` — WordPress resolves block templates first when present, so these are believed dead but haven't been verified/removed.
