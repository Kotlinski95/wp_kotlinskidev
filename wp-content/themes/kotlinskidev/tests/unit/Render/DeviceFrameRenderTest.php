<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/above-fold-media.php';

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
    Functions\when('wp_high_priority_element_flag')->justReturn(true);
    Functions\when('wp_increase_content_media_count')->justReturn(1);
    Functions\when('wp_omit_loading_attr_threshold')->justReturn(3);
    Functions\when('wp_get_attachment_image_url')->justReturn('frame.jpg');
    kotlinskidev_reset_above_fold_state();
    Functions\when('get_post_mime_type')->justReturn('image/webp');
    Functions\when('wp_get_attachment_metadata')->justReturn(false);
    Functions\when('wp_get_attachment_image')->alias(
        fn ($id, $size, $icon, $attr) => '<img data-style="' . ($attr['style'] ?? '') . '" data-loading="' . $attr['loading'] . '" data-priority="' . $attr['fetchpriority'] . '">'
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

it('renders lazily with auto priority by default', function () {
    $html = kotlinskidev_device_frame_render(['imageId' => 42]);

    expect($html)->toContain('data-loading="lazy"');
    expect($html)->toContain('data-priority="auto"');
});

it('renders eagerly with high priority and claims the slot when flagged above the fold', function () {
    $html = kotlinskidev_device_frame_render(['imageId' => 42, 'kotlinskidevAboveFold' => true]);

    expect($html)->toContain('data-loading="eager"');
    expect($html)->toContain('data-priority="high"');

    ob_start();
    kotlinskidev_print_lcp_preload();
    expect(ob_get_clean())->toContain('href="frame.jpg"');
});

it('renders a second flagged frame eagerly without high priority', function () {
    kotlinskidev_device_frame_render(['imageId' => 42, 'kotlinskidevAboveFold' => true]);

    $html = kotlinskidev_device_frame_render(['imageId' => 43, 'kotlinskidevAboveFold' => true]);

    expect($html)->toContain('data-loading="eager"');
    expect($html)->toContain('data-priority="auto"');
});

it('treats legacy eager loading content as above the fold', function () {
    $html = kotlinskidev_device_frame_render(['imageId' => 42, 'loading' => 'eager']);

    expect($html)->toContain('data-loading="eager"');
    expect($html)->toContain('data-priority="high"');
});

it('lets an explicit false toggle override legacy eager loading', function () {
    $html = kotlinskidev_device_frame_render(['imageId' => 42, 'loading' => 'eager', 'kotlinskidevAboveFold' => false]);

    expect($html)->toContain('data-loading="lazy"');
});

it('prints the lazy video poster as data-poster without a poster attribute', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(7);
    Functions\when('wp_get_attachment_url')->justReturn('clip.mp4');

    $html = kotlinskidev_device_frame_render(['imageId' => 42]);

    expect($html)->toContain('data-poster="frame.jpg"');
    expect($html)->not->toMatch('/\sposter=/');
    expect($html)->toContain('data-src="clip.mp4"');
});

it('keeps poster and src on the above-fold video', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(7);
    Functions\when('wp_get_attachment_url')->justReturn('clip.mp4');

    $html = kotlinskidev_device_frame_render(['imageId' => 42, 'kotlinskidevAboveFold' => true]);

    expect($html)->toContain('poster="frame.jpg"');
    expect($html)->not->toContain('data-poster');
    expect($html)->toContain('src="clip.mp4"');
});

it('prints video width and height from attachment metadata', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(0);
    Functions\when('wp_get_attachment_url')->justReturn('v.mp4');
    Functions\when('wp_get_attachment_metadata')->justReturn(['width' => 1280, 'height' => 720]);

    $html = kotlinskidev_device_frame_render(['imageId' => 5]);

    expect($html)->toContain('width="1280" height="720"');
});

it('omits video dimensions when metadata is missing', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(0);
    Functions\when('wp_get_attachment_url')->justReturn('v.mp4');
    Functions\when('wp_get_attachment_metadata')->justReturn(false);

    $html = kotlinskidev_device_frame_render(['imageId' => 5]);

    expect($html)->not->toContain('width="');
});
