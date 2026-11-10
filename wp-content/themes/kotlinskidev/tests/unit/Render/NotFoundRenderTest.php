<?php

use Brain\Monkey\Functions;

function kotlinskidev_not_found_render(): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/not-found-dynamic/render.php',
        []
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="wp-block-kotlinskidev-not-found-dynamic ' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('get_template_directory_uri')->justReturn('https://example.test/wp-content/themes/kotlinskidev');
    Functions\when('home_url')->alias(fn ($path = '/') => 'https://example.test' . $path);
    Functions\when('esc_url')->alias(fn ($u) => $u);
    Functions\when('esc_html')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('__')->alias(fn ($t) => $t);
});

it('renders exactly one h1 with the translated title inside the kt-not-found wrapper', function () {
    $html = kotlinskidev_not_found_render();

    expect($html)->toContain('kt-not-found');
    expect(substr_count($html, '<h1'))->toBe(1);
    expect($html)->toContain('OOPS! Page Not Found!');
});

it('renders a decorative sized inline SVG graphic and a homepage button link', function () {
    $html = kotlinskidev_not_found_render();

    expect($html)->toContain('<svg class="kt-not-found__art" viewBox="0 0 480 240" width="480" height="240" aria-hidden="true"');
    expect($html)->not->toContain('<img');
    expect($html)->not->toContain('404.webp');
    expect($html)->toContain('href="https://example.test/"');
    expect($html)->toContain('wp-block-button__link');
    expect($html)->toContain('Go to Homepage');
});
