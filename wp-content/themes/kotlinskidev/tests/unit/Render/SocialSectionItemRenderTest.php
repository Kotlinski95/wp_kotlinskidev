<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/svg-support.php';
require_once __DIR__ . '/../../../functions/blocks.php';

function kotlinskidev_social_section_item_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/social-section/item/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('sanitize_html_class')->alias(fn ($t) => $t);
    Functions\when('get_transient')->justReturn('');
});

it('renders nothing when there is no url', function () {
    expect(kotlinskidev_social_section_item_render(['url' => '', 'label' => 'X']))->toBe('');
});

it('renders a plain label link with only the menu-item class when there is no icon signal', function () {
    $html = kotlinskidev_social_section_item_render(['url' => 'https://example.test', 'label' => 'My Site']);

    expect($html)->toContain('class="menu-item"');
    expect($html)->toContain('href="https://example.test"');
    expect($html)->toContain('My Site');
    expect($html)->not->toContain('kt-social-item__label');
    expect($html)->not->toContain('kt-social-item--icon');
});

it('does not add the icon class for a known social domain without a custom icon or SVG', function () {
    $html = kotlinskidev_social_section_item_render(['url' => 'https://facebook.com/me', 'label' => 'Facebook']);

    expect($html)->not->toContain('kt-social-item--icon');
    expect($html)->not->toContain('kt-social-item--svg');
});

it('adds a sanitized custom icon class alongside the icon marker class', function () {
    $html = kotlinskidev_social_section_item_render([
        'url' => 'https://example.test',
        'label' => 'X',
        'iconClass' => 'icon-custom',
    ]);

    expect($html)->toContain('class="menu-item icon-custom kt-social-item--icon"');
});

it('opens the link in a new tab with noopener/noreferrer', function () {
    $html = kotlinskidev_social_section_item_render(['url' => 'https://example.test', 'label' => 'X']);

    expect($html)->toContain('target="_blank" rel="noopener noreferrer"');
});

it('wraps the label in a span and includes the icon svg when an svg icon is set', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_social_section_item_render([
        'url' => 'https://example.test',
        'label' => 'GitHub',
        'navIconId' => 5,
    ]);

    expect($html)->toContain('kt-social-item--svg');
    expect($html)->toContain('<svg aria-hidden="true"');
    expect($html)->toContain('<span class="kt-social-item__label">GitHub</span>');
});

it('adds a hover tooltip with the label when an svg icon is set', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_social_section_item_render([
        'url' => 'https://example.test',
        'label' => 'GitHub',
        'navIconId' => 5,
    ]);

    expect($html)->toContain('class="kt-tooltip" data-tooltip="GitHub"');
});

it('omits the tooltip when there is no svg icon', function () {
    $html = kotlinskidev_social_section_item_render(['url' => 'https://example.test', 'label' => 'X']);

    expect($html)->not->toContain('kt-tooltip');
    expect($html)->not->toContain('data-tooltip');
});
