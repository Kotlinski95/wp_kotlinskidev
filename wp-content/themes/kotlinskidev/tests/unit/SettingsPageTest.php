<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/settings-page.php';

beforeEach(function () {
    Functions\when('esc_html__')->alias(fn ($t) => $t);
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);
    unset($_GET['tab']);
});

it('lists the known settings tabs with the SEO tab enabled by default', function () {
    $tabs = kotlinskidev_settings_tabs();

    expect(array_keys($tabs))->toBe(['general', 'theme-mode', 'breakpoints', 'login', 'tracking', 'security', 'contact', 'advanced', 'monitoring', 'customization', 'site-values', 'seo']);
    expect($tabs['breakpoints']['group'])->toBe('kotlinskidev_settings_breakpoints');
    expect($tabs['security']['group'])->toBe('kotlinskidev_settings_security');
    expect($tabs['monitoring']['group'])->toBe('kotlinskidev_settings_monitoring');
    expect($tabs['customization']['group'])->toBe('kotlinskidev_settings_customization');
});

it('omits the SEO tab when the custom SEO feature is switched off', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => ['project_cards']);

    expect(array_keys(kotlinskidev_settings_tabs()))->not->toContain('seo');
    expect(array_keys(kotlinskidev_settings_tabs()))->toContain('customization');
});

it('falls back to general for a direct seo tab request when the feature is off', function () {
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    Functions\when('get_option')->alias(fn ($name, $default = false) => ['project_cards']);
    $_GET['tab'] = 'seo';

    expect(kotlinskidev_active_settings_tab())->toBe('general');
});

it('registers no SEO settings when the custom SEO feature is switched off', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => ['project_cards']);
    Functions\expect('register_setting')->never();
    Functions\expect('add_settings_section')->never();

    kotlinskidev_register_seo_settings();
});

it('defaults to the general tab when no tab is requested', function () {
    expect(kotlinskidev_active_settings_tab())->toBe('general');
});

it('returns a valid requested tab', function () {
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    $_GET['tab'] = 'breakpoints';

    expect(kotlinskidev_active_settings_tab())->toBe('breakpoints');
});

it('falls back to general for an unknown requested tab', function () {
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    $_GET['tab'] = 'not-a-real-tab';

    expect(kotlinskidev_active_settings_tab())->toBe('general');
});

it('sanitizes the theme default mode, falling back to auto', function () {
    expect(kotlinskidev_sanitize_theme_default_mode('light'))->toBe('light');
    expect(kotlinskidev_sanitize_theme_default_mode('dark'))->toBe('dark');
    expect(kotlinskidev_sanitize_theme_default_mode('neon'))->toBe('auto');
});

it('clamps the breakpoint px value between 320 and 1920', function () {
    Functions\when('absint')->alias('abs');

    expect(kotlinskidev_sanitize_breakpoint_px(100))->toBe(320);
    expect(kotlinskidev_sanitize_breakpoint_px(5000))->toBe(1920);
    expect(kotlinskidev_sanitize_breakpoint_px(800))->toBe(800);
});

it('clamps the scroll offset px value, taking the absolute value first', function () {
    Functions\when('absint')->alias('abs');

    expect(kotlinskidev_sanitize_scroll_offset_px(-10))->toBe(10);
    expect(kotlinskidev_sanitize_scroll_offset_px(9999))->toBe(400);
    expect(kotlinskidev_sanitize_scroll_offset_px(60))->toBe(60);
});

it('builds the default login background and logo image urls from the theme uri', function () {
    Functions\when('get_template_directory_uri')->justReturn('https://example.test/wp-content/themes/kotlinskidev');

    expect(kotlinskidev_login_default_bg_image())
        ->toBe('https://example.test/wp-content/themes/kotlinskidev/assets/images/kotlinskidev-background.webp');
    expect(kotlinskidev_login_default_logo_image())
        ->toBe('https://example.test/wp-content/themes/kotlinskidev/assets/images/kotlinskidev-logo.webp');
});

it('does not enqueue media on an unrelated admin page', function () {
    Functions\expect('wp_enqueue_media')->never();

    kotlinskidev_enqueue_login_settings_media('edit.php');
});

it('does not enqueue media on the settings page when a different tab is active', function () {
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    $_GET['tab'] = 'tracking';
    Functions\expect('wp_enqueue_media')->never();

    kotlinskidev_enqueue_login_settings_media('settings_page_kotlinskidev-settings');
});

it('enqueues media and the inline script on the login settings tab', function () {
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    $_GET['tab'] = 'login';
    Functions\expect('wp_enqueue_media')->once();
    Functions\expect('wp_add_inline_script')->once();

    kotlinskidev_enqueue_login_settings_media('settings_page_kotlinskidev-settings');
});
