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
│   ├── security.md                             # security review checklist (OWASP Top 10, WP hardening, MCP attack surface, ISO 27001 cross-ref)
│   ├── seo.md                                  # technical SEO review checklist (crawlability, schema, hreflang, Core Web Vitals overlap)
│   ├── theme-colors.md                         # adaptive color token system
│   └── treeview.md                             # this file — full annotated structure tree
├── functions/                                  # 51 PHP modules, require_once'd from functions.php (cache.php must load first)
│   ├── active-link-state.php                   # marks links pointing at the current page with kt-link-current/aria-current and disables their click, gated by Advanced settings + per-block opt-out
│   ├── actions.php                             # misc template_redirect / wp_head / wp_footer actions
│   ├── admin-bar-styles.php                    # enqueues admin-bar style overrides, only when the bar is visible
│   ├── article-query-manager.php               # meta boxes for per-article query control
│   ├── banner-slider.php                       # enqueues/inits banner-carousel block assets
│   ├── blocks.php                              # registers block categories + every block.json (source of truth for blocks)
│   ├── blog-topic-manager.php                  # category "description" field admin UI + blog topic taxonomy
│   ├── border-gradient.php                     # applies --kt-border-gradient/--kt-border-width to any border-supporting block that picked a gradient (excludes kotlinskidev/button)
│   ├── breakpoints.php                         # central breakpoint values, exposed to editor + front end
│   ├── cache.php                               # build-fingerprint/transient cache manager — must load first
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
│   ├── language-switcher.php                   # [language_switcher] shortcode
│   ├── link-hover-effects.php                  # applies configurable link hover-effect classes to blocks
│   ├── login.php                               # custom wp-login.php styling
│   ├── maintenance.php                         # maintenance-mode toggle + admin settings page
│   ├── page-loader.php                         # renders page-loader markup on wp_body_open
│   ├── page-view-tracking.php                  # AJAX view tracking + Popular Pages query source
│   ├── patterns.php                            # registers 4 custom pattern categories
│   ├── polylang-accessibility.php              # a11y fixes for Polylang language-switcher markup
│   ├── polylang-content-resolution.php         # wp_navigation/wp_block Polylang-translatable, resolve by slug
│   ├── protection-helpers.php                  # RSA keypair + encrypt/decrypt for protected-content block
│   ├── responsive-display.php                  # per-breakpoint show/hide block attribute
│   ├── responsive-font-size.php                # per-breakpoint font-size attribute
│   ├── responsive-order.php                    # per-breakpoint block reorder attribute
│   ├── responsive-spacing.php                  # per-breakpoint spacing attribute
│   ├── responsive-width.php                    # per-breakpoint width attribute
│   ├── scroll-top-top.php                      # [scroll_to_top] shortcode
│   ├── search-page-styles.php                  # conditional style fixes on search results pages
│   ├── seo-customizer.php                      # SEO Customizer fields — currently commented out, not loaded
│   ├── seo-noindex-compat.php                  # detects active SEO plugin (Yoast/Rank Math/AIOSEO/SEOPress), returns query-args noindex exclusion
│   ├── settings-page.php                       # main theme settings admin page
│   ├── site-identity.php                       # minimal site logo/title setup
│   ├── svg-gradient-defs.php                   # injects inline SVG gradient <defs> into wp_body_open
│   ├── svg-support.php                         # allows SVG uploads + inline SVG rendering
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
│   └── header.html                             # site logo, kotlinskidev/navigation, theme-switcher
├── patterns/                                   # 52 reusable block patterns
│   ├── about-2.php                             # About Section 2
│   ├── about-us.php                            # About Us Section
│   ├── article-breadcrumbs.php                 # Article Breadcrumbs
│   ├── article-hero.php                        # Article Hero Section
│   ├── article-tags.php                        # Article Tags
│   ├── blog-cards.php                          # Blog Cards Grid
│   ├── blog-topics-grid.php                    # Blog Topics Grid
│   ├── category-header.php                     # Category Header
│   ├── category-posts-grid.php                 # Category Posts Grid
│   ├── contact-page.php                        # Contact Us
│   ├── contact-with-form.php                   # Contact with Form
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
│   ├── blocks/                                 # 48 custom block dirs: 31 registered blocks + 17 JS-only block-extension filters
│   │   ├── above-fold/                         # extension: Advanced-tab "Load above the fold" toggle, shown only on blocks registered in functions/deferred-block-assets.php
│   │   │   └── index.tsx
│   │   ├── active-link-state/                  # extension: Advanced-tab opt-out for the sitewide active-page link highlight
│   │   │   └── index.tsx
│   │   ├── animated-counter/                   # extension: count-up-on-scroll for heading/paragraph/group/columns
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
│   │   ├── button/                             # standalone CTA button, independent normal/hover color+gradient
│   │   │   ├── ButtonColorControls.tsx
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── button-styles/                      # extension: registers a "Gradient Outline" style for core/button
│   │   │   └── index.ts
│   │   ├── contact-form/                       # contact-form-ts/form — contact form + CAPTCHA, posts to admin-post.php
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   ├── render.php
│   │   │   └── style.scss
│   │   ├── content-block/                      # resolves a wp_block reusable post by slug (Polylang-aware)
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── copyrights/                         # footer copyright/year text
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── cover-lazy-loading/                 # extension: force-disable native lazy loading on cover/image
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
│   │   ├── hover-animation-controls/           # extension: ~13 canned hover animation classes
│   │   │   └── index.tsx
│   │   ├── language-panel/                     # Polylang language switcher trigger + dropdown
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── link-hover-effects/                 # extension: opt out of global link hover styling per block
│   │   │   └── index.tsx
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
│   │   ├── scroll-to-top/                      # "back to top" floating button
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── search-panel/                       # search trigger button opening a modal/dropdown panel
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── shared/                             # shared editor UI: ColorGradientControl, NavIconPicker
│   │   │   ├── color-gradient-control.ts
│   │   │   └── nav-icon-picker.tsx
│   │   ├── simple-grid/                        # CSS-grid container, column count derives from Holder children
│   │   │   ├── block.json
│   │   │   ├── edit.tsx
│   │   │   ├── index.ts
│   │   │   ├── render.php
│   │   │   ├── save.tsx
│   │   │   └── style.scss
│   │   ├── slider/                             # wpe/slider — generic Swiper carousel, InnerBlocks slides
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
│   │   ├── social-section/                     # social-links row, ancestor: core/navigation
│   │   │   ├── item/
│   │   │   │   ├── block.json
│   │   │   │   └── render.php
│   │   │   ├── block.json
│   │   │   ├── index.tsx
│   │   │   └── render.php
│   │   ├── text-justify-controls/              # extension: toolbar Justify align button for paragraph/heading
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
│   │   ├── gsap-sticky.ts                      # GSAP-based sticky element behavior
│   │   ├── hamburger.ts                        # mobile nav overlay open/close, submenu collapse, scroll-lock
│   │   ├── hide-nav-on-scroll.ts               # hides/shows nav bar based on scroll direction
│   │   ├── image-lightbox.ts                   # lightbox open/close/context capture for gallery images
│   │   ├── language-panel.ts                   # wraps initDropdownPanels for .kt-lang-panel
│   │   ├── language.ts                         # small language-related DOM script
│   │   ├── mega-menu.ts                        # desktop mega-menu open/close/backdrop + delay timers
│   │   ├── page-views.ts                       # posts page-view AJAX beacon on scroll/visibility-change
│   │   ├── protected-content.ts                # frontend reveal/decrypt handler for protected-content block
│   │   ├── restoration.ts                      # restores scroll position / bfcache navigation handling
│   │   ├── scroll-animations.ts                # IntersectionObserver entrance-animation trigger
│   │   ├── scroll-to-top.ts                    # scroll-to-top button visibility + progress ring
│   │   ├── search-panel.ts                     # wraps initDropdownPanels for .kt-search-panel, autofocuses input
│   │   ├── smooth-scroll-offset.ts             # smooth-scrolls anchor links with header-height offset
│   │   ├── sticky-header.ts                    # enables/disables sticky header based on scroll threshold
│   │   ├── theme-switcher.ts                   # dark/light theme apply + OS prefers-color-scheme listener
│   │   └── utils.ts                            # shared debounce/getBreakpoints/getScrollTop/isMobile helpers
│   ├── styles/                                 # SCSS source partials
│   │   ├── above-the-fold.scss                 # critical layout-shift prevention rules
│   │   ├── accessibility.scss                  # skip-link, prefers-reduced-motion handling
│   │   ├── admin-bar.scss                      # admin-bar-specific overrides (editor-only bundle)
│   │   ├── animations.scss                     # hover animation class definitions
│   │   ├── blog.scss                           # breadcrumbs + taxonomy/tag styling
│   │   ├── border-gradient.scss                # .kt-has-gradient-border utility class (universal border-gradient extension)
│   │   ├── button.scss                         # .kt-button component styles
│   │   ├── complianz.scss                      # Complianz cookie-consent plugin dark/light overrides
│   │   ├── components.scss                     # editor placeholder components
│   │   ├── editor-overrides.scss               # block-editor canvas style overrides (editor-only bundle)
│   │   ├── faq-accordion.scss                  # FAQ details 2-col grid, +/− icon, animating-state overflow
│   │   ├── footer.scss                         # footer layout (top/brand/nav sections)
│   │   ├── global.scss                         # broad utility classes, social-link overrides
│   │   ├── gradients.scss                      # gradient background utility class
│   │   ├── kotlinskiwind.scss                  # hand-rolled Tailwind-like utility classes
│   │   ├── language-panel.scss                 # language switcher panel styling
│   │   ├── language.scss                       # language button styling
│   │   ├── lazy.scss                           # contact-form success/error state + lazy-load styles
│   │   ├── link-hover-effects.scss             # link hover-effect utility classes
│   │   ├── link.scss                           # link styling, underline-hover effect + exception lists
│   │   ├── mega-menu.scss                      # desktop mega-menu structure/positioning
│   │   ├── mixins.scss                         # shared SCSS mixins (kt-panel-trigger, kt-not(), etc.)
│   │   ├── mobile-footer-menu.scss             # fixed mobile bottom-nav menu
│   │   ├── nav.scss                            # main site header/nav layout, logo styling
│   │   ├── order.scss                          # responsive block-order utility styles
│   │   ├── page.scss                           # generic page/post layout
│   │   ├── parallax-critical.scss              # parallax cover-block styling (critical split)
│   │   ├── parallax.scss                       # parallax cover-block styling (deferred split)
│   │   ├── plugins.scss                        # third-party plugin overrides
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
│   │   ├── theme-colors.scss                   # adaptive color vars + gradient-text/gradient-border/gradient-border-bg mixins
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
├── templates/                                  # 9 FSE block templates (no 404.html — see Known Issues)
│   ├── article.html                            # single blog post
│   ├── articles.html                           # blog archive/hub
│   ├── blank-with-header-footer.html           # canvas with header/footer, empty content area
│   ├── blank.html                              # bare canvas, no header/footer
│   ├── category.html                           # category archive
│   ├── index.html                              # homepage
│   ├── page.html                               # generic page
│   ├── search.html                             # search results
│   └── tag.html                                # tag archive
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
