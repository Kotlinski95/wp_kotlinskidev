---
agent: 'agent'
description: 'Enforce project code style and formatting rules'
---

Audit the selected code or file against these project style rules and fix any violations:

**General**
- No inline comments unless explaining non-obvious complex logic
- Self-explanatory naming over comments — rename if needed
- No `console.log` left in production code
- Arrow functions for all callbacks and module-level functions
- `async/await` only — no `.then()` chains

**TypeScript**
- Strict mode enforced — no implicit `any`
- Explicit return types on all exported functions
- Interfaces over `type` aliases for object shapes
- No non-null assertions (`!`) — use proper null checks or optional chaining
- Prefer `const` over `let`, never `var`
- Destructuring where it improves readability
- Named exports over default exports

**SCSS**
- All values should reference variables from `_variables.scss` where possible
- Use `rem` units — no `px` except for fine details (borders, shadows)
- BEM-adjacent naming for custom classes
- Mobile-first with `min-width` breakpoints using `$breakpoint-*` variables
- No bare element selectors (e.g. `div`, `span`) — use classes
- Max nesting depth: 3 levels

**File Structure**
- One responsibility per file
- Scripts in `src/scripts/`, styles in `src/styles/`
- SCSS partials prefixed with `_`

Apply fixes directly. List what was changed and why.
