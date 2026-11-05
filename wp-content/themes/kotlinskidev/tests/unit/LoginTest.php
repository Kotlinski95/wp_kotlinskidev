<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/settings-page.php';
require_once __DIR__ . '/../../functions/login.php';

beforeEach(function () {
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('get_template_directory_uri')->justReturn('https://example.test/wp-content/themes/kotlinskidev');
});

it('outputs nothing for the login page styles when custom login is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => $name === 'kotlinskidev_login_enable_custom' ? false : $default);

    ob_start();
    kotlinskidev_custom_login_page_styles();

    expect(ob_get_clean())->toBe('');
});

it('uses the configured background image and color when custom login is enabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => match ($name) {
        'kotlinskidev_login_enable_custom' => true,
        'kotlinskidev_login_bg_image' => 'https://example.test/custom-bg.jpg',
        'kotlinskidev_login_bg_color' => '#000000',
        default => $default,
    });

    ob_start();
    kotlinskidev_custom_login_page_styles();
    $output = ob_get_clean();

    expect($output)->toContain('url("https://example.test/custom-bg.jpg")');
    expect($output)->toContain('#000000');
});

it('falls back to the default background image when none is configured', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => match ($name) {
        'kotlinskidev_login_enable_custom' => true,
        default => $default,
    });

    ob_start();
    kotlinskidev_custom_login_page_styles();
    $output = ob_get_clean();

    expect($output)->toContain('kotlinskidev-background.webp');
});

it('outputs nothing for the login logo when custom login is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => $name === 'kotlinskidev_login_enable_custom' ? false : $default);

    ob_start();
    kotlinskidev_custom_login_logo();

    expect(ob_get_clean())->toBe('');
});

it('falls back to the default logo image when none is configured', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => match ($name) {
        'kotlinskidev_login_enable_custom' => true,
        default => $default,
    });

    ob_start();
    kotlinskidev_custom_login_logo();
    $output = ob_get_clean();

    expect($output)->toContain('kotlinskidev-logo.webp');
});

it('outputs nothing for the login input styles when custom login is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => $name === 'kotlinskidev_login_enable_custom' ? false : $default);

    ob_start();
    kotlinskidev_custom_login_input_styles();

    expect(ob_get_clean())->toBe('');
});

it('uses the configured accent color for the login input hover styles', function () {
    Functions\when('get_option')->alias(fn ($name, $default = '') => match ($name) {
        'kotlinskidev_login_enable_custom' => true,
        'kotlinskidev_login_accent_color' => '#ff00ff',
        default => $default,
    });

    ob_start();
    kotlinskidev_custom_login_input_styles();
    $output = ob_get_clean();

    expect($output)->toContain('#ff00ff');
});
