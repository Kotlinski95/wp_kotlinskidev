<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/above-fold-media.php';
require_once __DIR__ . '/../../../functions/breakpoints.php';
require_once __DIR__ . '/../../../functions/responsive-media.php';

function kotlinskidev_device_frame_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/device-frame/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_option')->alias(static fn ($name, $default = null) => $default);
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
    expect($html)->not->toContain('data-poster="');
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

it('defaults the lazy video mobile poster to medium_large when no mobile slot is set', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(7);
    Functions\when('wp_get_attachment_url')->justReturn('clip.mp4');
    Functions\when('wp_get_attachment_image_url')->alias(fn ($id, $size) => 'medium_large' === $size ? 'poster-medium.jpg' : 'poster-full.jpg');

    $html = kotlinskidev_device_frame_render(['imageId' => 42]);

    expect($html)->toContain('data-poster="poster-full.jpg"');
    expect($html)->toContain('data-kt-poster-mobile="poster-medium.jpg"');
    expect($html)->not->toContain('data-poster-mobile');
    expect($html)->not->toContain('data-kt-poster-tablet');
});

it('uses the mobile slot video and poster instead of the medium_large default', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(7);
    Functions\when('wp_get_attachment_url')->justReturn('clip.mp4');
    Functions\when('wp_get_attachment_image_url')->alias(fn ($id, $size) => 'medium_large' === $size ? 'poster-medium.jpg' : 'poster-full.jpg');

    $html = kotlinskidev_device_frame_render([
        'imageId'         => 42,
        'responsiveMedia' => ['mobile' => ['id' => 9, 'url' => 'clip-m.mp4', 'type' => 'video', 'posterUrl' => 'poster-m.jpg']],
    ]);

    expect($html)->toContain('data-src="clip.mp4"');
    expect($html)->toContain('data-kt-src-mobile="clip-m.mp4"');
    expect($html)->toContain('data-kt-poster-mobile="poster-m.jpg"');
    expect($html)->not->toContain('poster-medium.jpg');
});

it('moves an above-fold video with a mobile variant to data attributes', function () {
    Functions\when('get_post_mime_type')->justReturn('video/mp4');
    Functions\when('get_post_thumbnail_id')->justReturn(7);
    Functions\when('wp_get_attachment_url')->justReturn('clip.mp4');

    $html = kotlinskidev_device_frame_render([
        'imageId'               => 42,
        'kotlinskidevAboveFold' => true,
        'responsiveMedia'       => ['mobile' => ['url' => 'clip-m.mp4', 'type' => 'video']],
    ]);

    expect($html)->not->toMatch('/\ssrc="clip\.mp4"/');
    expect($html)->toContain('data-src="clip.mp4"');
    expect($html)->toContain('data-kt-src-mobile="clip-m.mp4"');
    kotlinskidev_reset_above_fold_state();
});

it('wraps an image screen in a picture with a mobile source and preloads both with matching media', function () {
    Functions\when('wp_get_attachment_image_sizes')->justReturn('100vw');
    Functions\when('wp_get_attachment_image_srcset')->alias(fn ($id) => 9 === $id ? 'frame-m-400.webp 400w' : 'frame-800.webp 800w');
    Functions\when('wp_get_attachment_image_url')->justReturn('frame.webp');

    $html = kotlinskidev_device_frame_render([
        'imageId'               => 42,
        'kotlinskidevAboveFold' => true,
        'responsiveMedia'       => ['mobile' => ['id' => 9, 'url' => 'frame-m.webp', 'type' => 'image']],
    ]);

    ob_start();
    kotlinskidev_print_lcp_preload();
    $head = ob_get_clean();

    expect($html)->toContain('<picture class="kt-responsive-media"><source media="(max-width: 781px)" srcset="frame-m-400.webp 400w" sizes="100vw"><img');
    expect($head)->toContain('href="frame-m.webp" media="(max-width: 781px)" imagesrcset="frame-m-400.webp 400w" imagesizes="100vw"');
    expect($head)->toContain('href="frame.webp" media="(min-width: 782px)" imagesrcset="frame-800.webp 800w" imagesizes="100vw"');
    kotlinskidev_reset_above_fold_state();
});

it('leaves an image screen without variants as a plain image with a single preload', function () {
    $html = kotlinskidev_device_frame_render(['imageId' => 42, 'kotlinskidevAboveFold' => true]);

    ob_start();
    kotlinskidev_print_lcp_preload();
    $head = ob_get_clean();

    expect($html)->not->toContain('<picture');
    expect($head)->toBe('<link rel="preload" as="image" fetchpriority="high" href="frame.jpg">' . "\n");
    kotlinskidev_reset_above_fold_state();
});
