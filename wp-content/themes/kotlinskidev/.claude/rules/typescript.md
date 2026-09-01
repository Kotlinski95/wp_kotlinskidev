---
paths: ["src/**/*.ts", "src/**/*.tsx"]
description: Rules for TypeScript and React block source files
---

## Strict TypeScript
- Strict mode is enabled — never use `any`. Use `unknown` and narrow explicitly.
- Define explicit interfaces for block attributes, WordPress API responses, and component props.
- Prefer `type` for unions/intersections, `interface` for object shapes that may be extended.

## No Comments
Do not add inline or block comments. Types and function signatures must be self-documenting.

## React & Block Editor
- Block `edit.tsx`: use React state and hooks only — no direct DOM manipulation.
- Block `save.tsx`: must be pure and deterministic — no hooks, no side effects.
- Import WordPress packages from `@wordpress/*` — never from `react` directly for block editor primitives.
- All user-facing strings must pass through `__()` from `@wordpress/i18n` with text domain `'kotlinskidev'`.

## Dual-Value Editor Controls (Color/Gradient, etc.)
- `__experimentalColorGradientControl` (and similar dual-mode WP core controls) can fire the *other* value's `onChange(undefined)` immediately after the one the user actually picked, in the same synchronous tick (e.g. picking a gradient also fires `onColorChange(undefined)` right after `onGradientChange(value)`) — confirmed by instrumenting both callbacks with `console.log`, not assumed. A handler that unconditionally clears the other attribute breaks: it undoes the just-set value. Guard the clear on the actual new value being truthy, not on the callback simply firing.
- Because both callbacks are bound in the same render, they close over the same pre-click `attributes` — the second call in that tick doesn't see what the first call just wrote to the store. Track the freshest value in a `useRef` that both handlers mutate synchronously (write-through, not just read), and read the ref instead of `attributes` inside these handlers. A `useEffect`-only ref (updated after render) is too late for this — it must be written inline during the handler call itself.
- Before assuming `supports.color.text`/`supports.color.background` needs to be explicitly `true` to detect support, check the installed WP core version's actual `hasTextColorSupport`/`hasBackgroundColorSupport` (`wp-includes/js/dist/block-editor.js`, search `hasColorSupport`) — current Gutenberg treats these as **enabled by default whenever `supports.color` exists, unless explicitly `false`** (`colorSupport.text !== false`), not an opt-in `=== true` model. Getting the polarity backwards silently no-ops the attribute registration for every core block that doesn't happen to declare the key explicitly (which is most of them).
- To add a row to `InspectorControls group="color"` that looks and behaves like core's own "Text"/"Background" rows (collapsed swatch button opening a Color/Gradient popover, not an always-expanded control), use `@wordpress/block-editor`'s `__experimentalPanelColorGradientSettings` — the exact component core itself renders those rows with. Do **not** reach for the lower-level `__experimentalColorGradientSettingsDropdown` directly: it unconditionally wraps every row in `ToolsPanelItem`, which needs a `ToolsPanel` ancestor to render at all and silently renders nothing without one (confirmed by instrumenting — no console error, the row just vanishes). `PanelColorGradientSettings` provides that `ToolsPanel` context itself; pass `showTitle={false}` if the `settings` array's own per-row `label` already says what's needed, to avoid a redundant heading.
- Any content Fill'd into `InspectorControls group="color"` — including a `PanelColorGradientSettings` wrapper, not just a bare control — lands in the same 2-column CSS grid as core's native Text/Background rows (`.color-block-support-panel__inner-wrapper`) and needs its own `grid-column: span 2` wrapper to go full-width; without it, both the always-expanded control *and* the collapsed native-style row default to a single half-width column.

## SOLID in Blocks
- **Single Responsibility:** one component per file; keep editor UI, save markup, and utilities in separate files.
- **Open/Closed:** extend block behaviour via `supports` in `block.json` and `BlockControls` / `InspectorControls` — don't modify core block behaviour directly.
- **Dependency Inversion:** accept settings/callbacks as props rather than importing global state inside components.

## Performance
- Use `useMemo` / `useCallback` only when there is a measurable render cost — not by default.
- Lazy-load heavy dependencies (e.g. Swiper) with dynamic `import()` in frontend scripts, not in editor components.
- Keep editor (`edit.tsx`) and frontend (`index.ts`) bundles separate — never import frontend-only code into the editor entry.

## Naming
- Components: `PascalCase`.
- Hooks: `use` prefix, camelCase.
- Event handlers: `on` prefix (`onSelect`, `onChange`).
- Block attribute interfaces: `{BlockName}Attributes`.

## Imports
- Use the `@utils` path alias for shared utilities.
- Group imports: WordPress packages → external libraries → local modules → styles.
- No default exports from utility files — use named exports.
