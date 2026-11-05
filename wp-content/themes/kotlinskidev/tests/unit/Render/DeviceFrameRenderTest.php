<?php

use Brain\Monkey\Functions;

function kotlinskidev_device_frame_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/device-frame/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="kt-device-frame"');
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('absint')->alias(fn ($t) => (int) $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/webp');
    Functions\when('wp_get_attachment_image')->alias(
        fn ($id, $size, $icon, $attr) => '<img data-style="' . ($attr['style'] ?? '') . '">'
    );
});

it('passes a valid object-position value through as an inline style', function () {
    $html = kotlinskidev_device_frame_render([
        'imageId' => 42,
        'objectPosition' => '30% 70%',
    ]);

    expect($html)->toContain('object-position:30% 70%;');
});

it('drops a malformed object-position value', function () {
    $html = kotlinskidev_device_frame_render([
        'imageId' => 42,
        'objectPosition' => 'center top',
    ]);

    expect($html)->not->toContain('object-position');
});

it('omits object-position entirely when unset', function () {
    $html = kotlinskidev_device_frame_render([
        'imageId' => 42,
    ]);

    expect($html)->not->toContain('object-position');
});
