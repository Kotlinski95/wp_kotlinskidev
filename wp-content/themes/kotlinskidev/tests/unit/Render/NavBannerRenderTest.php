<?php

use Brain\Monkey\Functions;

function kotlinskidev_nav_banner_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-banner/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="kt-nav-banner"');
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);
});

it('renders no media figure when there is no media url', function () {
    $html = kotlinskidev_nav_banner_render([]);

    expect($html)->not->toContain('kt-nav-banner__media');
});

it('renders the media figure with a bare image when there is no link url', function () {
    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'banner.jpg']);

    expect($html)->toContain('<figure class="kt-nav-banner__media">');
    expect($html)->toContain('<img src="banner.jpg"');
    expect($html)->not->toContain('kt-nav-banner__media-link');
});

it('wraps the media image in a link when a link url is set', function () {
    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'banner.jpg', 'linkUrl' => 'https://example.test']);

    expect($html)->toContain('<a class="kt-nav-banner__media-link" href="https://example.test">');
});

it('renders the heading and description when set', function () {
    $html = kotlinskidev_nav_banner_render(['heading' => 'My Heading', 'description' => 'My description']);

    expect($html)->toContain('<h3 class="kt-nav-banner__heading">My Heading</h3>');
    expect($html)->toContain('<p class="kt-nav-banner__desc">My description</p>');
});

it('omits the heading and description when empty', function () {
    $html = kotlinskidev_nav_banner_render([]);

    expect($html)->not->toContain('kt-nav-banner__heading');
    expect($html)->not->toContain('kt-nav-banner__desc');
});

it('renders the call-to-action link only when both a url and a label are set', function () {
    $html = kotlinskidev_nav_banner_render(['linkUrl' => 'https://example.test', 'linkLabel' => 'Learn more']);

    expect($html)->toContain('<a class="kt-nav-banner__link" href="https://example.test">');
    expect($html)->toContain('Learn more');
});

it('omits the call-to-action link when only the url is set without a label', function () {
    $html = kotlinskidev_nav_banner_render(['linkUrl' => 'https://example.test']);

    expect($html)->not->toContain('kt-nav-banner__link');
});

it('passes a custom hover padding through to get_block_wrapper_attributes', function () {
    $captured = null;
    Functions\when('get_block_wrapper_attributes')->alias(function ($extra) use (&$captured) {
        $captured = $extra;
        return 'class="kt-nav-banner"';
    });

    kotlinskidev_nav_banner_render(['hoverPadding' => '2rem']);

    expect($captured['style'] ?? null)->toBe('--kt-nav-banner-hover-pad: 2rem;');
});

it('omits the style attribute when no hover padding is set', function () {
    $captured = null;
    Functions\when('get_block_wrapper_attributes')->alias(function ($extra) use (&$captured) {
        $captured = $extra;
        return 'class="kt-nav-banner"';
    });

    kotlinskidev_nav_banner_render([]);

    expect($captured)->not->toHaveKey('style');
});

function kotlinskidev_nav_banner_stub_cover(string $url, int $post_id, int $thumb_id, string $large, string $alt = ''): void
{
    Functions\when('home_url')->alias(fn ($p = '') => 'https://site.test' . $p);
    Functions\when('url_to_postid')->alias(fn ($u) => $u === $url || 'https://site.test' . $url === $u ? $post_id : 0);
    Functions\when('get_post_thumbnail_id')->justReturn($thumb_id);
    Functions\when('wp_get_attachment_image_url')->alias(fn ($id, $size) => 'large' === $size ? $large : 'full.jpg');
    Functions\when('get_post_meta')->justReturn($alt);
    Functions\when('pll_get_post')->alias(fn ($id) => $id);
}

it('keeps the stored media url when followLinkedCover is false', function () {
    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'stored.jpg', 'linkUrl' => '/off/', 'followLinkedCover' => false]);

    expect($html)->toContain('<img src="stored.jpg"');
});

it('uses the linked page featured image and its alt when followLinkedCover is true', function () {
    kotlinskidev_nav_banner_stub_cover('/page-a/', 5, 9, 'cover-large.jpg', 'Cover alt');

    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'stored.jpg', 'linkUrl' => '/page-a/', 'followLinkedCover' => true]);

    expect($html)->toContain('<img src="cover-large.jpg" alt="Cover alt" loading="lazy">');
    expect($html)->not->toContain('stored.jpg');
});

it('prefers the block alt text over the cover alt', function () {
    kotlinskidev_nav_banner_stub_cover('/page-b/', 6, 10, 'cover-b.jpg', 'Cover alt');

    $html = kotlinskidev_nav_banner_render(['linkUrl' => '/page-b/', 'altText' => 'Own alt', 'followLinkedCover' => true]);

    expect($html)->toContain('src="cover-b.jpg" alt="Own alt"');
});

it('falls back to the stored media when the linked page has no thumbnail', function () {
    kotlinskidev_nav_banner_stub_cover('/page-c/', 7, 0, 'x.jpg');

    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'stored.jpg', 'linkUrl' => '/page-c/', 'followLinkedCover' => true]);

    expect($html)->toContain('<img src="stored.jpg"');
});

it('falls back to the stored media when the link does not resolve to a post', function () {
    kotlinskidev_nav_banner_stub_cover('/page-d/', 0, 11, 'x.jpg');

    $html = kotlinskidev_nav_banner_render(['mediaUrl' => 'stored.jpg', 'linkUrl' => '/nowhere/', 'followLinkedCover' => true]);

    expect($html)->toContain('<img src="stored.jpg"');
});

it('escapes the linked cover url and alt', function () {
    kotlinskidev_nav_banner_stub_cover('/page-e/', 8, 12, 'c.jpg?a=1&b=2', 'A "quoted" alt');
    $escUrl = null;
    Functions\when('esc_url')->alias(function ($t) use (&$escUrl) {
        $escUrl = $t;
        return $t;
    });
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars($t, ENT_QUOTES));

    $html = kotlinskidev_nav_banner_render(['linkUrl' => '/page-e/', 'followLinkedCover' => true]);

    expect($html)->toContain('alt="A &quot;quoted&quot; alt"');
});
