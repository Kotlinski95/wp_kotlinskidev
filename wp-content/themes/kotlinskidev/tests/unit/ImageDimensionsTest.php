<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/image-dimensions.php';

function kotlinskidev_test_svg_file(string $svg): string
{
    $path = tempnam(sys_get_temp_dir(), 'ktsvg');
    file_put_contents($path, $svg);
    return $path;
}

beforeEach(function () {
    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_feed')->justReturn(false);
});

it('reads svg dimensions from width and height attributes', function () {
    $path = kotlinskidev_test_svg_file('<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="32"></svg>');

    expect(kotlinskidev_svg_dimensions($path))->toBe([24, 32]);
});

it('falls back to the svg viewBox', function () {
    $path = kotlinskidev_test_svg_file('<svg viewBox="0 0 100 50.4"><path/></svg>');

    expect(kotlinskidev_svg_dimensions($path))->toBe([100, 50]);
});

it('returns null for svg without usable dimensions or missing files', function () {
    $path = kotlinskidev_test_svg_file('<svg><path/></svg>');

    expect(kotlinskidev_svg_dimensions($path))->toBeNull();
    expect(kotlinskidev_svg_dimensions('/nonexistent/file.svg'))->toBeNull();
});

it('fills width and height from the size class', function () {
    Functions\when('get_post_mime_type')->justReturn('image/webp');
    Functions\expect('wp_get_attachment_image_src')->once()->with(7, 'large')->andReturn(['u', 1024, 683, true]);

    $html = '<figure class="wp-block-image size-large"><img src="a.webp" alt="x" class="wp-image-7 size-large"/></figure>';

    expect(kotlinskidev_fill_core_image_dimensions($html))->toBe(
        '<figure class="wp-block-image size-large"><img width="1024" height="683" src="a.webp" alt="x" class="wp-image-7 size-large"/></figure>'
    );
});

it('falls back to full metadata when there is no size class', function () {
    Functions\when('get_post_mime_type')->justReturn('image/webp');
    Functions\when('wp_get_attachment_metadata')->justReturn(['width' => 800, 'height' => 600]);

    $html = '<img src="a.webp" class="wp-image-9">';

    expect(kotlinskidev_fill_core_image_dimensions($html))->toBe('<img width="800" height="600" src="a.webp" class="wp-image-9">');
});

it('uses the svg file for svg attachments', function () {
    $path = kotlinskidev_test_svg_file('<svg width="40" height="20"></svg>');
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_attached_file')->justReturn($path);

    $html = '<img src="icon.svg" class="wp-image-3">';

    expect(kotlinskidev_fill_core_image_dimensions($html))->toBe('<img width="40" height="20" src="icon.svg" class="wp-image-3">');
});

it('never overwrites an existing width or height', function () {
    $only_width  = '<img src="a.webp" width="10" class="wp-image-7">';
    $only_height = '<img src="a.webp" height="10" class="wp-image-7">';

    expect(kotlinskidev_fill_core_image_dimensions($only_width))->toBe($only_width);
    expect(kotlinskidev_fill_core_image_dimensions($only_height))->toBe($only_height);
});

it('skips images without an attachment class and unknown dimensions', function () {
    Functions\when('get_post_mime_type')->justReturn('image/webp');
    Functions\when('wp_get_attachment_metadata')->justReturn([]);

    $plain   = '<img src="a.webp">';
    $unknown = '<img src="a.webp" class="wp-image-5">';

    expect(kotlinskidev_fill_core_image_dimensions($plain))->toBe($plain);
    expect(kotlinskidev_fill_core_image_dimensions($unknown))->toBe($unknown);
});

it('skips admin and feed contexts', function () {
    Functions\when('is_admin')->justReturn(true);

    $html = '<img src="a.webp" class="wp-image-7">';

    expect(kotlinskidev_fill_core_image_dimensions($html))->toBe($html);

    Functions\when('is_admin')->justReturn(false);
    Functions\when('is_feed')->justReturn(true);

    expect(kotlinskidev_fill_core_image_dimensions($html))->toBe($html);
});

it('adds flag dimensions to polylang flag images only', function () {
    $html = '<span><img style="a" src="/wp-content/themes/x/polylang/pl_PL.png" alt="" loading="lazy" /></span><img src="/other.png">';

    expect(kotlinskidev_fill_language_flag_dimensions($html))->toBe(
        '<span><img width="48" height="30" style="a" src="/wp-content/themes/x/polylang/pl_PL.png" alt="" loading="lazy" /></span><img src="/other.png">'
    );
});

it('leaves flag images that already have dimensions untouched', function () {
    $html = '<img src="/polylang/en_US.png" width="48" height="30">';

    expect(kotlinskidev_fill_language_flag_dimensions($html))->toBe($html);
});

it('resolves dimensions for a sized attachment url from metadata', function () {
    Functions\when('attachment_url_to_postid')->justReturn(11);
    Functions\when('wp_get_attachment_metadata')->justReturn([
        'width' => 2000, 'height' => 1334,
        'sizes' => ['large' => ['file' => 'cover-1024x683.webp', 'width' => 1024, 'height' => 683]],
    ]);
    Functions\when('wp_parse_url')->alias('parse_url');

    expect(kotlinskidev_attachment_dimensions_for_url('https://x.test/up/cover-1024x683.webp'))->toBe([1024, 683]);
});

it('reads dimensions from the uploads file when the url has no attachment', function () {
    $dir = sys_get_temp_dir() . '/ktup' . uniqid();
    mkdir($dir);
    imagepng(imagecreatetruecolor(30, 20), $dir . '/pic.png');
    Functions\when('attachment_url_to_postid')->justReturn(0);
    Functions\when('wp_get_upload_dir')->justReturn(['baseurl' => 'https://x.test/up', 'basedir' => $dir]);
    Functions\when('wp_parse_url')->alias('parse_url');

    expect(kotlinskidev_attachment_dimensions_for_url('https://x.test/up/pic.png'))->toBe([30, 20]);
});

it('returns null for urls that are not attachments', function () {
    Functions\when('attachment_url_to_postid')->justReturn(0);
    Functions\when('wp_get_upload_dir')->justReturn(['baseurl' => 'https://x.test/up', 'basedir' => '/nonexistent']);

    expect(kotlinskidev_attachment_dimensions_for_url('https://x.test/nothing.webp'))->toBeNull();
});
