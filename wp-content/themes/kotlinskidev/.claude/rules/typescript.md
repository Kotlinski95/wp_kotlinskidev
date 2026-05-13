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
