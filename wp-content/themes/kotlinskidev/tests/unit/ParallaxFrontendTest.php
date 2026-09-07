<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../includes/parallax-frontend.php';

beforeEach(function () {
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
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

it('adds the parallax class, a default data-parallax-intensity, and a fresh style attribute when none exists', function () {
    $content = '<div class="wp-block-cover is-light">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg']];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toBe(
        '<div class="wp-block-cover enable-parallax is-light" data-parallax-intensity="15" style="background-image:url(\'bg.jpg\');">Content</div>'
    );
});

it('prepends the background-image declaration to an existing style attribute', function () {
    $content = '<section class="wp-block-cover" style="min-height:20rem;">Content</section>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg']];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toBe(
        '<section class="wp-block-cover enable-parallax" style="background-image:url(\'bg.jpg\');min-height:20rem;" data-parallax-intensity="15">Content</section>'
    );
});

it('carries a custom parallaxIntensity through to the data attribute', function () {
    $content = '<div class="wp-block-cover">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg', 'parallaxIntensity' => 8]];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toContain('data-parallax-intensity="8"');
});

it('clamps a parallaxIntensity above the maximum down to 30', function () {
    $content = '<div class="wp-block-cover">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg', 'parallaxIntensity' => 999]];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toContain('data-parallax-intensity="30"');
});

it('clamps a negative parallaxIntensity up to 0', function () {
    $content = '<div class="wp-block-cover">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg', 'parallaxIntensity' => -5]];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toContain('data-parallax-intensity="0"');
});

it('falls back to the default intensity when parallaxIntensity is not numeric', function () {
    $content = '<div class="wp-block-cover">Content</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['enableParallax' => true, 'url' => 'bg.jpg', 'parallaxIntensity' => 'not-a-number']];

    $result = kotlinskidev_render_parallax_cover_block($content, $block);

    expect($result)->toContain('data-parallax-intensity="15"');
});
