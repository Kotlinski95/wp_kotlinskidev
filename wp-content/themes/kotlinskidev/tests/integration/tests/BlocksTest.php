<?php

uses(Tests\Integration\TestCase::class);

it('adds the kotlinskidev-navigation block category once and does not duplicate it', function () {
    $categories = kotlinskidev_register_block_categories([['slug' => 'text', 'title' => 'Text']]);
    $slugs = array_column($categories, 'slug');

    expect($slugs)->toContain('kotlinskidev-navigation');
    expect(array_count_values($slugs)['kotlinskidev-navigation'])->toBe(1);

    $again = kotlinskidev_register_block_categories($categories);
    $slugs_again = array_column($again, 'slug');
    expect(array_count_values($slugs_again)['kotlinskidev-navigation'])->toBe(1);
});

it('registers every custom theme block on init', function () {
    $registry = WP_Block_Type_Registry::get_instance();

    foreach (['kotlinskidev/navigation', 'kotlinskidev/button', 'wpe/slider', 'kotlinskidev/popular-pages', 'contact-form-ts/form', 'googlemaps/google-maps-block'] as $name) {
        expect($registry->is_registered($name))->toBeTrue();
    }
});

it('adds the theme navigation item blocks to the listable blocks filter', function () {
    $blocks = kotlinskidev_navigation_listable_blocks(['core/navigation-link']);

    expect($blocks)->toContain('kotlinskidev/social-section');
    expect($blocks)->toContain('kotlinskidev/nav-link');
    expect($blocks)->toContain('core/navigation-link');
});

it('returns an empty icon for a zero attachment id', function () {
    expect(kotlinskidev_inline_nav_icon(0))->toBe('');
});

it('returns an empty icon when the attachment is not an svg', function () {
    $id = self::factory()->attachment->create_object('photo.jpg', 0, ['post_mime_type' => 'image/jpeg']);

    expect(kotlinskidev_inline_nav_icon($id))->toBe('');
});

it('strips the fill attribute and marks a real svg icon as decorative with currentColor', function () {
    $id = self::factory()->attachment->create_object('icon.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000"><path d="M0 0"/></svg>', WEEK_IN_SECONDS);

    $html = kotlinskidev_inline_nav_icon($id);

    expect($html)->toContain('aria-hidden="true"');
    expect($html)->toContain('fill="currentColor"');
    expect($html)->not->toContain('fill="#000000"');

    delete_transient('kotlinskidev_svg_' . $id);
});

it('returns null for the current polylang language when none is marked current', function () {
    expect(kotlinskidev_pll_current_language_data())->toBeNull();
});

it('lists the real container and item block names used for navigation parenting', function () {
    expect(kotlinskidev_navigation_container_blocks())->toContain('kotlinskidev/holder');
    expect(kotlinskidev_navigation_item_blocks())->toContain('kotlinskidev/nav-link');
});

it('assigns the navigation container blocks as valid parents for a navigation item block', function () {
    $args = kotlinskidev_assign_navigation_item_parents([], 'kotlinskidev/nav-link');

    expect($args['parent'])->toBe(kotlinskidev_navigation_container_blocks());
});

it('leaves the block registration args untouched for a non-navigation-item block', function () {
    $args = kotlinskidev_assign_navigation_item_parents(['category' => 'text'], 'core/paragraph');

    expect($args)->toBe(['category' => 'text']);
});
