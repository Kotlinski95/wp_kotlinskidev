<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/svg-support.php';
require_once __DIR__ . '/../../../functions/blocks.php';

function kotlinskidev_icon_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/icon/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(function ($extra = []) {
        $attrs = 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"';
        foreach ($extra as $key => $value) {
            if (in_array($key, ['class', 'style'], true)) {
                continue;
            }
            $attrs .= ' ' . $key . '="' . $value . '"';
        }
        return $attrs;
    });
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
});

it('renders nothing when mediaId is missing', function () {
    $html = kotlinskidev_icon_render([]);

    expect($html)->toBe('');
});

it('renders nothing when the attachment is not an svg', function () {
    Functions\when('get_post_mime_type')->justReturn('image/png');

    $html = kotlinskidev_icon_render(['mediaId' => 5]);

    expect($html)->toBe('');
});

it('renders the sanitized inline svg with the default decorative attributes when no aria label is set', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M0 0"/></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5]);

    expect($html)->toContain('<svg aria-hidden="true" focusable="false" fill="currentColor"');
    expect($html)->not->toContain('role="img"');
    expect($html)->toContain('class="kt-icon"');
});

it('emits the size and color as css custom properties', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5, 'size' => '2rem', 'color' => '#ff0000']);

    expect($html)->toContain('--kt-icon-size: 2rem;');
    expect($html)->toContain('color: #ff0000;');
});

it('omits the style attribute content when size and color are both unset', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5]);

    expect($html)->not->toContain('--kt-icon-size');
    expect($html)->not->toContain('color:');
});

it('adds the gradient class and omits the color style when useGradient is enabled', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5, 'color' => '#ff0000', 'useGradient' => true]);

    expect($html)->toContain('class="kt-icon kt-icon--gradient"');
    expect($html)->not->toContain('color:');
});

it('keeps the plain color style and no gradient class when useGradient is disabled', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5, 'color' => '#ff0000', 'useGradient' => false]);

    expect($html)->toContain('class="kt-icon"');
    expect($html)->not->toContain('kt-icon--gradient');
    expect($html)->toContain('color: #ff0000;');
});

it('does not add the tooltip when showTooltip is enabled but there is no aria label', function () {
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    $html = kotlinskidev_icon_render(['mediaId' => 5, 'showTooltip' => true]);

    expect($html)->toContain('class="kt-icon"');
    expect($html)->not->toContain('kt-tooltip');
});
