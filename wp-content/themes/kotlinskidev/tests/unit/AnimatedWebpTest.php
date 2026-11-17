<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/animated-webp.php';

function kotlinskidev_test_webp_bytes(bool $animated): string
{
    $flags = $animated ? "\x12" : "\x10";
    return 'RIFF' . pack('V', 22) . 'WEBP' . 'VP8X' . pack('V', 10) . $flags . "\x00\x00\x00" . "\x0f\x00\x00" . "\x0f\x00\x00";
}

function kotlinskidev_test_webp_file(string $bytes): string
{
    $path = tempnam(sys_get_temp_dir(), 'ktwebp') . '.webp';
    file_put_contents($path, $bytes);
    return $path;
}

it('detects the VP8X animation flag', function () {
    expect(kotlinskidev_webp_head_is_animated(kotlinskidev_test_webp_bytes(true)))->toBeTrue();
    expect(kotlinskidev_webp_head_is_animated(kotlinskidev_test_webp_bytes(false)))->toBeFalse();
});

it('detects an ANIM chunk without the flag', function () {
    $bytes = 'RIFF' . pack('V', 20) . 'WEBP' . 'VP8X' . pack('V', 10) . "\x10\x00\x00\x00" . str_repeat("\x00", 6) . 'ANIM';

    expect(kotlinskidev_webp_head_is_animated($bytes))->toBeTrue();
});

it('rejects non-webp and truncated data', function () {
    expect(kotlinskidev_webp_head_is_animated('GIF89a'))->toBeFalse();
    expect(kotlinskidev_webp_head_is_animated(''))->toBeFalse();
    expect(kotlinskidev_webp_head_is_animated('RIFF' . pack('V', 4) . 'WAVE' . 'ANIM'))->toBeFalse();
});

it('reads files and ignores missing paths', function () {
    $animated = kotlinskidev_test_webp_file(kotlinskidev_test_webp_bytes(true));
    $static   = kotlinskidev_test_webp_file(kotlinskidev_test_webp_bytes(false));

    expect(kotlinskidev_webp_file_is_animated($animated))->toBeTrue();
    expect(kotlinskidev_webp_file_is_animated($static))->toBeFalse();
    expect(kotlinskidev_webp_file_is_animated('/nonexistent.webp'))->toBeFalse();
});

it('caches the detection result in post meta', function () {
    $path = kotlinskidev_test_webp_file(kotlinskidev_test_webp_bytes(true));
    Functions\when('get_post_meta')->justReturn('');
    Functions\expect('update_post_meta')->once()->with(7, KOTLINSKIDEV_ANIMATED_WEBP_META_KEY, '1');

    expect(kotlinskidev_attachment_is_animated_webp(7, $path))->toBeTrue();
});

it('uses the cached value without touching the file', function () {
    Functions\when('get_post_meta')->justReturn('1');

    expect(kotlinskidev_attachment_is_animated_webp(7, '/nonexistent.webp'))->toBeTrue();
});

it('skips sizes, scaling and srcset only for animated files', function () {
    Functions\when('get_post_meta')->alias(static fn ($id) => 9 === $id ? '1' : '0');
    Functions\when('wp_get_upload_dir')->justReturn(array('basedir' => '/uploads'));
    Functions\when('trailingslashit')->alias(static fn ($s) => rtrim($s, '/') . '/');

    expect(kotlinskidev_animated_webp_skip_sizes(array('medium' => 1), array('file' => 'a.webp'), 9))->toBe(array());
    expect(kotlinskidev_animated_webp_skip_sizes(array('medium' => 1), array('file' => 'a.webp'), 3))->toBe(array('medium' => 1));
    expect(kotlinskidev_animated_webp_skip_scaling(2560, array(), '/x/a.webp', 9))->toBeFalse();
    expect(kotlinskidev_animated_webp_skip_scaling(2560, array(), '/x/a.webp', 3))->toBe(2560);
    expect(kotlinskidev_animated_webp_drop_srcset(array(1), array(), '', array(), 9))->toBeFalse();
    expect(kotlinskidev_animated_webp_drop_srcset(array(1), array(), '', array(), 3))->toBe(array(1));
});
