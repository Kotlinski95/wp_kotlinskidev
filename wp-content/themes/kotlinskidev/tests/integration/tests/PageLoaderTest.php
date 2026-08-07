<?php

uses(Tests\Integration\TestCase::class);

it('renders the page loader markup on wp_body_open', function () {
    ob_start();
    do_action('wp_body_open');
    $html = ob_get_clean();

    expect($html)->toContain('<div id="page-loader"><div class="spinner"></div></div>');
});
