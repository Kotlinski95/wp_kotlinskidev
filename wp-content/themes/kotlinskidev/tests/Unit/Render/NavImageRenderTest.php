<?php

use Brain\Monkey\Functions;

function kotlinskidev_nav_image_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-image/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-nav-image"');
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('renders nothing when there is no media url', function () {
    expect(kotlinskidev_nav_image_render(['mediaUrl' => '']))->toBe('');
});

it('renders a bare image when there is no link url', function () {
    $html = kotlinskidev_nav_image_render(['mediaUrl' => 'img.jpg', 'altText' => 'Alt']);

    expect($html)->toContain('<img src="img.jpg" alt="Alt"');
    expect($html)->not->toContain('<a ');
});

it('wraps the image in a link when a link url is set', function () {
    $html = kotlinskidev_nav_image_render(['mediaUrl' => 'img.jpg', 'linkUrl' => 'https://example.test']);

    expect($html)->toContain('<a href="https://example.test"><img src="img.jpg"');
});
