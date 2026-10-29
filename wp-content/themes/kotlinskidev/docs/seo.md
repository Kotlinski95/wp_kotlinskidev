# Technical SEO Checklist

A comprehensive technical SEO checklist for kotlinskidev.dev. Not a legal requirement like `docs/legal-compliance.md`, but "best website in the world" territory essentially assumes this bar. This is a working checklist, not a description of current state.

**Ownership note**: Yoast SEO is active and owns most of the core plumbing by default — XML sitemap, virtual `robots.txt`, canonical tags, meta title/description templating, Open Graph/Twitter Card output, and basic Article/Person schema. Most items below are about *verifying Yoast is configured correctly for this site*, not building these features from scratch in the theme. Where the theme has its own competing/legacy code, that's flagged explicitly.

Scope: `functions/seo-customizer.php`, `functions/blog-topic-manager.php`, `functions/modals.php`, Polylang PL/EN routing, `docs/theme-colors.md`/`docs/breakpoints.md` (responsive/CWV overlap with `docs/performance.md`), and the 9 custom patterns/templates.

---

## 1. Technical Crawlability & Indexability

- [ ] `robots.txt` (Yoast's virtual output, or a static file if one exists) correctly allows crawling of all public content and disallows only what should be excluded (search results pages, any staging/preview paths).
- [ ] XML sitemap (Yoast) is submitted to Google Search Console and Bing Webmaster Tools, includes both PL and EN post/page sets, and excludes noindexed content.
- [ ] Every page has exactly one canonical URL, and it's self-referencing on the canonical version (no accidental cross-language or `www`/non-`www` canonical mismatches — verify against the `/en/` URL prefix pattern used throughout).
- [ ] Search results template (`templates/search`), tag archives with thin content, and any internal-only pages (blank/maintenance templates) are set `noindex` where appropriate, not left to accumulate low-value indexed pages.
- [ ] No soft-404s: a genuinely missing page returns an actual `404` HTTP status, not a `200` with "not found" text.
- [ ] A proper, on-brand 404 page exists and offers navigation back into the site (search, popular links) rather than a dead end.
- [ ] No redirect chains (A→B→C) anywhere in the site's internal linking — verify via a crawl (Screaming Frog or similar) that internal links point directly to final URLs.
- [ ] HTTPS is enforced everywhere with no mixed-content warnings (ties to `docs/security.md` §3).

## 2. On-Page Fundamentals

- [ ] Every page/post has a unique, descriptive `<title>` (Yoast-managed) under ~60 characters, and a unique meta description under ~155 characters — no duplicate titles/descriptions across PL and EN versions of *different* pages (translations of the *same* page sharing similar content is expected and fine).
- [ ] Heading hierarchy is correct per page (one `<h1>`, no skipped levels) — this is the same requirement as `docs/accessibility.md` §4, verify it once and it satisfies both.
- [ ] URL slugs are human-readable and keyword-relevant in both languages (confirmed pattern: PL uses native slugs like `/uslugi/`, `/projekty/`, EN uses `/en/services/`, `/en/projects/` — consistent and good).
- [ ] Body content naturally targets relevant terms without keyword stuffing; content reads for humans first.

## 3. Redundant / Legacy Code Cleanup

- [ ] **`functions/seo-customizer.php` is dead/competing code**: it registers a Customizer meta-description field for the front page using the `mytheme` textdomain (a leftover generic-starter-theme artifact, never renamed to `kotlinskidev`), duplicating a field Yoast SEO already owns and which takes precedence anyway. Remove it, or confirm it's genuinely still needed and rename the textdomain/clean it up if so.
- [ ] No other theme code writes to `<title>`, meta description, canonical, or OG tags in a way that could conflict with or be silently overridden by Yoast — audit `functions/actions.php`'s `wp_head` hooks for any legacy overlap.

## 4. Structured Data / Schema.org

- [ ] Yoast's automatic schema graph is verified with Google's Rich Results Test on a representative page of each template type (homepage, article, page, category).
- [ ] `Person`/`Organization` schema (Yoast's "Who owns this site" setting) is configured — given the footer shows a real business address (Katowice, Poland), `LocalBusiness`/`Organization` schema with matching NAP (Name/Address/Phone) data is worth verifying specifically.
- [ ] Article schema includes `datePublished`/`dateModified`, author, and a valid featured-image reference for every blog post.
- [ ] `BreadcrumbList` schema is present and matches the actual navigable breadcrumb trail if breadcrumbs are shown anywhere in the templates.
- [ ] `FAQPage` schema is used on the FAQ page (`/najczesciej-zadawne-pytania/` / `/en/faq/` — already a nav destination per the footer/nav work) if the content is structured as actual Q&A pairs — real ranking/rich-result upside for a site that already has a dedicated FAQ page.
- [ ] No duplicate/conflicting schema is emitted (theme + Yoast both outputting overlapping `WebPage`/`Article` blocks) — check for exactly one schema graph in page source.

## 5. Open Graph & Social Sharing

- [ ] Yoast's Social tab has a default fallback OG image configured (used when a post/page has no featured image), sized correctly (1200×630 recommended).
- [ ] Every article/page with a custom hero/featured image gets that image in its OG tags, not the generic fallback.
- [ ] Twitter Card type is set (`summary_large_image` for visual content) and validated with Twitter/X's card validator (or a manual OG-tag inspection since the validator tool's availability varies).
- [ ] Social preview is spot-checked for both PL and EN versions of at least one article, one service page, and the homepage.

## 6. International SEO / `hreflang` (Polylang × Yoast)

- [ ] Yoast + Polylang together emit correct `hreflang` alternate tags on every page, pointing to the actual PL/EN translation counterpart (not the homepage as a fallback when a translation doesn't exist for a specific piece of content).
- [ ] An `x-default` hreflang entry exists and points to a sensible default (likely the PL version, given the business's home market, or EN if the "default" audience is international — this is a business decision, not just a technical one, worth confirming rather than assuming).
- [ ] The language switcher (`polylang/navigation-language-switcher` block, per the nav work already done) renders real crawlable `<a href>` links, not JS-only navigation — Googlebot needs to be able to follow them to discover the alternate-language URLs.
- [ ] URL structure is consistent and permanent per language (`/en/` prefix confirmed for EN, native PL slugs with no prefix) — no mixed patterns that would confuse crawlers about which URL is canonical for which language.
- [ ] Untranslated content (a PL post with no EN counterpart yet, or vice versa) doesn't produce a broken/self-referencing `hreflang` entry — Polylang should simply omit the alternate for languages without a translation.

## 7. Site Architecture & Internal Linking

- [ ] No orphan pages — every published page/post is reachable via at least one internal link from nav, a category/archive listing, or contextual in-content links.
- [ ] Category/taxonomy structure (`functions/blog-topic-manager.php`'s blog-topic taxonomy) is shallow and logical — avoid deeply nested categories that dilute link equity and confuse both users and crawlers.
- [ ] Articles link contextually to relevant service/project pages (and vice versa) where it's editorially natural — the Main Nav's Articles mega-menu column already surfaces category-grouped posts; verify in-body content does similar cross-linking, not just the nav.
- [ ] Pagination (article archives) uses proper `rel="next"/"prev"` equivalent handling or is otherwise crawlable end-to-end, not JS-infinite-scroll-only with no fallback.
- [x] **Fixed 2026-08-11 — modal triggers (`functions/modals.php`'s `kotlinskidev_apply_modal_trigger()`) preserve a link's real destination `href`.** A 2026-08-11 review found the `render_block` filter was unconditionally overwriting a trigger's real `href` with a `#kt-modal-{id}` fragment, which meant Googlebot never saw the actual destination URL — no crawl discovery, no link equity, for any page whose only internal link was such a trigger. Fixed: the real `href` is now left untouched (JS intercepts the click via a `data-kt-modal-target` attribute instead), and only a trigger with no real destination (empty or `#`) falls back to the `#kt-modal-{id}` placeholder. Covered by `tests/integration/tests/ModalsTest.php`.

## 8. Content Quality & E-E-A-T

- [ ] An About/author page clearly establishes real-world expertise and identity (Google's E-E-A-T guidance) — the site already has an "About" mega-menu section with a real photo, career page, and social links, which is a good foundation; confirm author bylines on articles link through to it.
- [ ] Contact information is easy to find (footer + dedicated Contact page, both already confirmed to exist) — trust signal for both users and Google.
- [ ] No thin or duplicate content: PL and EN versions of the same page are genuine translations (not one being a stub), and no auto-generated/boilerplate pages exist with near-identical content to another page.
- [ ] Content freshness: articles/service pages are reviewed and updated periodically, with `dateModified` actually changing when content materially changes (not just touched to fake freshness).

## 9. Images & Media

- [ ] Every meaningful image has descriptive `alt` text (same requirement as `docs/accessibility.md` §1 — one audit satisfies both accessibility and image-search SEO).
- [ ] Image filenames are descriptive before upload (`adrian-kotlinski-web-development.webp` beats `IMG_2043.webp`) where it's still practical to fix for existing media.
- [ ] Images are served in modern formats (WebP, confirmed as the theme standard) with appropriate compression (Smush plugin active — confirm it's actually processing new uploads, not just installed).
- [ ] Lazy-loading (`cover-lazy-loading` block, native `loading="lazy"`) is applied below the fold only — an eagerly-needed above-the-fold/LCP image should never be lazy-loaded, since that actively hurts both Core Web Vitals and SEO ranking signals (cross-check against `docs/performance.md` §6's LCP item, same underlying rule).
- [ ] `srcset`/`sizes` are correctly generated for responsive images at every breakpoint (`docs/breakpoints.md`'s DB-driven breakpoint system) so Google's mobile-first index sees appropriately-sized images, not desktop-size images shrunk via CSS.

## 10. Core Web Vitals (SEO ranking-factor overlap)

- [ ] LCP, CLS, and INP all meet Google's "Good" thresholds on both mobile and desktop for representative templates — this is `docs/performance.md` §6 in full; Core Web Vitals are a confirmed Google ranking signal, not purely a UX nicety, so treat that checklist as partially an SEO checklist too.
- [ ] Mobile-first indexing is verified: the mobile-rendered version of every template has full content parity with desktop (nothing hidden from mobile that a crawler would otherwise index from desktop).
- [ ] Google Search Console's Core Web Vitals report shows no pages in the "Poor"/"Needs Improvement" buckets for the site's actual traffic-weighted top pages.

## 11. Local SEO (given the visible business address)

- [ ] Google Business Profile exists and is claimed/verified for the business, with NAP (Name, Address, Phone) exactly matching the footer's `Poland, 40-143 Katowice, ul. Dekerta` address and the phone/email shown there.
- [ ] `LocalBusiness` schema (§4) NAP data matches the Google Business Profile and footer exactly — inconsistent NAP across sources is a known local-ranking penalty.
- [ ] If the business serves a specific geographic market, location-relevant terms appear naturally in relevant service-page copy (not stuffed, but not absent either).

## 12. Analytics & Search Console Setup

- [ ] Google Search Console is verified for the domain (and both PL/EN are covered — GSC handles this at the property/domain level, but confirm hreflang/international targeting settings are configured correctly there too).
- [ ] Google Analytics (if/when properly consent-gated per `docs/legal-compliance.md` §1) is configured with the correct domain, cross-domain tracking disabled unless genuinely needed, and goals/events set up for meaningful actions (contact form submit, not just pageviews).
- [ ] Bing Webmaster Tools is set up too — smaller share of traffic, but essentially free additional coverage.
- [ ] GSC's Coverage/Indexing report is checked periodically for crawl errors, unexpected `noindex`, or pages excluded for reasons that weren't intentional.

## 13. Review Cadence

- [ ] Search Console coverage and Core Web Vitals reports are checked monthly, not just at initial setup.
- [ ] A broken-link check (internal and outbound) runs periodically — content ages, and linked-to external pages disappear.
- [ ] This checklist is re-run after any URL-structure change, new template, or new content type — the kind of change most likely to introduce a silent crawlability regression.
