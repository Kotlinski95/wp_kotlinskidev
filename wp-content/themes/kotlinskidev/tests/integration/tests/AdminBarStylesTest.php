<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    remove_filter('show_admin_bar', '__return_true');
    remove_filter('show_admin_bar', '__return_false');
    wp_deregister_style('kotlinskidev-admin-bar');

    global $show_admin_bar;
    $show_admin_bar = null;
});

it('does not enqueue the admin bar stylesheet when the admin bar is hidden', function () {
    add_filter('show_admin_bar', '__return_false');

    do_action('wp_enqueue_scripts');

    expect(wp_style_is('kotlinskidev-admin-bar', 'enqueued'))->toBeFalse();
});

it('enqueues the admin bar stylesheet when the admin bar is showing', function () {
    add_filter('show_admin_bar', '__return_true');

    do_action('wp_enqueue_scripts');

    expect(wp_style_is('kotlinskidev-admin-bar', 'enqueued'))->toBeTrue();

    $registered = wp_styles()->registered['kotlinskidev-admin-bar'];
    expect($registered->src)->toContain('/build/admin-bar.css');
});
