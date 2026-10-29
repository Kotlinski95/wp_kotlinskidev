<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    $GLOBALS['wp_styles'] = null;
});

it('detects a real search results page', function () {
    test()->go_to('/?s=hello');

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('does not treat a normal page as a search page', function () {
    $page_id = test()->factory()->post->create(['post_type' => 'page', 'post_name' => 'about']);
    test()->go_to(get_permalink($page_id));

    expect(kotlinskidev_is_search_page())->toBeFalse();
});

it('treats a page with the search slug as a search page', function () {
    $page_id = test()->factory()->post->create(['post_type' => 'page', 'post_name' => 'search']);
    test()->go_to(get_permalink($page_id));

    expect(kotlinskidev_is_search_page())->toBeTrue();
});

it('force-enqueues the block library style on a search page', function () {
    test()->go_to('/?s=hello');

    do_action('wp_enqueue_scripts');

    expect(wp_style_is('wp-block-library', 'enqueued'))->toBeTrue();
});

it('registers wp_footer style-generation callbacks only on a search page', function () {
    remove_all_actions('wp_footer');
    test()->go_to('/?s=hello');

    do_action('wp_enqueue_scripts');

    expect(has_action('wp_footer'))->toBeGreaterThan(0);
});

it('does not register any wp_footer style-generation callbacks off the search page', function () {
    remove_all_actions('wp_footer');
    $page_id = test()->factory()->post->create(['post_type' => 'page', 'post_name' => 'about']);
    test()->go_to(get_permalink($page_id));

    do_action('wp_enqueue_scripts');

    expect(has_action('wp_footer'))->toBeFalse();
});
