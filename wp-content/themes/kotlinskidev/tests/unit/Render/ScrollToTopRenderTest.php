<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/svg-support.php';
require_once __DIR__ . '/../../../functions/blocks.php';
require_once __DIR__ . '/../../../functions/scroll-top-top.php';

it('wraps the scroll-to-top shortcode output in the block wrapper', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        []
    );

    expect($html)->toContain('<div class="wp-block-kotlinskidev-scroll-to-top">');
    expect($html)->toContain('id="scroll-to-top"');
});

it('renders the bar variant without the fixed-arrow markup', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        [ 'variant' => 'bar' ]
    );

    expect($html)->toContain('kt-scroll-to-top__trigger');
    expect($html)->not->toContain('id="scroll-to-top"');
    expect($html)->not->toContain('progress-ring');
});

it('omits the arrow when showArrow is false', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        [ 'variant' => 'bar', 'showArrow' => false, 'arrowIconId' => 9 ]
    );

    expect($html)->not->toContain('kt-scroll-to-top__arrow');
});

it('omits the arrow when showArrow is true but no icon is picked', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        [ 'variant' => 'bar', 'showArrow' => true ]
    );

    expect($html)->not->toContain('kt-scroll-to-top__arrow');
});

it('renders the arrow with the configured size when showArrow is on and an icon is picked', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        [ 'variant' => 'bar', 'showArrow' => true, 'arrowIconId' => 9, 'arrowSize' => 24 ]
    );

    expect($html)->toContain('kt-scroll-to-top__arrow');
    expect($html)->toContain('--kt-icon-size:24px');
});

it('never renders the arrow on the fixed variant, regardless of the arrow attributes', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        [ 'variant' => 'fixed', 'showArrow' => true, 'arrowIconId' => 9 ]
    );

    expect($html)->not->toContain('kt-scroll-to-top__arrow');
});
