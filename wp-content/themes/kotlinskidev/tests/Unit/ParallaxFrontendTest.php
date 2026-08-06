<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../includes/parallax-frontend.php';

beforeEach(function () {
    Functions\when('esc_url')->alias(fn ($t) => $t);
});

it('leaves non-cover blocks unchanged', function () {
    $content = '<div class="wp-block-image"></div>';
    $block = ['blockName' => 'core/image', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg']];

    expect(kotlinskidev_render_parallax_cover_block($content, $block))->toBe($content);
});

it('leaves cover blocks unchanged when parallax is not enabled', function () {
    $content = '<div class="wp-block-cover"></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['url' => 'bg.jpg']];

    expect(kotlinskidev_render_parallax_cover_block($content, $block))->toBe($content);
});

it('leaves cover blocks unchanged when there is no background image url', function () {
    $content = '<div class="wp-block-cover"></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true]];

    expect(kotlinskidev_render_parallax_cover_block($content, $block))->toBe($content);
});

it('adds the parallax class and a fresh style attribute when none exists', function () {
    $content = '<div class="wp-block-cover is-light">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg']];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toBe(
        '<div class="wp-block-cover enable-parallax is-light" style="background-image:url(\'bg.jpg\');">Content</div>'
    );
});

it('prepends the background-image declaration to an existing style attribute', function () {
    $content = '<section class="wp-block-cover" style="min-height:20rem;">Content</section>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg']];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toBe(
        '<section class="wp-block-cover enable-parallax" style="background-image:url(\'bg.jpg\');min-height:20rem;">Content</section>'
    );
});
