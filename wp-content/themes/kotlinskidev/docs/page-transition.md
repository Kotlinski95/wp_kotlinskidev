# Mobile bottom nav and page transitions

Final write-up of the T24 investigation (2026-11-10) into the mobile bottom nav jumping on page changes. Read this before touching the mobile footer nav, view transitions, the deferred stylesheet loading or anything that scrolls. Verified on a real iPhone 12 Pro Max (iOS 27, Chrome and Safari): the jump is gone and scroll restoration works.

## Summary

- **Symptom:** on Chrome for iOS the bottom nav jumped about 100px (and floated mid-screen on a slow load) when changing pages or refreshing, most visibly at the top of a page. Safari was mostly fine.
- **Root cause:** a browser bug. Any `position:fixed` bottom bar on Chrome for iOS moves with the browser's toolbar while a page changes ([WebKit bug 297779](https://bugs.webkit.org/show_bug.cgi?id=297779)). A plain `position:fixed; bottom:0; left:0; right:0` bar reproduces it, and so does audioplex.pl, which uses exactly that.
- **Fix:** an app shell below `64rem`. The document root never scrolls; `.wp-site-blocks` scrolls inside a `100dvh` body and the nav is an absolutely positioned glass overlay at the bottom of that body, so it is no longer a `position:fixed` bar.
- **Related fixes** found on the way: a stale `visualViewport` offset that lifted the nav, half-styled and double-blinking page changes, a header left hidden after scroll-to-top, and a cover video rewinding after it ended.

## Final design

| Piece | Where | Role |
| --- | --- | --- |
| App shell gate | `functions/app-shell.php`, `src/blocks/navigation/render.php` | The bar-mode navigation block buffers its `<nav>` and prints it on `wp_footer` priority 0, after `.wp-site-blocks`, and adds `body.kt-app-shell` |
| App shell CSS | `src/styles/app-shell.scss` (critical CSS) | At `max-width: 64rem`: `html` and `body` are `100dvh` with `overflow:hidden`, `html` margin-top forced to 0, `body` padding-top is the admin bar offset, `body > .wp-site-blocks` is the only scroller, the nav is `position:absolute; bottom:0` |
| Scroll abstraction | `src/scripts/utils.ts`, `src/scripts/app-shell.ts` | `getScrollContainer`, `getScrollTop`, `scrollTo`, `onScroll`, `getElementScrollTop`, `getMaxScrollTop`; the scroll position carries across the breakpoint |
| GSAP | `src/blocks/scroll-section/init.ts` | `gsap.matchMedia()`; in shell mode `scroller` is the container with `pinType: "fixed"` |
| Cross-document view transition | `functions/view-transitions.php` | `@view-transition{navigation:auto}` and a 180ms root crossfade. No named elements on purpose |
| Transition marker and reveal | `src/critical.ts`, `src/scripts/view-transition-reveal.ts` | `pagereveal` sets `html.kt-vt`; above-the-fold `*-on-scroll` elements are revealed before first paint |
| Blocking CSS on internal navigation | `src/scripts/blocking-stylesheets.ts` | Same-origin referrer: deferred `media="print"` stylesheets become `all` |
| Solid nav during transitions | `src/scripts/nav-solid-transition.ts`, `mobile-footer-menu.scss` | `html.kt-nav-solid` gives the nav an opaque background until the page has loaded or the transition finished, then it fades to the glass look |
| Keyboard offset | `src/scripts/visual-viewport-offset.ts` | `--kt-vv-bottom-offset` only while a text field is focused or the page is pinch-zoomed |

### Rules for future changes

1. In shell mode the root must never be scrollable: `document.documentElement.scrollHeight <= window.innerHeight` on every page, with and without the admin bar. Do not give `html` a margin or padding that adds height. The admin bar offset is applied once, as `body` padding-top, with `html` margin-top forced to 0.
2. Do not add `position:fixed; bottom:...` bars for the mobile layout. Anything pinned to the bottom is an absolute child of `body` (or sits inside the scroller).
3. Never read `window.scrollY` or call `window.scrollTo` for page scrolling. Use the helpers in `utils.ts`; they handle both the window (desktop) and the container (shell).
4. Do not name the nav or the header for view transitions. A named element becomes a backdrop root, which kills `backdrop-filter` and made the active item snap.
5. The shell and the nav-solid colour are configurable only through the footer template part (see below); do not hard-code colours in CSS.

### Configuring the solid colour

Site Editor, Footer template part, select the mobile Navigation block (display mode Bar), "Bar background while loading". It stores `barSolidBackground`, a palette slug or a hex. `render.php` outputs it as `--kt-mobile-nav-solid-bg` after `kotlinskidev_mobile_nav_solid_background_value()` restricts it to a slug or hex. Fallback order: that value, then `settings.custom.mobileNav.solidBackground` in `theme.json`, then `var(--color-surface)`. The blur stays on, so only the background colour changes and the fade is smooth.

## Causes and fixes

### 1. Fixed bottom bars jump on Chrome for iOS (fixed by the app shell)

- Chrome for iOS slides its bottom toolbar away and back during a page change and refresh, and `position:fixed` bottom elements follow the web view's frame. JavaScript on the old page never sees it: `innerHeight`, `visualViewport.height` and scroll position stay constant up to the tap and `pageswap`.
- A 60fps frame analysis of a refresh recording showed the nav and the Complianz cookie button (which does not use our offset variable) jumping up about 98 CSS px together for about 4 frames while the toolbar stayed still.
- Ruled out on a real iPhone, each alone and together: `translateZ(0)`, `backdrop-filter`, the nav transition, `overflow-x:clip` on `html` and `body`, `position:sticky`, a `100dvh` dock wrapper, `top` from `100dvh`, the viewport meta, and the view transition itself (it reproduced with the transition disabled). Reflow is excluded because the ancestors have no `transform`, `filter` or `contain` and the page values do not change.
- Lab (a small multi-page server with one switch per feature): the plain fixed bar, which is what audioplex.pl uses, jumped under fast clicking. The only stable layouts keep the document root unscrollable and scroll an inner element: `y` (flex column app shell), `g` (glass overlay nav), `e` (the `body` itself is the shell) and `ep` (same, admin bar handled by `body` padding).
- `ea` (the same as `e` plus `html{margin-top:46px}` for the admin bar) jumped again: the margin made `documentElement.scrollHeight` 792 against an `innerHeight` of 746, so the root was scrollable by 46px and the browser's toolbar logic came back. That is rule 1.
- Trade-offs of the shell, accepted: Chrome's toolbar no longer collapses on scroll, iOS status-bar tap-to-top and pull-to-refresh may not work, and scripts that watch window scroll (for example GA4 scroll depth, Complianz, OneTap) see no window scroll on mobile.

### 2. Stale visualViewport offset lifted the nav (fixed)

- `visual-viewport-offset.ts` set `--kt-vv-bottom-offset = innerHeight - (visualViewport.height + offsetTop)` and the nav used it as `bottom`. On iOS the two values can disagree by the toolbar height (about 108px) while a page loads or navigates, so the nav sat about 100px above the bottom (about 160px in a fresh-load screenshot while the page was still loading).
- T23 only withheld a non-zero offset for the first 1.5s of a page, so a slow load still applied it. Reproduced in the WebKit emulation by forcing `visualViewport.height` to `innerHeight - 108`: offset 108px and nav bottom 638 before, offset 0 and nav bottom 746 after.
- The offset now applies only while a text field is focused (keyboard) or `visualViewport.scale` is above 1.01 (pinch zoom); otherwise it is 0. It is also recomputed on `visibilitychange`, window `resize`, `orientationchange`, `pageshow`, `focus` and `focusout`, so a value measured while the keyboard was open cannot stay stuck after returning to a tab.

### 3. Half-styled first paint on internal navigation (fixed)

- `main.css` and the block stylesheets are deferred (`media="print"` with `onload`), so a page change could paint with only the critical CSS and reflow when the rest arrived. Measured on `/projekty/` in Chromium emulation: first frame `media=print` and 7521px, next frame 6984px.
- `blocking-stylesheets.ts` promotes the deferred stylesheets only when `document.referrer` is same-origin, so cold entries (search, direct links) keep the deferred loading and its performance. WebKit emulation on the local server showed no shift either way because it is fast.
- The first measurement taken during the investigation (13354px to 10980px) was the home page's own cold load, not a navigation. Do not quote it.

### 4. Double blink on pages with above-the-fold animations (fixed)

- `.fade-*-on-scroll` elements start at `opacity:0`. The 180ms crossfade ran while they were invisible, then the 1s fade-in started: two visible phases.
- `view-transition-reveal.ts` reveals above-the-fold elements before first paint. A naive version still faded from 0 because reading `getBoundingClientRect()` before adding `.visible` forces a style calculation, so the browser sees a change from 0. The reveal sets `transition:none`, adds the class, then measures, and removes the inline style afterwards. Below-the-fold elements keep animating on scroll.

### 5. Nav see-through during transitions (fixed)

- View-transition snapshots do not keep `backdrop-filter`, so the 40% translucent nav showed the page through unblurred on Safari. The blur CSS is already in the critical CSS, so it was not a load-order problem.
- `html.kt-nav-solid` (set at page start and on `pageswap`, removed after `load` or when the transition finishes, 2s cap) gives the nav an opaque background that fades to the glass look in 0.25s. Whether the outgoing snapshot is captured with the class applied is covered by a unit test only.

### 6. Scroll to top left the header hidden (fixed)

- `hide-nav-on-scroll.ts` ignores scroll events during a programmatic scroll, so after scroll-to-top the header stayed hidden while the breadcrumbs, which depend only on scroll position, appeared alone.
- A programmatic scroll that enters the top zone (under 100px) now shows the header and the footer nav, and the breadcrumbs also hide whenever `header.nav-hidden` is set (`body:has(header.nav-hidden)`).

### 7. Cover video rewound after it ended (fixed)

- WebKit rewinds an ended, paused video to an earlier keyframe once it is off screen (about 11.17s of 14.4s). No script touched the video. `cover-video-controls.ts` read the rewind as "still playing" and hid the revealed section.
- The handler now remembers that the video played to the end, keeps the content revealed while it is paused, and seeks back to the final frame. A genuine replay still hides the section again.

## What was tried and dropped

| Attempt | Why it was dropped |
| --- | --- |
| Hide the nav on `pageswap` or on the tap for Chrome iOS, fade back in after the first viewport resize or 160ms | Too late (the old page is frozen), the nav was gone for too long, and the page still jumped |
| Position the nav with `top` from `visualViewport` | Worse on a real iPhone: about 100px gap while the page changes, then a jump |
| `translateZ`, `backdrop-filter`, transition, `overflow-x:clip`, sticky, dock wrapper, `dvh`, viewport meta | No effect, the plain fixed bar jumps too |
| Naming the nav or header for view transitions (T23) | Backdrop root kills the blur and the active item snapped |

## Known limits and open items

- The shell is below `64rem` only; resizing across the breakpoint carries the scroll position, but the pixel position can drift when the content above reflows between widths.
- Keyboard scrolling (Space and PageDown with focus on `body`) does not scroll the container yet; giving `.wp-site-blocks` `tabindex="-1"` and focusing it on the first key press is the obvious fix.
- Check GA4 DebugView for missing scroll events after rollout.
- Pre-existing and unrelated: `tests/e2e/footer.spec.ts` scroll-to-top tests fail on desktop (the elements are not on the page) and `header.spec.ts` still uses `window.scrollTo` in its mobile tests.
- Whether a long-lived tab discarded by iOS reloads with missing graphics was never reproduced. The canvas background (2D, redrawn each frame), the model viewer (three.js handles context loss) and the deferred images were reviewed and look safe.

## How to debug this on a real device

- Record the screen and cut frames with `ffmpeg` to see whether the nav or the browser toolbar moves; analyse per frame, the jump can last only 4 frames.
- Playwright WebKit with the `iPhone 12 Pro Max` descriptor reproduces the stylesheet timing and view transitions, but not the iOS toolbar. Forcing `visualViewport.height` in an init script reproduces the stale offset.
- To isolate a browser bug, serve a tiny multi-page lab over the LAN with one switch per feature (plain fixed bar, each CSS property, shell variants) and click through it fast on the phone; the plain bar jumping is what proved the cause here.
- Check the invariant in Playwright: `document.documentElement.scrollHeight <= innerHeight` at 428x746 on `/`, `/uslugi/`, `/projekty/` and `/kontakt/`, with a simulated admin bar.
