<?php

uses(Tests\Integration\TestCase::class);

it('enqueues the global stylesheet deferred via media print', function () {
    do_action('wp_enqueue_scripts');

    expect(wp_style_is('global-style', 'enqueued'))->toBeTrue();

    $registered = wp_styles()->registered['global-style'];
    expect($registered->args)->toBe('print');
    expect($registered->src)->toContain('/build/main.css');
});

it('enqueues the theme main script with defer strategy and localizes theme data', function () {
    do_action('wp_enqueue_scripts');

    expect(wp_script_is('wp-typescript', 'enqueued'))->toBeTrue();

    global $wp_scripts;
    $data = $wp_scripts->get_data('wp-typescript', 'data');

    expect($data)->toContain('kotlinskiTheme');
    expect($data)->toContain('"mobileBreakpoint"');
});

it('enqueues the editor overrides style and script on enqueue_block_editor_assets', function () {
    do_action('enqueue_block_editor_assets');

    expect(wp_style_is('kotlinskidev-editor-overrides', 'enqueued'))->toBeTrue();
    expect(wp_script_is('kotlinskidev-editor-only', 'enqueued'))->toBeTrue();
});

it('inlines the critical css on wp_head', function () {
    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('<style id="critical-css">');
});

it('inlines the critical js on wp_head', function () {
    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('<script id="critical-js" charset="utf-8">');
});

it('marks the critical stylesheet tag as non-optimizable via the style_loader_tag filter', function () {
    $tag = apply_filters('style_loader_tag', '<link rel="stylesheet" href="critical.css">', 'critical-style');

    expect($tag)->toContain('data-no-optimize="1"');
    expect($tag)->toContain('data-critical="true"');
});

it('forces the global stylesheet tag to media=print with an onload swap', function () {
    $tag = apply_filters('style_loader_tag', "<link rel='stylesheet' href='main.css' media='all'>", 'global-style');

    expect($tag)->toContain("media='print'");
    expect($tag)->toContain('onload=');
    expect($tag)->toContain('data-no-defer="1"');
});

it('leaves an unrelated stylesheet tag untouched', function () {
    $original = '<link rel="stylesheet" href="unrelated.css" media="all">';

    $tag = apply_filters('style_loader_tag', $original, 'unrelated-style');

    expect($tag)->toBe($original);
});

it('adds defer to the wp-pwa-manager-frontend script tag but not to unrelated handles', function () {
    $deferred = apply_filters('script_loader_tag', '<script src="pwa.js"></script>', 'wp-pwa-manager-frontend');
    $untouched = apply_filters('script_loader_tag', '<script src="other.js"></script>', 'some-other-script');

    expect($deferred)->toContain('defer src=');
    expect($untouched)->toBe('<script src="other.js"></script>');
});

it('does not double up the defer attribute if already present', function () {
    $tag = apply_filters('script_loader_tag', '<script defer src="pwa.js"></script>', 'wp-pwa-manager-frontend');

    expect(substr_count($tag, 'defer'))->toBe(1);
});
