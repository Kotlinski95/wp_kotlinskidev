<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/blocks.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($t) => $t);
});

it('adds the navigation block category when it is not already registered', function () {
    $categories = kotlinskidev_register_block_categories([
        ['slug' => 'text', 'title' => 'Text'],
    ]);

    expect($categories)->toHaveCount(2);
    expect($categories[1])->toBe(['slug' => 'kotlinskidev-navigation', 'title' => 'Navigation', 'icon' => 'menu']);
});

it('does not duplicate the navigation block category if already registered', function () {
    $categories = [
        ['slug' => 'kotlinskidev-navigation', 'title' => 'Navigation', 'icon' => 'menu'],
    ];

    expect(kotlinskidev_register_block_categories($categories))->toBe($categories);
});

it('appends the navigation-listable blocks to the existing list', function () {
    $result = kotlinskidev_navigation_listable_blocks(['core/navigation-link']);

    expect($result)->toBe([
        'core/navigation-link',
        'kotlinskidev/social-section',
        'kotlinskidev/nav-link',
        'kotlinskidev/button',
        'kotlinskidev/nav-search-panel',
        'kotlinskidev/nav-language-panel',
        'kotlinskidev/nav-popular-pages',
        'kotlinskidev/nav-image',
        'kotlinskidev/nav-banner',
        'kotlinskidev/nav-paragraph',
    ]);
});

it('returns an empty string for an id of zero', function () {
    expect(kotlinskidev_inline_nav_icon(0))->toBe('');
});

it('returns an empty string when the attachment is not an svg', function () {
    Functions\when('get_post_mime_type')->justReturn('image/png');

    expect(kotlinskidev_inline_nav_icon(5))->toBe('');
});

it('returns an empty string when the svg content cannot be loaded', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('');

    expect(kotlinskidev_inline_nav_icon(5))->toBe('');
});

it('strips existing fill attributes and injects accessible svg attributes', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn(
        '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M0 0"/></svg>'
    );

    $result = kotlinskidev_inline_nav_icon(5);

    expect($result)->not->toContain('fill="#000"');
    expect($result)->toContain('<svg aria-hidden="true" focusable="false" fill="currentColor"');
});

it('returns null current-language data when polylang is not active', function () {
    expect(kotlinskidev_pll_current_language_data())->toBeNull();
});

it('lists the fixed navigation container block types', function () {
    expect(kotlinskidev_navigation_container_blocks())->toBe([
        'core/navigation',
        'core/navigation-submenu',
        'kotlinskidev/holder',
        'kotlinskidev/search-panel',
        'kotlinskidev/nav-search-panel',
        'kotlinskidev/language-panel',
        'kotlinskidev/nav-language-panel',
    ]);
});

it('lists the fixed navigation item block types', function () {
    expect(kotlinskidev_navigation_item_blocks())->toContain('kotlinskidev/button');
    expect(kotlinskidev_navigation_item_blocks())->toContain('polylang/navigation-language-switcher');
});

it('assigns the navigation container parents to a navigation item block type', function () {
    $args = kotlinskidev_assign_navigation_item_parents([], 'kotlinskidev/nav-link');

    expect($args['parent'])->toBe(kotlinskidev_navigation_container_blocks());
});

it('leaves args untouched for a block type that is not a navigation item', function () {
    $args = ['existing' => true];

    expect(kotlinskidev_assign_navigation_item_parents($args, 'core/paragraph'))->toBe($args);
});
