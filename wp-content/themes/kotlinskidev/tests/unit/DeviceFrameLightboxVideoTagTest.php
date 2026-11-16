<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/device-frame-lightbox.php';

beforeEach(function () {
    Functions\when('esc_url')->returnArg();
    Functions\when('absint')->alias(fn ($value) => abs((int) $value));
    Functions\when('wp_get_attachment_url')->justReturn('https://example.com/clip.mp4');
});

it('prints the deferred source with the attachment size and poster so the modal has a real box before loading', function () {
    Functions\when('wp_get_attachment_metadata')->justReturn(array('width' => 1440, 'height' => 964));
    Functions\when('get_post_thumbnail_id')->justReturn(12);
    Functions\when('wp_get_attachment_image_url')->justReturn('https://example.com/clip-poster.webp');

    expect(kotlinskidev_device_frame_lightbox_video_tag(10))->toBe(
        '<video class="kt-device-frame-lightbox__media" data-src="https://example.com/clip.mp4" width="1440" height="964" data-poster="https://example.com/clip-poster.webp" preload="none" controls playsinline></video>'
    );
});

it('omits size and poster when the attachment has neither', function () {
    Functions\when('wp_get_attachment_metadata')->justReturn(false);
    Functions\when('get_post_thumbnail_id')->justReturn(0);

    expect(kotlinskidev_device_frame_lightbox_video_tag(10))->toBe(
        '<video class="kt-device-frame-lightbox__media" data-src="https://example.com/clip.mp4" preload="none" controls playsinline></video>'
    );
});
