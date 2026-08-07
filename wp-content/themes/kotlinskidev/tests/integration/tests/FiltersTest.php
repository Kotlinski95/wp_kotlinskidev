<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    delete_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes');
});

it('returns no size for an external image without making an HTTP request', function () {
    expect(kotlinskidev_compute_image_size('https://a-completely-different-cdn.example/image.jpg'))->toBe([]);
});

it('returns no size for a local upload url that does not exist on disk', function () {
    $upload_dir = wp_upload_dir();

    expect(kotlinskidev_compute_image_size($upload_dir['baseurl'] . '/does-not-exist-12345.jpg'))->toBe([]);
});

it('caches a computed size so the same src is only computed once per request', function () {
    $src = 'https://a-completely-different-cdn.example/repeat.jpg';

    $first = kotlinskidev_get_image_size_cached($src);
    $second = kotlinskidev_get_image_size_cached($src);

    expect($first)->toBe([]);
    expect($second)->toBe([]);
});

it('removes a stale cache entry when its attachment is edited', function () {
    $attachment_id = self::factory()->attachment->create_object('missing-file.jpg', 0, ['post_mime_type' => 'image/jpeg']);
    $src = wp_get_attachment_url($attachment_id);

    set_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes', [md5($src) => ['width' => 100, 'height' => 100]], WEEK_IN_SECONDS);

    kotlinskidev_invalidate_image_size_cache_entry($attachment_id);

    $map = get_transient(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes');
    expect($map)->not->toHaveKey(md5($src));
});

it('leaves an img tag with explicit width and height untouched by the_content filter', function () {
    $html = '<img src="https://a-completely-different-cdn.example/x.jpg" width="10" height="10">';

    expect(apply_filters('the_content', $html))->toContain('width="10" height="10"');
    expect(apply_filters('the_content', $html))->not->toContain('aspect-ratio');
});

it('leaves an img tag with no src attribute untouched by the_content filter', function () {
    $html = '<img alt="no src here">';

    expect(apply_filters('the_content', $html))->toContain('<img alt="no src here">');
});

it('leaves an external image without a computable size untouched by the_content filter', function () {
    $html = '<img src="https://a-completely-different-cdn.example/unsized.jpg">';

    expect(apply_filters('the_content', $html))->toContain('src="https://a-completely-different-cdn.example/unsized.jpg"');
    expect(apply_filters('the_content', $html))->not->toContain('aspect-ratio');
});
