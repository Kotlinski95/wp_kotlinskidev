<?php

use Brain\Monkey\Functions;

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

if (!function_exists('add_action')) {
    function add_action(...$args)
    {
        return true;
    }
}

require_once __DIR__ . '/../../includes/i18n.php';

beforeEach(function () {
    Functions\when('__')->alias(fn ($t) => $t);
});

it('resolves a known translation group', function () {
    $navigation = kotlinskidev_get_translations_group('navigation');

    expect($navigation['menu']['toggle'])->toBe('Toggle navigation menu');
});

it('returns null for an unknown translation group', function () {
    expect(kotlinskidev_get_translations_group('not-a-real-group'))->toBeNull();
});

it('resolves a nested key via dot notation', function () {
    expect(kotlinskidev_get_string('forms', 'validation.required'))->toBe('This field is required.');
});

it('returns the default when the nested key does not exist', function () {
    expect(kotlinskidev_get_string('forms', 'validation.missing', 'fallback'))->toBe('fallback');
});

it('returns the default when the group does not exist', function () {
    expect(kotlinskidev_get_string('not-a-real-group', 'anything', 'fallback'))->toBe('fallback');
});

it('kotlinskidev__ delegates to get_string', function () {
    expect(kotlinskidev__('general', 'loading'))->toBe('Loading...');
});

it('kotlinskidev_e echoes the escaped translated string', function () {
    Functions\when('esc_html')->alias(fn ($t) => $t);

    ob_start();
    kotlinskidev_e('general', 'loading');

    expect(ob_get_clean())->toBe('Loading...');
});

it('collects every translation group under kotlinskidev_get_all_translations', function () {
    $all = kotlinskidev_get_all_translations();

    expect(array_keys($all))->toBe([
        'navigation',
        'forms',
        'general',
        'accessibility',
        'cookieConsent',
        'lightbox',
        'scrollAnimations',
        'themeSwitcher',
    ]);
});
