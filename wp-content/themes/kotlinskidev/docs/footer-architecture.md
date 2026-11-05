# Footer Architecture

The footer is a single template part (`parts/footer.html`), the same across every language — no per-language template forks. Every section resolves its own translated content independently via Polylang.

## Structure

```text
parts/footer.html
  wp:group (.kotlinskidev-footer)
    wp:group (.kotlinskidev-footer__top — flex row: brand + nav columns)
      wp:kotlinskidev/content-block (contentSlug: "footer-brand")   → brand column
      wp:kotlinskidev/navigation (menuSlug: "footer", displayMode: "list")  → link columns
    wp:kotlinskidev/copyrights
    wp:kotlinskidev/scroll-to-top
    wp:kotlinskidev/navigation (menuSlug: "mobile-footer", displayMode: "bar")  → mobile bottom bar
```

## Brand column — `kotlinskidev/content-block`

The logo, description, and social links live in a **Reusable Block** (`wp_block` post, slug `footer-brand`), not inside the navigation menu — `wp_block` is registered as a Polylang-translatable post type (`functions/polylang-content-resolution.php`), the same mechanism already used for `wp_navigation`. `kotlinskidev/content-block` resolves a reusable block by slug via `kotlinskidev_resolve_translatable_post($slug, 'wp_block')` and runs `do_blocks()` on its content — editors get a normal Site Editor UI for the brand content, translated per language, with no template duplication.

## Link columns — `kotlinskidev/navigation`, `displayMode: "list"`

The footer's `wp_navigation` post (slug `footer`) holds one `kotlinskidev/simple-grid` with 3 `kotlinskidev/holder` children (Pages / Services / Contact). Each holder contains a real `core/heading` (independently stylable — font size, color, etc. via the normal block Typography panel) followed by a `core/list` of links, or — for the Contact holder — address/hours/email/phone content. `simple-grid`'s column count derives from its holder count automatically; `tabletColumns`/`mobileColumns` attributes give it 3 independent breakpoint tiers (desktop/tablet/mobile).

`kotlinskidev/navigation`'s `list` and `bar` display modes both have a generic top-level pass-through for any block type they don't specifically recognize (mirroring what `mega` mode already did via `kotlinskidev_render_nav_extras()`), so a bare block placed directly in a nav post still renders instead of being silently dropped.

## Contact info protection

The address, email, and phone in the Contact holder are protected from bot scraping two ways:

- **Address**: an explicit `kotlinskidev/protected-content` block (`protectionType: "address"`), RSA-encrypted server-side, revealed on click.
- **Email/phone**: auto-detected and encrypted by `kotlinskidev_add_protection_to_content()` (`functions/protection-helpers.php`), which hooks `render_block_kotlinskidev/navigation` among other filters — so any `mailto:`/`tel:` link or plain-text email/phone rendered through the footer's navigation block is protected automatically, with no per-instance setup needed.

## Mobile footer bar

`kotlinskidev/navigation` with `menuSlug: "mobile-footer"` and `displayMode: "bar"` renders a fixed bottom navigation bar on mobile viewports, resolving the `mobile-footer` `wp_navigation` post (translated the same way as `footer`). Plain Custom Link items only, each with an optional icon.

## Layout CSS

`.kotlinskidev-footer__top` is a flex row (`.kotlinskidev-footer__brand` at `flex: 0 1 23.75rem`, narrowed to `17.5rem` on tablet; `.kotlinskidev-footer__nav` at `flex: 1`), stacking to a single column below the mobile breakpoint. Direct children get `margin-left/right: 0 !important` to cancel WordPress's own constrained-layout auto-margin injection, which otherwise fights `align-items: stretch` once the layout drops to a single column.

## Content protection settings

Auto-protection is controlled at **Settings → Content Protection** (`kotlinskidev_auto_protect_emails` / `kotlinskidev_auto_protect_phones` options) — both enabled by default on this site.
