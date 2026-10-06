# scroll-section block

Horizontal-pan-on-vertical-scroll section. Vertical scroll drives a horizontal `translateX` pan through items via GSAP ScrollTrigger scrub.

## HTML structure

```
<div class="scroll-section" data-scroll-section data-trigger="...">
  <div class="scroll-section__track scrollx-section">   ← translateX target
    <!-- scroll-section/item blocks -->
  </div>
</div>
```

## How the pin works

GSAP pins `.scroll-section` itself (or the nearest ancestor tagged `scroll-section-pin-boundary` — see `src/blocks/scroll-section-pin-boundary/index.tsx`'s Inspector toggle, which lets an editor opt a specific instance into freezing some neighboring content alongside the section too, visible for the whole scrub) with `pinSpacing: true`, GSAP's own default. GSAP computes the spacer's reserved scroll distance once, from the pinned element's own natural height plus the horizontal overflow distance — no manual height tracking, no per-frame reconciliation loop. `end: () => "+=" + distance()` (where `distance()` is `track.scrollWidth - track.clientWidth`) defines how far scroll must travel before the pin releases.

**Never set `el.style.height` or any explicit height on `.scroll-section`.** Its height must stay its natural content height; GSAP's own spacer handles the scroll budget.

## GSAP ScrollTrigger constraints

- `ease: "none"` on the tween — mandatory. Any easing breaks the 1:1 scroll-to-position alignment.
- `scrub: true` on the tween — ties progress directly to scroll.
- `invalidateOnRefresh: true` — recalculates the tween's `x`/`end` on `ScrollTrigger.refresh()`.
- `markers: true` only when `data-markers="true"` (the block's "Show markers" toggle) — stays off by default, dev-only.

## Full-width ancestor gotcha

A `.scroll-section` (or its pin-boundary wrapper) nested inside any `.full-width` block (e.g. a `core/cover`) needs that ancestor's `kt-full-bleed-breakout` mixin transform stripped — a static, always-present `transform: translateX(-50%)` on an ancestor makes it the containing block for `position: fixed`, breaking GSAP's native, compositor-driven pin (confirmed live: it silently fell back to a JS-driven transform-based pin, visibly less smooth under real scroll input). `style.scss`'s `.full-width:has(.scroll-section)` rule fixes this at the source, swapping that ancestor to the same margin-based breakout `.scroll-section.full-width` already uses.

That override rule needs `!important` on every property (position/left/transform/margin-left) — confirmed live: when the full-width ancestor is a _direct child_ of a WordPress `.is-layout-constrained` group, core's own `.is-layout-constrained > :where(...) { margin-left: auto !important; }` always wins over a non-`!important` declaration regardless of specificity, leaving the ancestor full-width but shifted right by its container's own offset (clipped left edge, background short of true edge-to-edge). Matches `kt-full-bleed-breakout`'s own established `!important` on `max-width` for the identical reason.

Don't force `pinType: "transform"` as a shortcut around a transformed ancestor instead of fixing the ancestor — it's JS-driven every single frame rather than compositor-native, and visibly jankier under real scroll input (both confirmed live).
