<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/copyrights.php';

it('wraps the copyrights shortcode output in the block wrapper', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-copyrights"');
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_html_e')->alias(fn ($t) => print($t));
    Functions\when('wp_kses')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/copyrights/render.php',
        []
    );

    expect($html)->toContain('<div class="wp-block-kotlinskidev-copyrights">');
    expect($html)->toContain('Copyrights');
});
