---
agent: 'agent'
description: 'WordPress-specific development rules and PHP best practices'
---

When working on WordPress/PHP code in this project, enforce the following:

**PHP Standards**
- Follow WordPress Coding Standards (WPCS)
- Use tabs for indentation in PHP files
- Yoda conditions: `if ( 'value' === $variable )`
- Always sanitize input: `sanitize_text_field()`, `absint()`, `wp_kses_post()`
- Always escape output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses()`
- Use nonces for all form submissions: `wp_nonce_field()` / `check_admin_referer()`

**Enqueuing**
- Always use `wp_enqueue_script()` / `wp_enqueue_style()` — never hardcode `<script>` or `<link>` tags
- Set proper dependencies array
- Use `wp_localize_script()` to pass PHP data to JS

**Theme Functions**
- All functions prefixed with `kotlinskidev_` to avoid conflicts
- Hook into appropriate actions/filters (`after_setup_theme`, `wp_enqueue_scripts`, etc.)
- Use `get_template_part()` for template partials
- Child-theme safe: use `get_template_directory_uri()` not hardcoded paths

**Database**
- Never write raw SQL — use `$wpdb->prepare()` if unavoidable
- Prefer WP_Query, WP_User_Query over raw queries
- Use `get_option()` / `update_option()` for settings

**Admin Panel**
- All custom settings should be manageable from WP admin
- Use Settings API for options pages
- Use `add_meta_box()` for post meta

**Block Editor**
- Register blocks with `register_block_type()`
- Use `block.json` for block metadata
- Server-side rendering via `render_callback` where dynamic content needed

Identify issues, apply fixes, and explain any WordPress-specific reasoning.
