---
agent: 'agent'
description: 'TypeScript and SCSS specific rules for the kotlinskidev theme'
---

Apply these TypeScript and SCSS rules to the selected code:

**TypeScript — Theme Scripts (`src/scripts/`)**

Architecture:
- Each script is an IIFE `(() => { ... })()` or ES module — no global scope pollution
- Event listeners must always have a corresponding cleanup/removal
- Use `MutationObserver` for watching DOM changes — no polling
- `requestAnimationFrame` for visual/animation updates
- Prefer `querySelector`/`querySelectorAll` with explicit type parameters: `querySelector<HTMLElement>`

Patterns:
- Initialise only after `DOMContentLoaded` or check `document.readyState`
- Guard all DOM queries: `if (!element) return`
- Debounce scroll/resize handlers
- Use `passive: true` on scroll/touch listeners unless `preventDefault()` is needed

Types:
- No `any` — use proper DOM types (`HTMLElement`, `MouseEvent`, `TouchEvent`, etc.)
- Define interfaces for data structures
- Use `as Type` casts only when narrowing is certain

**SCSS — Theme Styles (`src/styles/`)**

Variables (from `_variables.scss`):
- All colors via `var(--wp--preset--color--*)` or SCSS vars
- All breakpoints via `$breakpoint-desktop`, `$breakpoint-tablet`, etc.
- Font sizes via WP preset variables where possible

Structure:
- Each component in its own partial `_component-name.scss`
- Imported in correct order in main file
- Dark/light mode via `.dark-mode` / `.light-mode` parent classes

Responsive:
- Mobile-first — base styles for mobile, `@media (min-width: $breakpoint-*)` for larger
- Never use `max-width` breakpoints unless overriding third-party styles

Animations:
- Respect `prefers-reduced-motion`:
```scss
@media (prefers-reduced-motion: reduce) {
  // disable animations
}
```
- Use CSS custom properties for animation values to allow JS control

Apply all applicable rules and list changes made.
