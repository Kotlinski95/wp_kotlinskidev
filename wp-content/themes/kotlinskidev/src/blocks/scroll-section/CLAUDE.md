# scroll-section block

Horizontal-pan-on-vertical-scroll section. Vertical scroll drives a horizontal `translateX` pan through items via GSAP ScrollTrigger scrub.

## HTML structure

```
<div class="scroll-section" data-scroll-section data-trigger="...">   ← outer: height set by JS
  <div class="scroll-section__sticky">                                  ← position: sticky; top: 0
    <div class="scroll-section__track">                                 ← translateX target
      <!-- scroll-section/item blocks -->
    </div>
  </div>
</div>
```

## How the scroll lock works

CSS `position: sticky; top: 0` on `.scroll-section__sticky` is the lock mechanism — pure CSS, zero JS.  
When the sticky element reaches `top: 0` it pins to the viewport. The outer `.scroll-section` absorbs the vertical scroll distance while the sticky child stays visible. To the user it looks like scrolling has stopped at the section.

**CSS sticky is NOT useless here.** It handles the visual lock. What it cannot do is set its own container height — that depends on the track content.

## Height rule — non-negotiable

**Never set `el.style.height` or any explicit height on `.scroll-section`.** The component height must equal its natural content height at all times. No JS height writes, no `min-height` overrides, no padding tricks.

The scroll budget is provided by `pin: true, pinSpacing: false`. GSAP pins the element without inserting a spacer at the component level. The page content below the section provides the scrollable distance needed to travel through the horizontal overflow. `end: () => "+=${getOverflow()}"` defines how far scroll must travel before the pin releases.

## GSAP ScrollTrigger constraints

- `ease: "none"` on the tween — mandatory. Any easing breaks the 1:1 scroll-to-position alignment.
- `scrub: 1` — smoothed feel. Do not use `scrub: true` (raw, jittery on fast scroll).
- `invalidateOnRefresh: true` — recalculates tween end value on ScrollTrigger.refresh().
- `markers: true` stays on throughout development. Remove only in final cleanup.

## Touch / mobile

`ScrollTrigger.normalizeScroll(true)` is enabled when `ScrollTrigger.isTouch` is true. Same behavior as desktop — no separate mobile path.

## Development sequence

1. Register ScrollTrigger, attach marker-only trigger to verify targeting — **done**
2. Add JS height calculation (`track.scrollWidth - window.innerWidth`) and write to `el.style.height`
3. Add horizontal tween (`gsap.to(track, { x: -overflow, ease: "none" })`) wired to the trigger
4. Add `ResizeObserver` + `invalidateOnRefresh` for resize handling
5. Add touch normalization
6. Write unit tests (Jest/jsdom) for `initScrollSection` logic
7. Write E2E tests (Playwright) for full scroll behavior
8. Remove `markers: true`
