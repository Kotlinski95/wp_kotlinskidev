<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/breakpoints.php';
require_once __DIR__ . '/../../../functions/responsive-width.php';

function kotlinskidev_social_section_render(array $attributes, string $content): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/social-section/render.php',
        $attributes,
        $content
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_attr_e')->alias(fn ($t) => print($t));
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('wp_json_encode')->alias('json_encode');
});

it('renders nothing when there are no inner block items', function () {
    expect(kotlinskidev_social_section_render([], ''))->toBe('');
    expect(kotlinskidev_social_section_render([], '   '))->toBe('');
});

it('renders a nav without a style tag when no icon sizing is configured', function () {
    $html = kotlinskidev_social_section_render([], '<li>Item</li>');

    expect($html)->not->toContain('<style>');
    expect($html)->toContain('class="social-navigation social-menu-container"');
    expect($html)->toContain('<ul class="social-menu-items"><li>Item</li></ul>');
});

it('adds the inline modifier class when attachToBottom is false', function () {
    $html = kotlinskidev_social_section_render(['attachToBottom' => false], '<li>Item</li>');

    expect($html)->toContain('social-menu-container--inline');
});

it('generates scoped css and a unique class when icon width is configured', function () {
    $html = kotlinskidev_social_section_render([
        'iconWidth' => ['desktop' => '24px'],
    ], '<li>Item</li>');

    expect($html)->toMatch('/class="social-navigation social-menu-container kt-social-icons-[a-f0-9]{10}"/');
    expect($html)->toContain('<style>');
    expect($html)->toContain('.kt-social-item--icon a{width:24px;}');
});

it('generates scoped css for the item gap independently of icon sizing', function () {
    $html = kotlinskidev_social_section_render([
        'itemGap' => ['mobile' => '1rem'],
    ], '<li>Item</li>');

    expect($html)->toContain('.social-menu-items{gap:1rem;}');
});
