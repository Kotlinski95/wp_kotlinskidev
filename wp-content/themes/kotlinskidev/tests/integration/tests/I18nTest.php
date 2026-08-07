<?php

uses(Tests\Integration\TestCase::class);

it('loads the theme textdomain during theme setup', function () {
    expect(is_textdomain_loaded(KOTLINSKIDEV_TEXT_DOMAIN))->toBeTrue();
});

it('returns all eight translation groups', function () {
    $translations = kotlinskidev_get_all_translations();

    expect($translations)->toHaveKeys([
        'navigation', 'forms', 'general', 'accessibility',
        'cookieConsent', 'lightbox', 'scrollAnimations', 'themeSwitcher',
    ]);
});

it('returns a real translated string for a known navigation key', function () {
    $translations = kotlinskidev_get_navigation_translations();

    expect($translations['menu']['toggle'])->toBe('Toggle navigation menu');
});

it('returns null for an unknown translation group', function () {
    expect(kotlinskidev_get_translations_group('does_not_exist'))->toBeNull();
});

it('returns a real translation group by name', function () {
    expect(kotlinskidev_get_translations_group('general'))->toBe(kotlinskidev_get_general_translations());
});

it('resolves a dot-notation key to a nested translation string', function () {
    expect(kotlinskidev_get_string('navigation', 'menu.toggle'))->toBe('Toggle navigation menu');
});

it('falls back to the given default for an unknown group', function () {
    expect(kotlinskidev_get_string('does_not_exist', 'anything', 'fallback'))->toBe('fallback');
});

it('falls back to the given default for an unknown key within a real group', function () {
    expect(kotlinskidev_get_string('navigation', 'menu.does_not_exist', 'fallback'))->toBe('fallback');
});

it('falls back to the given default for a partially valid dot-notation path', function () {
    expect(kotlinskidev_get_string('navigation', 'menu.toggle.tooDeep', 'fallback'))->toBe('fallback');
});

it('the kotlinskidev__ helper mirrors kotlinskidev_get_string', function () {
    expect(kotlinskidev__('general', 'loading'))->toBe(kotlinskidev_get_string('general', 'loading'));
});

it('the kotlinskidev_e helper echoes the escaped translated string', function () {
    ob_start();
    kotlinskidev_e('general', 'loading');
    $output = ob_get_clean();

    expect($output)->toBe('Loading...');
});

it('localizes the i18n object onto whichever known script handle is registered', function () {
    $handles = ['wp-typescript', 'kotlinskidev-banner-carousel', 'kotlinskidev-main', 'theme-scripts', 'main-js'];
    $registered_by_this_test = null;

    if (!array_filter($handles, fn ($handle) => wp_script_is($handle, 'registered'))) {
        wp_register_script('kotlinskidev-main', 'https://example.com/main.js', [], null);
        $registered_by_this_test = 'kotlinskidev-main';
    }

    kotlinskidev_localize_scripts();

    $localized_data = array_filter(
        array_map(fn ($handle) => wp_scripts()->get_data($handle, 'data'), $handles)
    );

    expect($localized_data)->not->toBe([]);
    expect(implode('', $localized_data))->toContain('Toggle navigation menu');

    if ($registered_by_this_test) {
        wp_deregister_script($registered_by_this_test);
    }
});
