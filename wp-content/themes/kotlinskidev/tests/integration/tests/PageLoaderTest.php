<?php

uses(Tests\Integration\TestCase::class);

it('renders the page loader markup on wp_body_open', function () {
    ob_start();
    do_action('wp_body_open');
    $html = ob_get_clean();

    expect($html)->toContain('<div id="page-loader"><div class="spinner"></div></div>');
});

it('hides the loader without JS via noscript style', function () {
    ob_start();
    do_action('wp_body_open');
    $html = ob_get_clean();

    expect($html)->toContain('<noscript><style>#page-loader{display:none}</style></noscript>');
});

it('prints an inline dismiss script with timeout fallback at the end of the body', function () {
    ob_start();
    do_action('wp_footer');
    $html = ob_get_clean();

    expect($html)->toContain('classList.add("loaded")')->and($html)->toContain('setTimeout');
});
