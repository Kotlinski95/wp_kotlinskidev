<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/image-hover-overlay.php';

it('leaves content untouched when the overlay is not enabled', function () {
    $content = '<figure class="wp-block-image"><img src="a.jpg"/></figure>';

    expect(kotlinskidev_apply_image_overlay($content, [
        'blockName' => 'core/image',
        'attrs' => ['kotlinskidevOverlayHeading' => 'Hi'],
    ]))->toBe($content);
});

it('leaves content untouched when enabled but heading and description are both empty', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    $content = '<figure class="wp-block-image"><img src="a.jpg"/></figure>';

    expect(kotlinskidev_apply_image_overlay($content, [
        'blockName' => 'core/image',
        'attrs' => ['kotlinskidevOverlayEnabled' => true],
    ]))->toBe($content);
});

it('leaves non-image blocks untouched even when enabled with text set', function () {
    $content = '<figure class="wp-block-image"><img src="a.jpg"/></figure>';

    expect(kotlinskidev_apply_image_overlay($content, [
        'blockName' => 'core/group',
        'attrs' => ['kotlinskidevOverlayEnabled' => true, 'kotlinskidevOverlayHeading' => 'Hi'],
    ]))->toBe($content);
});

it('leaves empty block content untouched', function () {
    expect(kotlinskidev_apply_image_overlay('', [
        'blockName' => 'core/image',
        'attrs' => ['kotlinskidevOverlayEnabled' => true, 'kotlinskidevOverlayHeading' => 'Hi'],
    ]))->toBe('');
});

it('adds the overlay class to the figure and inserts the content before the closing tag', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_apply_image_overlay(
        '<figure class="wp-block-image"><img src="a.jpg"/></figure>',
        [
            'blockName' => 'core/image',
            'attrs' => [
                'kotlinskidevOverlayEnabled' => true,
                'kotlinskidevOverlayHeading' => 'Hello',
                'kotlinskidevOverlayDescription' => 'World',
            ],
        ]
    );

    expect($html)->toContain('class="wp-block-image kt-image-hover-overlay"');
    expect($html)->toContain('<div class="kt-image-hover-overlay__content">');
    expect($html)->toContain('<span class="kt-image-hover-overlay__heading">Hello</span>');
    expect($html)->toContain('<span class="kt-image-hover-overlay__description">World</span>');
    expect($html)->toEndWith('</figure>');
});

it('omits the heading span when only description is set', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_apply_image_overlay(
        '<figure class="wp-block-image"><img src="a.jpg"/></figure>',
        [
            'blockName' => 'core/image',
            'attrs' => [
                'kotlinskidevOverlayEnabled' => true,
                'kotlinskidevOverlayDescription' => 'World',
            ],
        ]
    );

    expect($html)->not->toContain('kt-image-hover-overlay__heading');
    expect($html)->toContain('<span class="kt-image-hover-overlay__description">World</span>');
});

it('omits the description span when only heading is set', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_apply_image_overlay(
        '<figure class="wp-block-image"><img src="a.jpg"/></figure>',
        [
            'blockName' => 'core/image',
            'attrs' => [
                'kotlinskidevOverlayEnabled' => true,
                'kotlinskidevOverlayHeading' => 'Hello',
            ],
        ]
    );

    expect($html)->not->toContain('kt-image-hover-overlay__description');
    expect($html)->toContain('<span class="kt-image-hover-overlay__heading">Hello</span>');
});

it('escapes heading and description text', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('esc_html')->justReturn('&lt;script&gt;');

    $html = kotlinskidev_apply_image_overlay(
        '<figure class="wp-block-image"><img src="a.jpg"/></figure>',
        [
            'blockName' => 'core/image',
            'attrs' => [
                'kotlinskidevOverlayEnabled' => true,
                'kotlinskidevOverlayHeading' => '<script>',
            ],
        ]
    );

    expect($html)->toContain('&lt;script&gt;');
    expect($html)->not->toContain('<script>');
});

it('preserves the figcaption when the image has a caption', function () {
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_apply_image_overlay(
        '<figure class="wp-block-image"><img src="a.jpg"/><figcaption>A caption</figcaption></figure>',
        [
            'blockName' => 'core/image',
            'attrs' => [
                'kotlinskidevOverlayEnabled' => true,
                'kotlinskidevOverlayHeading' => 'Hello',
            ],
        ]
    );

    expect($html)->toContain('<figcaption>A caption</figcaption>');
    expect($html)->toContain('kt-image-hover-overlay__content');
});
