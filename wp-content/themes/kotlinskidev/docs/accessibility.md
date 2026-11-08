# Accessibility Review Checklist

A comprehensive accessibility review checklist for kotlinskidev.dev, organized around the four **WCAG** principles — Perceivable, Operable, Understandable, Robust (POUR) — targeting **WCAG 2.2 Level AA** sitewide as the primary bar, with **Level AAA** criteria applied selectively where reasonably achievable (WCAG itself advises against claiming blanket AAA conformance for an entire site — see §14). This is a working checklist, not a description of current state — items get checked off as each is verified against the live site.

Scope: `src/scripts/*` (`accessibility.ts`, `hamburger.ts`, `mega-menu.ts`, `search-panel.ts`, `language-panel.ts`, `theme-switcher.ts`, `scroll-to-top.ts`, `modal-manager.ts`), `src/styles/accessibility.scss`, `src/styles/modal.scss`, `functions/image-link-accessibility.php`, `functions/polylang-accessibility.php`, `functions/link-hover-effects.php`, `functions/modals.php`, `functions/model-viewer-mime.php`, the 10 custom blocks in `src/blocks/*` plus `src/blocks/modal-trigger` and `src/blocks/model-viewer`, the 9 color-scheme variants (`styles/*.json`) × light/dark mode (`docs/theme-colors.md`), and the PL/EN Polylang routing.

---

## 1. Perceivable — Text Alternatives (WCAG 1.1)

- [ ] Every meaningful `<img>` (including inside custom blocks like `nav-image`, `nav-banner`, `gallery-lightbox`) has descriptive `alt` text; purely decorative images have `alt=""`.
- [ ] Inlined SVGs (`functions/svg-support.php`) that are decorative get `aria-hidden="true" focusable="false"` (already applied by `kotlinskidev_build_inline_svg`); SVGs that convey meaning on their own (not paired with visible text) get an accessible name via `<title>` or `aria-label` instead of being blanket-hidden.
- [ ] Every icon-only interactive control has a non-empty accessible name: hamburger toggle, search-panel trigger, theme-switcher, scroll-to-top, language-panel indicator, social icons (`social-item` block).
- [ ] **`functions/image-link-accessibility.php` is a hardcoded URL→label lookup covering exactly 6 fixed URLs in 2 languages** — any icon-only image link outside that list (or any URL that changes) silently loses its accessible name. Prefer sourcing the label from the block's own attributes (or the linked page's title) so coverage isn't hand-maintained and language/URL-drift doesn't silently break it.
- [ ] Background/hero videos (`cover-video-preload`, `hero-carousel` slide video) that carry meaningful audio content have captions/transcripts; purely decorative muted background video does not need alt text but should be marked `aria-hidden` if it has no `<video>` controls exposed.

## 2. Perceivable — Color, Contrast & Color-Blindness (WCAG 1.4.1, 1.4.3, 1.4.6 AAA, 1.4.11)

- [ ] All body text meets **4.5:1** contrast (AA) against its background; large text (≥24px or ≥19px bold) meets **3:1**. Stretch goal for AAA: **7:1** normal / **4.5:1** large where feasible.
- [ ] UI components and graphical objects (focus outlines, icon buttons, form-field borders, carousel controls) meet **3:1** against adjacent colors (WCAG 1.4.11).
- [ ] **Gradient text (`kt-gradient-text`, `is-style-gradient-text` on `nav-link`/`nav-paragraph`/footer headings) is checked across its full color range, not just the endpoints** — a gradient that starts contrast-compliant and ends non-compliant still fails. This needs verifying against every one of the **9 color schemes × 2 modes = 18 combinations** (`docs/theme-colors.md`), since each scheme only swaps the accent family, and the gradient is used extensively (nav column-titles, footer headings, language-panel label).
- [ ] Dark-mode and light-mode surface/foreground token pairs (`theme.json` adaptive tokens) both independently meet contrast minimums — verify the `-dark` and `-light` halves of each pair separately, not just the default.
- [ ] Color is never the *only* signal for meaning: form validation state, active/current nav item, required-field markers, and link-vs-text distinction all have a non-color cue too (underline, icon, text label, `aria-current`).
- [ ] Focus indicators (`:focus-visible` styles in `accessibility.scss`) meet the WCAG 2.2 **2.4.11/2.4.13** contrast and minimum-area requirements against both the unfocused state and the page background, in every color scheme.
- [ ] A color-blindness simulation pass (protanopia, deuteranopia, tritanopia, full achromatopsia — via Chrome DevTools' vision-deficiency emulation, Stark, or Sim Daltonism) is run across representative pages in each of the 9 schemes, checking nothing relies on red/green or color alone to be understood.

## 3. Perceivable — Motion, Autoplay & Media (WCAG 1.4.2, 2.2.2, 2.3.1)

- [ ] **`banner-carousel` and `hero-carousel` both default `autoplay: true` (confirmed in `edit.tsx`) with no visible pause/stop/hide control for the autoplaying rotation itself** — `hero-carousel/init.ts`'s `pauseSlideVideo` only pauses a slide's background *video* when advancing, it is not a user-facing autoplay pause button. WCAG 2.2.2 (Level A) requires a mechanism to pause, stop, or hide any content that auto-updates and lasts longer than 5 seconds — add a visible pause control (or stop after a bounded number of loops) to both carousels.
- [ ] The reduced-motion video handling in `accessibility.ts` (pauses `autoplay` video under `prefers-reduced-motion`) is a good baseline but is **conditional on that OS-level preference** — the WCAG 2.2.2 pause control above must be available to *everyone*, not only users who've opted into reduced motion.
- [ ] No content flashes more than 3 times per second anywhere (seizure risk, WCAG 2.3.1) — audit any GSAP/ScrollTrigger-driven flash/pulse effects and carousel transitions.
- [ ] `prefers-reduced-motion: reduce` disables/reduces parallax, scroll-triggered animation, and carousel auto-transition, not just video autoplay (ties to `docs/performance.md` §5's reflow/animation checklist — same media query, accessibility angle here).
- [x] `kotlinskidev/model-viewer`'s click-to-toggle 3D animation (`src/blocks/model-viewer/runtime.ts`) is user-initiated on each click, not autoplaying content that runs longer than 5 seconds — WCAG 2.2.2's pause-control requirement doesn't apply. Under `prefers-reduced-motion: reduce`, `handleClick()` jumps the `AnimationMixer` action straight to the target frame (`computeReducedMotionTargetTime()`) instead of tweening over the render-on-demand loop — verified in both directions by `tests/e2e/model-viewer.spec.ts`'s default (suite runs reduced-motion-on) and explicit `reducedMotion: "no-preference"` test blocks.

## 4. Perceivable — Adaptable Structure & Reflow (WCAG 1.3, 1.4.10, 1.4.12)

- [ ] Every page has exactly one `<h1>`, and heading levels never skip (h2→h4 without an h3) across composed patterns — verify for pages assembled from multiple patterns where each pattern might independently start its own heading level.
- [ ] Visual/CSS-driven reordering (`simple-grid`, `responsive-order` block, CSS Grid `order`) never diverges from a logical DOM/reading order for screen-reader and keyboard-only users.
- [ ] Landmarks are correct and unique: one `<header>`/`banner`, one `<footer>`/`contentinfo`, `<nav>` regions labeled distinctly when there are several (main nav vs. footer nav vs. mobile nav vs. mobile footer nav — four separate `wp_navigation` posts per `docs/navigation-structure.md`, each needs its own `aria-label`).
- [ ] Page reflows to a single column with no horizontal scrolling or content/functionality loss at 400% zoom / 320px CSS width (WCAG 1.4.10) — check the mega-menu grid columns and footer's `simple-grid` collapse correctly.
- [ ] Text remains readable and functional when the user overrides line-height, paragraph spacing, letter-spacing, and word-spacing per WCAG 1.4.12 (relevant given the theme sets explicit `letterSpacing` on gradient headings/labels — confirm it doesn't clip or overlap under user overrides).
- [ ] Orientation isn't locked to portrait or landscape (WCAG 1.3.4) unless essential.

## 5. Operable — Keyboard Accessibility (WCAG 2.1.1, 2.1.2)

- [ ] Every interactive element — nav links, submenu toggles, hamburger, search-panel, language-panel, carousel controls, theme-switcher, form fields, cookie-consent buttons — is reachable and operable with keyboard alone (Tab/Shift+Tab, Enter/Space, Arrow keys where appropriate).
- [ ] No keyboard trap: opening the mega-menu, hamburger panel, search-panel, or language-panel never leaves focus unable to escape back to the trigger or rest of the page (Escape key + logical Tab order out).
- [ ] **`accessibility.ts`'s custom submenu keyboard handling targets `.menu-item-has-children`/`.sub-menu` — classic WordPress menu-widget markup.** The site's actual navigation is block-based (`core/navigation-submenu` → `wp-block-navigation-item`, per `docs/navigation-structure.md`). Verify this script's selectors still match live markup; if they don't, it's dead code providing a false sense of coverage and the real mega-menu/hamburger keyboard behavior (`mega-menu.ts`, `hamburger.ts`) needs its own explicit audit instead.
- [ ] Overlay panels (mega-menu, search-panel, language-panel) implement a proper **focus trap** while open (focus cycles within the panel, doesn't leak to background content) and **return focus to the triggering element** on close — no dedicated focus-trap utility was found in `src/scripts/*`; confirm each panel handles this manually and correctly.
- [ ] No positive `tabindex` values (`tabindex="1"`, `"2"`, etc.) anywhere — only `0` and `-1` are used to manage focus order.
- [ ] Swiper carousels (`banner-carousel`, `hero-carousel`) enable and configure the **`a11y` Swiper module** (not found imported in either block's `init.ts` — currently only `Navigation, Pagination, Keyboard, Autoplay, Scrollbar` are imported) so pagination bullets, prev/next buttons, and slide announcements get proper ARIA out of the box instead of Swiper's bare unlabeled markup.
- [ ] Skip link (`accessibility.scss`'s `.skip-link.screen-reader-text`) is the first focusable element on every page, visibly appears on focus, and its target has both a matching `id` and `tabindex="-1"` so focus actually lands there.

## 6. Operable — Focus Management & Live Regions (WCAG 2.4.3, 2.4.7, 4.1.3)

- [ ] A visible focus indicator exists on **every** interactive element sitewide, never suppressed with `outline: none`/`outline: 0` without a compliant replacement.
- [ ] Focus order follows visual/logical reading order on every template, including inside CSS-Grid-based `simple-grid`/`holder` layouts.
- [ ] Opening/closing a panel (mega-menu, search, language switcher, hamburger, cookie consent) moves focus predictably (into the panel's first focusable element on open, back to the trigger on close) — never leaves focus stranded on a now-hidden element.
- [ ] **Zero `aria-live` regions exist anywhere in `src/` or `functions/` (confirmed via search)** — dynamic UI updates (live search results in `search-panel.ts`, contact-form submission success/error, cookie-consent banner state change, language switch) are not announced to screen-reader users. Add `aria-live="polite"` (or `"assertive"` for errors) regions for each of these dynamic-update points.
- [ ] `aria-expanded` on every disclosure control (submenu toggle, hamburger, search-panel trigger, language-panel indicator) is kept perfectly in sync with the actual visual open/closed state — verify after every interaction, not just on initial render.

## 7. Operable — Navigation & Wayfinding (WCAG 2.4.2, 2.4.4, 2.4.5 AAA, 3.2.3)

- [ ] Every page/route (including PL and EN variants) has a unique, descriptive `<title>`.
- [ ] Link text is descriptive out of context — no bare "read more"/"click here"/"kliknij tutaj" without an accessible name that includes what it links to (check article-excerpt patterns and `popular-pages` list items).
- [ ] Navigation structure and component placement are consistent across pages/templates (header nav, footer nav, search — same relative order and labeling everywhere) per WCAG 3.2.3.
- [ ] Multiple ways exist to locate content (primary nav + search + sitemap/footer links) — WCAG 2.4.5 (AAA, worth meeting given the site already has a search-panel and footer nav).
- [ ] Each of the four `wp_navigation` regions (main, mobile, footer, mobile-footer) has a distinct `aria-label` so screen-reader users can tell them apart when jumping via the landmarks list.

## 8. Operable — Input Modalities (WCAG 2.5.5 AAA, 2.5.7, 2.5.8)

- [ ] Touch targets (hamburger, search icon, theme-switcher, scroll-to-top, social icons, carousel arrows/pagination dots) are at least **24×24px** (WCAG 2.2's 2.5.8, Level AA) with adequate spacing; **44×44px** is the AAA target (2.5.5) and worth meeting for primary controls given how icon-dense the nav is.
- [ ] No functionality is exposed on `:hover` only — anything revealed on hover (gradient link effects via `link-hover-effects.php`, submenu previews) is equally reachable via keyboard focus and touch/click.
- [ ] Any drag-based interaction (carousel swipe) has a non-drag alternative (buttons/keyboard) per WCAG 2.5.7 — Swiper's built-in prev/next buttons and keyboard module cover this if enabled; verify they're present on every carousel instance, not just the editor default.
- [ ] Actions trigger on the *up* event, not the *down* event, so users can move off-target to cancel (pointer cancellation, WCAG 2.5.2).

## 9. Understandable — Readable & Language (WCAG 3.1.1, 3.1.2)

- [ ] The `<html lang>` attribute correctly reflects the active Polylang language (`pl`/`en`) on every route, including AJAX-loaded/dynamically-switched content.
- [ ] Any inline content in a different language than the surrounding page (a PL phrase inside an EN page or vice versa) is wrapped with its own `lang` attribute.
- [ ] Reading level of body copy is reasonable for a general audience; overly technical unexplained jargon is avoided or linked to a definition where it can't be (contributes toward AAA 3.1.5, "Reading Level").

## 10. Understandable — Predictable & Consistent (WCAG 3.2.1, 3.2.2, 3.2.4)

- [ ] Focusing a form field, nav item, or any control never by itself triggers a context change (navigation, form submission, new window) without explicit user activation (Enter/click).
- [ ] Changing a select/option/toggle (theme-switcher, language switcher) doesn't unexpectedly submit a form or navigate without warning.
- [ ] Repeated components (nav, footer, search) are identified consistently (same labels/roles) across the whole site, per WCAG 3.2.4.

## 11. Understandable — Forms & Input Assistance (WCAG 3.3.1, 3.3.2, 3.3.3, 3.3.4 AA)

- [ ] Every form field (contact form: name/email/topic/message; search input) has a programmatically associated label — a visible `<label for>` or, where the design calls for a visually-hidden label (`kotlinskidev/search-panel`'s `showLabel: false`), a real `.screen-reader-text` label element, **not just a `placeholder`** (placeholder-as-label fails WCAG 1.3.1/3.3.2 — it disappears on input and isn't reliably exposed to all assistive tech).
- [ ] Required fields are marked both visually (e.g. `*` plus explanatory text) and programmatically (`required`, `aria-required="true"`).
- [ ] Validation errors are announced to assistive tech (ties to the `aria-live` gap in §6) and linked to their field via `aria-describedby`, with color never the only error indicator.
- [ ] Error messages are specific and instructive ("Enter a valid email address," not just "Invalid").
- [ ] The captcha (`contact-form.php`'s reCAPTCHA/Turnstile integration) has an accessible path — Cloudflare Turnstile is generally more accessible than checkbox/image reCAPTCHA; confirm whichever provider is active in production offers a non-visual challenge or invisible/managed mode, and isn't the sole path to submitting the form for a screen-reader/keyboard-only user.
- [ ] No form submission causes irreversible, legally/financially significant consequences without a confirmation step (WCAG 3.3.4) — verify against the contact form's actual behavior (likely low-stakes, but confirm).

## 12. Robust — Markup & ARIA Correctness (WCAG 4.1.1, 4.1.2, 4.1.3)

- [ ] HTML is well-formed on every rendered template — no duplicate `id` attributes (a real risk when `simple-grid`/`holder`/`social-item` blocks repeat across a page), no unclosed tags.
- [ ] ARIA roles/states/properties are used per spec: no redundant roles on elements with implicit semantics (e.g. `role="button"` on a real `<button>`), no `aria-hidden="true"` on a focusable element.
- [ ] `aria-expanded`, `aria-haspopup`, `aria-controls` are wired correctly and bidirectionally on every disclosure widget, referencing real, existing IDs.
- [ ] Every custom block (`src/blocks/*`) passes an automated audit (axe-core / Lighthouse Accessibility / WAVE) with zero critical or serious violations, both in the editor canvas and on the rendered frontend.
- [ ] Third-party widget markup (Swiper carousels, Polylang switcher, Complianz consent banner) is checked for ARIA correctness too — third-party doesn't mean exempt.

## 13. WordPress / Polylang-Specific Findings

- [ ] **`functions/polylang-accessibility.php` targets `#pll_switcher`, `.pll-parent-menu-item`, `.lang-item` — classic Polylang widget/menu-item markup — via a 500ms-delayed `wp_footer` script plus regex-based output-buffering patches (`fix_pll_switcher_links`).** The site now renders language switching through the block-based `nav-language-panel` / `polylang/navigation-language-switcher` blocks (per `docs/navigation-structure.md`). Verify whether this file's selectors still match anything live; if the block-based switcher already renders correct ARIA natively, this file's regex output-buffering is dead weight and a latent double-announcement risk if markup ever does partially match both patterns.
- [ ] The block-based `polylang/navigation-language-switcher` itself is audited directly for accessible names on each language link/flag (not relying on the legacy PHP patch file to fix it after the fact).
- [ ] `functions/link-hover-effects.php`'s `disableLinkGradient` option is used wherever gradient-on-hover text would otherwise fail contrast in a hover/focus state — confirm focus state (not just hover) also respects this.
- [ ] Editor-side (`Edit` component) UI in custom blocks — especially `language-panel` and `search-panel`'s custom edit views — is keyboard-operable and has accessible labels for their custom controls, not just relying on inherited `@wordpress/components` defaults where custom markup was added.

## 14a. Modal System (`kt_modal`) — Findings from 2026-08-11 Review

- [x] Trigger links (`functions/modals.php:101`, rewritten via `WP_HTML_Tag_Processor` to `href="#kt-modal-{id}"`) are real `<a>` elements — natively focusable and Enter-operable, no custom keyboard handling required (WCAG 2.1.1).
- [x] The close button has an explicit `aria-label="Close"` (`functions/modals.php:126`) overriding the ambiguous `&times;` glyph — icon-only control has a non-empty accessible name (WCAG 4.1.2/1.1.1).
- [x] Escape key closes the open modal regardless of current focus location (`src/scripts/modal-manager.ts:52-56`, document-level listener).
- [x] Focus moves into the dialog (to `.kt-modal__close`) on open and back to the triggering element on close (`src/scripts/modal-manager.ts:16,28`) — correct open/close focus-management pattern (WCAG 2.4.3/3.2.1).
- [x] **Fixed 2026-08-11 — focus trap.** `src/scripts/modal-manager.ts`'s `trapFocus()` cycles Tab/Shift+Tab among `activeModal`'s focusable descendants, and `setBackgroundInert()` applies the native `inert` attribute to every other `document.body` child on open (removed on close) — Tab can no longer reach background content at all, since it's excluded from the tab order entirely (WAI-ARIA APG Dialog pattern satisfied).
- [x] **Fixed 2026-08-11 — background content removed from the accessibility tree.** The same `setBackgroundInert()` (`src/scripts/modal-manager.ts`) applies `inert` to background siblings while a modal is open, which removes them from both the tab order and the accessibility tree in modern browsers (not just relying on `aria-modal="true"` alone as before).
- [x] **Fixed 2026-08-11 — dialog now has an accessible name.** `functions/modals.php`'s `kotlinskidev_render_modal_shells()` adds `aria-label="<?php echo esc_attr( $modal->post_title ); ?>"` to the `.kt-modal` wrapper, so screen readers announce the specific modal's title, not just "dialog". Covered by `tests/integration/tests/ModalsTest.php`'s aria-label test.
- [x] **Fixed 2026-08-11 — close-button focus-visible contrast.** `src/styles/modal.scss`'s `.kt-modal__close:focus-visible` no longer relies on the Firefox-invalid `-webkit-focus-ring-color` keyword. It now renders a real, visible ring via the theme's `gradient-border()` mixin (`theme-colors.scss`) using `var(--kt-text-gradient)`, the same brand-gradient token and masked-`::before` technique `.kt-button__link:focus-visible` already uses (`button.scss`) — a themed 2px ring against the gradient's darkest/lightest stops clears 3:1 contrast against the `#f2f2f2`/dark-mode dialog surface in both cases, unlike the flat 8%-tint background alone. (The unrelated `-webkit-focus-ring-color` pattern still exists sitewide in `nav.scss`/`social.scss`/`scroll.scss`/`theme.scss` — out of scope for this fix, tracked separately.)
- [~] **Partially addressed — return-focus-to-trigger edge case.** `src/scripts/modal-manager.ts`'s `closeModal()` now guards with `activeTrigger?.isConnected` before calling `.focus()`, so a removed/detached trigger no longer throws — but no fallback focus target is set in that case, so focus can still land nowhere. Minor severity, left as-is per the original review.
- [ ] Manual verification needed (not verifiable from code): actual screen-reader behavior of `aria-modal="true"` without `inert` on siblings — test with NVDA + Firefox and VoiceOver + Safari, navigating by headings-list and links-list rotor while a modal is open, confirming background content is not reachable via virtual cursor.
- [ ] Manual verification needed: keyboard-only pass (Tab from close button forward and Shift+Tab backward) to directly reproduce/confirm the focus-trap gap above across at least one modal per size variant (`small`/`medium`/`large`/`full`).

## 14. Testing, Legal Frameworks & Conformance

- [ ] **Target conformance**: WCAG **2.2 Level AA** sitewide, in both PL and EN. Level AAA criteria (contrast 7:1, 2.5.5 44×44 targets, 2.4.5 multiple-ways, 3.1.5 reading level) are applied selectively — WCAG's own conformance guidance recommends against claiming full AAA for an entire site, since some AAA criteria can't be met for all content types.
- [ ] **EU**: cross-check against **EN 301 549** (the harmonized standard implementing WCAG 2.1/2.2 AA for ICT) and the **Web Accessibility Directive** ((EU) 2016/2102, primarily public-sector scope). The **European Accessibility Act** (Directive (EU) 2019/882) has been in force since **28 June 2025** and applies to specific private-sector digital products/services (e-commerce, consumer banking, e-books, etc.) — confirm whether any part of this site (paid services, checkout flows) falls under EAA's actual legal scope versus being general good practice.
- [ ] **US**: **ADA Title III** case law has consistently treated **WCAG 2.1 AA** as the de facto standard for public-facing commercial websites; **Section 508** (federal agencies/contractors) references the same EN 301 549 harmonized standard — relevant if any government-adjacent work is in scope.
- [ ] **Automated testing**: run axe DevTools, Lighthouse Accessibility, and/or WAVE against every template and custom block. Automated tools catch roughly 30–40% of WCAG failures — treat a clean automated scan as a floor, not proof of compliance.
- [ ] **Manual screen-reader passes**: NVDA + Firefox (Windows), VoiceOver + Safari (macOS/iOS), TalkBack + Chrome (Android). For each: navigate by headings-only, by landmarks-only, and by links-list (the screen-reader "rotor"), and confirm no unexpected or duplicate announcements — the regex-based Polylang patches in §13 are a specific place double-announcements could surface.
- [ ] **Manual keyboard-only pass**: unplug the mouse, navigate the entire site — every interactive control reachable, every panel escapable, focus always visible.
- [ ] **Color-blindness simulation pass** across all 9 color schemes × 2 modes (18 combinations) — see §2.
- [ ] Re-run this checklist after any significant visual/interaction/color-token change — accessibility regressions (a removed focus style, a new low-contrast token, a hover-only interaction) are easy to reintroduce silently and won't show up in functional testing.
