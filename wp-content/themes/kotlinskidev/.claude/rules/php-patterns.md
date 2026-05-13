---
paths: ["patterns/*.php"]
description: Rules for WordPress block pattern PHP files
---

## Pattern Header
Every file must open with the required registration comment block:
```php
<?php
/**
 * Title: {Human readable title}
 * Slug: kotlinskidev/{slug}
 * Categories: {comma-separated category slugs}
 */
```

## Dynamic Values
- Store asset URLs in a local variable at the top: `$kotlinskidev_url = trailingslashit(get_template_directory_uri());`
- Group related image/asset paths into a named array before the markup.
- Always output URLs with `esc_url()`.

## i18n
- Every user-visible string must use `esc_html_e('...', 'kotlinskidev')` for echoed text or `esc_html__('...', 'kotlinskidev')` inside PHP expressions.
- No hardcoded language strings in the markup.

## No Comments
Do not add PHP or HTML comments beyond the required registration block. Block structure is self-documenting.

## Block Markup
- Use only theme.json design tokens — never hardcode hex colours or pixel values outside of one-off layout constraints.
- Prefer `var:preset|color|{slug}` and `var:preset|spacing|{slug}` over raw CSS values.
- Every `<!-- wp:{block} -->` opener must have a matching `<!-- /wp:{block} -->` closer.
- Validate markup in the block editor before committing — broken JSON attributes silently produce invalid blocks.

## Reusability
- Patterns must be self-contained. No pattern should depend on another pattern being present on the page.
- Avoid hardcoding post IDs, attachment IDs, or site-specific URLs in the markup.

## Performance
- Use `loading="lazy"` on images not above the fold.
- Prefer WebP sources (`assets/images/*.webp`) over JPEG/PNG.
- Do not reference external CDN assets — use locally hosted files only.
