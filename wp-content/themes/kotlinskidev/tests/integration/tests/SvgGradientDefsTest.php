<?php

uses(Tests\Integration\TestCase::class);

it('renders the shared icon gradient defs on wp_body_open', function () {
    ob_start();
    do_action('wp_body_open');
    $html = ob_get_clean();

    expect($html)->toContain('id="kt-icon-gradient-dark"');
    expect($html)->toContain('id="kt-icon-gradient-light"');
    expect($html)->toContain('<linearGradient');
});
