<?php

uses(Tests\Integration\TestCase::class);

it('inlines the manual scroll restoration script on wp_head', function () {
    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain("history.scrollRestoration = 'manual'");
});

it('registers the scroll restoration script at priority 1, before other wp_head output', function () {
    global $wp_filter;

    $callbacks = $wp_filter['wp_head']->callbacks;

    expect($callbacks)->toHaveKey(1);
    expect($callbacks[1])->toHaveKey('kotlinskidev_inline_scroll_restoration_script');
});
