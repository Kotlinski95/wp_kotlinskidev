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
