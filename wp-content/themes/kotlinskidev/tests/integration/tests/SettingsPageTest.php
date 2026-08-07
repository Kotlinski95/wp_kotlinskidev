<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    unset($_GET['tab']);
});

it('exposes the six expected settings tabs', function () {
    $tabs = kotlinskidev_settings_tabs();

    expect(array_keys($tabs))->toBe(['general', 'theme-mode', 'breakpoints', 'login', 'tracking', 'advanced']);
    expect($tabs['breakpoints']['group'])->toBe('kotlinskidev_settings_breakpoints');
    expect($tabs['breakpoints']['page'])->toBe('kotlinskidev-settings-breakpoints');
});

it('defaults the active tab to general with no query var', function () {
    expect(kotlinskidev_active_settings_tab())->toBe('general');
});

it('honors a valid tab query var', function () {
    $_GET['tab'] = 'tracking';

    expect(kotlinskidev_active_settings_tab())->toBe('tracking');
});

it('falls back to general for an unknown tab query var', function () {
    $_GET['tab'] = 'not-a-real-tab';

    expect(kotlinskidev_active_settings_tab())->toBe('general');
});

it('registers the settings admin page for a user who can manage options', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);

    kotlinskidev_register_settings_page();

    global $submenu;
    $found = false;
    foreach ($submenu['options-general.php'] ?? [] as $item) {
        if ($item[2] === 'kotlinskidev-settings') {
            $found = true;
        }
    }
    expect($found)->toBeTrue();

    wp_set_current_user(0);
});

it('registers every settings group with a real default value', function () {
    kotlinskidev_register_settings();

    expect(get_option('kotlinskidev_disable_comments'))->toBeTrue();
    expect(get_option('kotlinskidev_theme_default_mode'))->toBe('auto');
    expect((int) get_option('kotlinskidev_breakpoint_mobile_max'))->toBe(781);
    expect((int) get_option('kotlinskidev_breakpoint_large'))->toBe(1200);
    expect(get_option('kotlinskidev_login_bg_color'))->toBe('#191919');
    expect(get_option('kotlinskidev_login_accent_color'))->toBe('#8209d3');
});

it('sanitizes the theme default mode to a known value or falls back to auto', function () {
    expect(kotlinskidev_sanitize_theme_default_mode('dark'))->toBe('dark');
    expect(kotlinskidev_sanitize_theme_default_mode('light'))->toBe('light');
    expect(kotlinskidev_sanitize_theme_default_mode('neon'))->toBe('auto');
});

it('clamps breakpoint px values between 320 and 1920', function () {
    expect(kotlinskidev_sanitize_breakpoint_px(100))->toBe(320);
    expect(kotlinskidev_sanitize_breakpoint_px(5000))->toBe(1920);
    expect(kotlinskidev_sanitize_breakpoint_px(1000))->toBe(1000);
});

it('clamps scroll offset px magnitude between 0 and 400 (absint takes magnitude, not sign)', function () {
    expect(kotlinskidev_sanitize_scroll_offset_px(-50))->toBe(50);
    expect(kotlinskidev_sanitize_scroll_offset_px(999))->toBe(400);
    expect(kotlinskidev_sanitize_scroll_offset_px(80))->toBe(80);
});

it('renders the disable-comments checkbox reflecting the stored option', function () {
    update_option('kotlinskidev_disable_comments', true);
    update_option('kotlinskidev_disable_comments', false);

    ob_start();
    kotlinskidev_render_disable_comments_field();
    $html = ob_get_clean();

    expect($html)->toContain('name="kotlinskidev_disable_comments"');
    expect($html)->not->toContain('checked');

    update_option('kotlinskidev_disable_comments', true);

    ob_start();
    kotlinskidev_render_disable_comments_field();
    $html = ob_get_clean();

    expect($html)->toContain('checked');
});

it('renders the theme default mode select with the current value selected', function () {
    update_option('kotlinskidev_theme_default_mode', 'dark');

    ob_start();
    kotlinskidev_render_theme_default_mode_field();
    $html = ob_get_clean();

    expect($html)->toMatch('/<option value="dark"[^>]*selected=\'selected\'/');
    expect($html)->not->toMatch('/<option value="light"[^>]*selected=\'selected\'/');
});

it('renders the breakpoints summary table with real computed values', function () {
    ob_start();
    kotlinskidev_render_breakpoints_section();
    $html = ob_get_clean();

    expect($html)->toContain('<table');
    expect($html)->toContain('Mobile');
    expect($html)->toContain('Desktop');
});

it('renders the login color fields with the stored hex values', function () {
    update_option('kotlinskidev_login_bg_color', '#123456');

    ob_start();
    kotlinskidev_render_login_bg_color_field();
    $html = ob_get_clean();

    expect($html)->toContain('type="color"');
    expect($html)->toContain('value="#123456"');
});

it('renders the tracking script textareas with the stored script content', function () {
    update_option('custom_ga_loader_custom_script', '<script>console.log(1)</script>');

    ob_start();
    kotlinskidev_render_ga_script_field();
    $html = ob_get_clean();

    expect($html)->toContain('&lt;script&gt;console.log(1)&lt;/script&gt;');
});

it('renders nothing on the settings page for a user without manage_options', function () {
    wp_set_current_user(0);

    ob_start();
    kotlinskidev_render_settings_page();
    $html = ob_get_clean();

    expect($html)->toBe('');
});

it('renders the settings page with the active tab marked in the nav for an admin', function () {
    $admin_id = self::factory()->user->create(['role' => 'administrator']);
    wp_set_current_user($admin_id);
    $_GET['tab'] = 'breakpoints';

    ob_start();
    kotlinskidev_render_settings_page();
    $html = ob_get_clean();

    expect($html)->toContain('nav-tab-wrapper');
    expect($html)->toMatch('/nav-tab nav-tab-active"[^>]*>\s*Breakpoints/');

    wp_set_current_user(0);
});

it('enqueues the media uploader on the settings page while the login tab is active', function () {
    $_GET['tab'] = 'login';
    $GLOBALS['wp_scripts'] = null;

    kotlinskidev_enqueue_login_settings_media('settings_page_kotlinskidev-settings');

    expect(wp_script_is('media-editor', 'enqueued'))->toBeTrue();
});

it('does not enqueue the media uploader on an unrelated admin page', function () {
    $_GET['tab'] = 'login';
    $GLOBALS['wp_scripts'] = null;

    kotlinskidev_enqueue_login_settings_media('edit.php');

    expect(wp_script_is('media-editor', 'enqueued'))->toBeFalse();
});

it('does not enqueue the media uploader on the settings page when a different tab is active', function () {
    $_GET['tab'] = 'general';
    $GLOBALS['wp_scripts'] = null;

    kotlinskidev_enqueue_login_settings_media('settings_page_kotlinskidev-settings');

    expect(wp_script_is('media-editor', 'enqueued'))->toBeFalse();
});
