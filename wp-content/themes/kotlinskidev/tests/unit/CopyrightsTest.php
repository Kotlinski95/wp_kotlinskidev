<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/copyrights.php';

it('renders the current year and copyrights text', function () {
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_html_e')->alias(fn ($t) => print($t));
    Functions\when('wp_kses')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);

    $output = kotlinskidev_copyrights_shortcode();

    expect($output)->toContain('&copy; ' . date('Y') . ' Copyrights');
    expect($output)->toContain('Proudly powered by');
});
