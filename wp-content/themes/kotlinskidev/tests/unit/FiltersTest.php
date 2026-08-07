<?php

use Brain\Monkey\Functions;

if (!defined('WEEK_IN_SECONDS')) {
    define('WEEK_IN_SECONDS', 7 * 24 * 60 * 60);
}
if (!defined('KOTLINSKIDEV_CACHE_PREFIX')) {
    define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
}

require_once __DIR__ . '/../../functions/filters.php';

it('skips images hosted on a different domain', function () {
    Functions\when('site_url')->justReturn('https://example.test');
    Functions\when('wp_upload_dir')->justReturn([
        'baseurl' => 'https://example.test/wp-content/uploads',
        'basedir' => sys_get_temp_dir(),
    ]);

    expect(kotlinskidev_compute_image_size('https://cdn.other.test/image.jpg'))->toBe([]);
});

it('returns no size for a local url outside the uploads directory', function () {
    Functions\when('site_url')->justReturn('https://example.test');
    Functions\when('wp_upload_dir')->justReturn([
        'baseurl' => 'https://example.test/wp-content/uploads',
        'basedir' => sys_get_temp_dir(),
    ]);

    expect(kotlinskidev_compute_image_size('https://example.test/wp-content/themes/x/logo.png'))->toBe([]);
});

it('returns no size when the mapped upload file does not exist', function () {
    Functions\when('site_url')->justReturn('https://example.test');
    Functions\when('wp_upload_dir')->justReturn([
        'baseurl' => 'https://example.test/wp-content/uploads',
        'basedir' => sys_get_temp_dir(),
    ]);

    expect(kotlinskidev_compute_image_size('https://example.test/wp-content/uploads/does-not-exist.png'))->toBe([]);
});

it('reads real dimensions from a local uploads file, ignoring a query string', function () {
    $tmpDir = sys_get_temp_dir();
    $filename = 'kt-filters-test-' . uniqid() . '.png';
    $path = $tmpDir . '/' . $filename;
    $onePixelPng = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    );
    file_put_contents($path, $onePixelPng);

    Functions\when('site_url')->justReturn('https://example.test');
    Functions\when('wp_upload_dir')->justReturn([
        'baseurl' => 'https://example.test/wp-content/uploads',
        'basedir' => $tmpDir,
    ]);

    $result = kotlinskidev_compute_image_size(
        "https://example.test/wp-content/uploads/{$filename}?ver=5"
    );

    unlink($path);

    expect($result)->toBe(['width' => 1, 'height' => 1]);
});

it('does nothing when there is no attachment url to invalidate', function () {
    Functions\when('wp_get_attachment_url')->justReturn(false);
    Functions\expect('set_transient')->never();

    kotlinskidev_invalidate_image_size_cache_entry(123);
});

it('does nothing when the cache transient is not an array', function () {
    Functions\when('wp_get_attachment_url')->justReturn('https://example.test/a.jpg');
    Functions\when('get_transient')->justReturn(false);
    Functions\expect('set_transient')->never();

    kotlinskidev_invalidate_image_size_cache_entry(123);
});

it('does nothing when the cached map has no entry for the attachment url', function () {
    Functions\when('wp_get_attachment_url')->justReturn('https://example.test/a.jpg');
    Functions\when('get_transient')->justReturn(['some-other-key' => ['width' => 1, 'height' => 1]]);
    Functions\expect('set_transient')->never();

    kotlinskidev_invalidate_image_size_cache_entry(123);
});

it('removes the cached entry and persists the map when the attachment url is cached', function () {
    $src = 'https://example.test/a.jpg';
    $key = md5($src);

    Functions\when('wp_get_attachment_url')->justReturn($src);
    Functions\when('get_transient')->justReturn([$key => ['width' => 10, 'height' => 20], 'other' => []]);
    Functions\expect('set_transient')
        ->once()
        ->with(KOTLINSKIDEV_CACHE_PREFIX . 'img_sizes', ['other' => []], WEEK_IN_SECONDS);

    kotlinskidev_invalidate_image_size_cache_entry(123);
});
