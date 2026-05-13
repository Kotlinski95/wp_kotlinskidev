---
paths: ["functions/*.php", "includes/*.php"]
description: Rules for WordPress theme PHP function modules
---

## Single Responsibility
Each file owns exactly one feature concern. New features get a new file — never extend an existing module with unrelated logic.

## Naming
All functions must be prefixed `kotlinskidev_` to avoid collisions with plugins or WordPress core.

## No Comments
Do not add inline or block comments. Names must be self-explanatory. If logic requires explanation, refactor it.

## Hooks
- Place `add_action` / `add_filter` calls at file scope, not inside other functions.
- Always use named callbacks — never anonymous functions — so hooks stay removable via `remove_action` / `remove_filter`.
- Declare priority and `$accepted_args` explicitly when they differ from defaults.

## Output Escaping
- Escape at the point of output: `esc_html__()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`.
- Use `absint()` for numeric IDs.
- Never echo raw superglobals or unescaped `get_option()` / `get_post_meta()` values.

## Translations
- Wrap every user-facing string with `__()` or `esc_html__()` using text domain `'kotlinskidev'`.
- Use `sprintf()` with placeholders — never concatenate translated strings.

## Caching
- Use `get_transient()` / `set_transient()` for any database or remote reads.
- Namespace all transient keys: `kotlinskidev_{descriptor}`.

## Performance
- No database queries inside loops — fetch in bulk, then iterate.
- Conditionally enqueue assets (`is_singular()`, block asset dependencies) — never unconditionally.

## WordPress Standards
- Strict comparisons only (`===`, `!==`).
- Never use `extract()`.
- Gate privileged actions with `current_user_can()`.
