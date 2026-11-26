<?php

uses(Tests\Integration\TestCase::class);

it('registers the stylesheet, script and inline output hooks at their frozen priorities', function () {
    expect(has_action('wp_enqueue_scripts', 'defer_global_css'))->toBe(10);
    expect(has_action('wp_head', 'inline_critical_css'))->toBe(1);
    expect(has_action('wp_head', 'inline_critical_js'))->toBe(2);
    expect(has_filter('style_loader_tag', 'master_css_filter'))->toBe(5);
    expect(has_filter('script_loader_tag', 'kotlinskidev_defer_deferrable_scripts'))->toBe(10);
    expect(has_action('enqueue_block_editor_assets', 'kotlinskidev_editor_styles'))->toBe(10);
    expect(has_action('enqueue_block_editor_assets', 'kotlinskidev_editor_scripts'))->toBe(10);
});

it('marks the critical stylesheet as protected from optimizers', function () {
    $html = master_css_filter("<link rel='stylesheet' href='critical.css' media='all' />", 'critical-style');

    expect($html)->toBe("<link data-no-optimize=\"1\" data-critical=\"true\" rel='stylesheet' href='critical.css' media='all' />");
});

it('turns the global stylesheet into a print-media link that switches to all on load', function () {
    $single = master_css_filter("<link rel='stylesheet' href='main.css' media='all' />", 'global-style');
    $double = master_css_filter('<link rel="stylesheet" href="main.css" media="all" />', 'global-style');

    expect($single)->toBe("<link data-no-defer=\"1\" data-no-optimize=\"1\" rel='stylesheet' href='main.css' media='print' onload=\"this.media='all'\" />");
    expect($double)->toBe('<link data-no-defer="1" data-no-optimize="1" rel="stylesheet" href="main.css" media="print" onload="this.media=\'all\'" />');
});

it('does not add a second onload to a link that already has one', function () {
    $html = master_css_filter("<link rel='stylesheet' href='main.css' media='print' onload=\"x()\" />", 'global-style');

    expect(substr_count($html, 'onload='))->toBe(1);
    expect($html)->toContain('onload="x()"');
});

it('defers the always-deferred handles', function () {
    $navigation = master_css_filter("<link rel='stylesheet' href='nav.css' media='all' />", 'wp-block-navigation');

    expect($navigation)->toBe("<link data-no-defer=\"1\" data-no-optimize=\"1\" rel='stylesheet' href='nav.css' media='print' onload=\"this.media='all'\" />");
});

it('defers the style handles of every registered block stylesheet', function () {
    $handles = kotlinskidev_get_block_style_link_handles();
    expect($handles)->not->toBeEmpty();

    $html = master_css_filter("<link rel='stylesheet' href='b.css' media='all' />", $handles[0]);

    expect($html)->toContain("media='print' onload=");
});

it('leaves stylesheets of unrelated handles untouched', function () {
    $html = "<link rel='stylesheet' href='other.css' media='all' />";

    expect(master_css_filter($html, 'some-plugin-style'))->toBe($html);
});

it('adds defer to the PWA manager script exactly once and ignores other handles', function () {
    $tag = '<script src="pwa.js"></script>';

    expect(kotlinskidev_defer_deferrable_scripts($tag, 'wp-pwa-manager-frontend'))->toBe('<script defer src="pwa.js"></script>');
    expect(kotlinskidev_defer_deferrable_scripts('<script defer src="pwa.js"></script>', 'wp-pwa-manager-frontend'))->toBe('<script defer src="pwa.js"></script>');
    expect(kotlinskidev_defer_deferrable_scripts($tag, 'other-script'))->toBe($tag);
});

it('inlines the built critical javascript with its own script id', function () {
    $path = kotlinskidev_build_path('js', 'critical.js');
    expect(file_exists($path))->toBeTrue();

    ob_start();
    inline_critical_js();
    $output = ob_get_clean();

    expect($output)->toBe('<script id="critical-js" charset="utf-8">' . file_get_contents($path) . '</script>');
});

it('inlines the built critical stylesheet with breakpoint placeholders resolved', function () {
    $path = kotlinskidev_build_path('css', 'critical.css');
    expect(file_exists($path))->toBeTrue();

    ob_start();
    inline_critical_css();
    $output = ob_get_clean();

    $expected = '<style id="critical-css">' . kotlinskidev_transform_breakpoint_css(file_get_contents($path)) . '</style>';
    expect(str_starts_with($output, $expected))->toBeTrue();
});

it('returns an empty string for a critical stylesheet that does not exist', function () {
    expect(kotlinskidev_read_cached_critical_css('does-not-exist.css'))->toBe('');
});

it('enqueues the deferred main script and localizes the theme configuration', function () {
    do_action('wp_enqueue_scripts');

    $script = wp_scripts()->registered['wp-typescript'];
    expect($script->src)->toBe(kotlinskidev_build_url('js', 'main.js'));
    expect($script->extra['strategy'])->toBe('defer');
    expect($script->args)->toBeNull();
    expect($script->extra['data'])->toContain('var kotlinskiTheme = ');
    expect($script->extra['data'])->toContain('"inViewBand"');
    expect(wp_scripts()->get_data('wp-typescript', 'group'))->toBeFalsy();
});

it('registers the global stylesheet with print media and a filemtime version', function () {
    do_action('wp_enqueue_scripts');

    $style = wp_styles()->registered['global-style'];
    expect($style->args)->toBe('print');
    expect($style->src)->toBe(kotlinskidev_build_url('css', 'main.css'));
    expect($style->ver)->toBe(filemtime(kotlinskidev_build_path('css', 'main.css')));
});
