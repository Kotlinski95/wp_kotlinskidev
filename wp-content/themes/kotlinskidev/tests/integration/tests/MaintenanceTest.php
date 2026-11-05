<?php

uses(Tests\Integration\TestCase::class);

afterEach(function () {
    delete_option('maintenance_mode_enabled');
    delete_option('maintenance_mode_facebook_url');
    delete_option('maintenance_mode_github_url');
    delete_option('maintenance_mode_background_image');
    delete_option('maintenance_mode_show_language_switcher');
    $GLOBALS['pagenow'] = 'index.php';
});

it('does not redirect when maintenance mode is disabled', function () {
    add_option('maintenance_mode_enabled', false);

    expect(maintenance_redirect())->toBeNull();
});

it('does not redirect a logged-in user even with maintenance mode enabled', function () {
    update_option('maintenance_mode_enabled', true);
    wp_set_current_user(self::factory()->user->create(['role' => 'subscriber']));

    expect(maintenance_redirect())->toBeNull();

    wp_set_current_user(0);
});

it('does not redirect a user who can edit_themes even with maintenance mode enabled', function () {
    update_option('maintenance_mode_enabled', true);
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));

    expect(maintenance_redirect())->toBeNull();

    wp_set_current_user(0);
});

it('does not redirect on the wp-login.php page even with maintenance mode enabled', function () {
    update_option('maintenance_mode_enabled', true);
    $GLOBALS['pagenow'] = 'wp-login.php';

    expect(maintenance_redirect())->toBeNull();
});

it('registers the maintenance settings admin page', function () {
    wp_set_current_user(self::factory()->user->create(['role' => 'administrator']));
    global $submenu;
    $before = $submenu['options-general.php'] ?? [];

    add_maintenance_mode_settings();

    $after = $submenu['options-general.php'] ?? [];

    expect(count($after))->toBeGreaterThan(count($before));

    wp_set_current_user(0);
});

it('returns null for the current maintenance language when Polylang is inactive', function () {
    expect(get_maintenance_current_language())->toBeNull();
});

it('returns the default value from get_maintenance_translation when no translation option is set', function () {
    expect(get_maintenance_translation('maintenance_mode_heading', 'Default heading'))->toBe('Default heading');
});

it('returns the stored option value from get_maintenance_translation when Polylang is inactive', function () {
    update_option('maintenance_mode_heading', 'Custom heading');

    expect(get_maintenance_translation('maintenance_mode_heading', 'Default heading'))->toBe('Custom heading');

    delete_option('maintenance_mode_heading');
});

it('returns a known flag url for a recognized language code', function () {
    expect(get_maintenance_flag_url('pl'))->toBe('https://flagcdn.com/w20/pl.png');
});

it('returns an empty string for an unrecognized language code', function () {
    expect(get_maintenance_flag_url('xx'))->toBe('');
});

it('builds a language-switch url that adds a lang query parameter', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/';

    expect(get_maintenance_language_url('pl'))->toBe(home_url('/some-page/') . '?lang=pl');
});

it('replaces an existing lang parameter rather than duplicating it', function () {
    $_SERVER['REQUEST_URI'] = '/some-page/?lang=en';

    expect(get_maintenance_language_url('pl'))->toBe(home_url('/some-page/') . '?lang=pl');
});

it('returns an empty language switcher when Polylang is inactive', function () {
    expect(get_maintenance_language_switcher())->toBe('');
});

it('returns no social media links when none are configured', function () {
    expect(get_maintenance_social_media_links())->toBe('');
});

it('renders a social icon link only for platforms with a configured url', function () {
    update_option('maintenance_mode_facebook_url', 'https://facebook.com/kotlinskidev');

    $html = get_maintenance_social_media_links();

    expect($html)->toContain('social-facebook');
    expect($html)->toContain('https://facebook.com/kotlinskidev');
    expect($html)->not->toContain('social-github');
});

it('outputs the checkbox state reflecting the stored maintenance_mode_enabled option', function () {
    update_option('maintenance_mode_enabled', true);

    ob_start();
    maintenance_mode_enabled_field();
    $html = ob_get_clean();

    expect($html)->toContain('checked');
});
