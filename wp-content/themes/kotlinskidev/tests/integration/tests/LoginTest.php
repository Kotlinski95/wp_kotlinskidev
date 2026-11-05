<?php

uses(Tests\Integration\TestCase::class);

afterEach(function () {
    delete_option('kotlinskidev_login_enable_custom');
    delete_option('kotlinskidev_login_bg_image');
    delete_option('kotlinskidev_login_bg_color');
    delete_option('kotlinskidev_login_logo_image');
    delete_option('kotlinskidev_login_accent_color');
});

it('outputs custom login background, logo, and input styles by default', function () {
    ob_start();
    do_action('login_head');
    $html = ob_get_clean();

    expect($html)->toContain('body.login');
    expect($html)->toContain('.login h1 a');
    expect($html)->toContain('.login input[type="text"]');
});

it('outputs none of the theme login styles when custom login styling is disabled via option', function () {
    add_option('kotlinskidev_login_enable_custom', false);

    ob_start();
    do_action('login_head');
    $html = ob_get_clean();

    expect($html)->not->toContain('body.login');
    expect($html)->not->toContain('.login h1 a');
    expect($html)->not->toContain('.login input[type="text"]');
});

it('uses the configured background color, escaped', function () {
    update_option('kotlinskidev_login_bg_color', '#ff0000');

    ob_start();
    do_action('login_head');
    $html = ob_get_clean();

    expect($html)->toContain('background-color: #ff0000');
});

it('uses the configured accent color, escaped', function () {
    update_option('kotlinskidev_login_accent_color', '#00ff00');

    ob_start();
    do_action('login_head');
    $html = ob_get_clean();

    expect($html)->toContain('color: #00ff00');
});

it('escapes a background image url containing an unsafe character', function () {
    update_option('kotlinskidev_login_bg_image', 'https://example.com/bg.jpg?x="><script>alert(1)</script>');

    ob_start();
    do_action('login_head');
    $html = ob_get_clean();

    expect($html)->not->toContain('<script>');
});
