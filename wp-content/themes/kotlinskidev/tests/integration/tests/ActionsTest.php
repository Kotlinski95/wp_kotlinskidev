<?php

uses(Tests\Integration\TestCase::class);

it('outputs the font preload and preconnect tags on wp_head', function () {
    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('<link rel="preload" as="font" type="font/woff2"');
    expect($html)->toContain('Sora-VariableFont_wght.woff2');
    expect($html)->toContain('<link rel="preconnect" href="https://kotlinskidev.com" crossorigin>');
});

it('strips duplicate viewport meta tags and injects a single custom one after the opening head tag', function () {
    remove_action('template_redirect', 'redirect_canonical');
    remove_action('template_redirect', 'wp_redirect_admin_locations', 1000);
    remove_action('template_redirect', 'wp_old_slug_redirect');

    ob_start();
    do_action('template_redirect');
    echo '<html><head><meta name="viewport" content="width=device-width"><title>Test</title></head><body></body></html>';
    ob_end_flush();
    $html = ob_get_clean();

    expect(substr_count($html, 'name="viewport"'))->toBe(1);
    expect($html)->toContain('<head><meta name="viewport" content="height=device-height, width=device-width');
    expect($html)->toContain('target-densitydpi=device-dpi');
    expect($html)->toContain('<title>Test</title>');
});
