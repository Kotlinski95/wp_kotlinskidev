<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-support.php';
require_once __DIR__ . '/../../functions/blocks.php';
require_once __DIR__ . '/../../functions/scroll-top-top.php';

it('renders the migrated arrow icon svg instead of the icomoon font class', function () {
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('get_post_mime_type')->justReturn('image/svg+xml');
    Functions\when('get_transient')->justReturn('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');

    $html = kotlinskidev_scroll_to_top_shortcode();

    expect($html)->toContain('<span class="kt-icon" style="--kt-icon-size:2rem;">');
    expect($html)->toContain('fill="currentColor"');
    expect($html)->not->toContain('icon-arrow-up');
});
