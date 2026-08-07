<?php

uses(Tests\Integration\TestCase::class);

it('declares the expected theme supports during after_setup_theme', function () {
    foreach ([
        'automatic-feed-links',
        'title-tag',
        'post-thumbnails',
        'block-templates',
        'editor-styles',
        'responsive-embeds',
        'custom-line-height',
        'custom-units',
    ] as $feature) {
        expect(current_theme_supports($feature))->toBeTrue();
    }
});

it('deregisters jquery on the front end for a regular visitor', function () {
    wp_set_current_user(0);

    do_action('wp_enqueue_scripts');

    expect(wp_script_is('jquery', 'registered'))->toBeFalse();
});

it('keeps jquery registered for a user who can manage options', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    $GLOBALS['wp_scripts'] = null;
    do_action('wp_enqueue_scripts');

    expect(wp_script_is('jquery', 'registered'))->toBeTrue();

    wp_set_current_user(0);
});

it('hides the admin bar for a regular visitor via the show_admin_bar filter', function () {
    wp_set_current_user(0);

    expect(apply_filters('show_admin_bar', true))->toBeFalse();
});

it('keeps the admin bar visible for a user who can manage options', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    expect(apply_filters('show_admin_bar', true))->toBeTrue();

    wp_set_current_user(0);
});

it('deregisters the core admin-bar style for a regular visitor', function () {
    wp_set_current_user(0);
    wp_register_style('admin-bar', '/wp-includes/css/admin-bar.css');

    do_action('wp_enqueue_scripts');

    expect(wp_style_is('admin-bar', 'registered'))->toBeFalse();
});

it('inlines the theme switcher config as window.kotlinskidevTheme on wp_head', function () {
    ob_start();
    do_action('wp_head');
    $html = ob_get_clean();

    expect($html)->toContain('window.kotlinskidevTheme = ');
    expect($html)->toContain('"enabled":');
    expect($html)->toContain('"defaultMode":');
});
