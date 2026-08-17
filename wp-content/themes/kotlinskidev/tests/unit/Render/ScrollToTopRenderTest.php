<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/svg-support.php';
require_once __DIR__ . '/../../../functions/blocks.php';
require_once __DIR__ . '/../../../functions/scroll-top-top.php';

it('wraps the scroll-to-top shortcode output in the block wrapper', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-scroll-to-top"');
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-to-top/render.php',
        []
    );

    expect($html)->toContain('<div class="wp-block-kotlinskidev-scroll-to-top">');
    expect($html)->toContain('id="scroll-to-top"');
});
