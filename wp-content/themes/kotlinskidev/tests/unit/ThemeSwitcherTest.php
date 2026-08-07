<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/theme-switcher.php';

it('defaults to enabled with auto mode when no options are saved', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);

    expect(kotlinskidev_theme_switcher_config())->toBe(['enabled' => true, 'defaultMode' => 'auto']);
});

it('passes through a valid saved mode', function () {
    Functions\when('get_option')->alias(function ($name, $default) {
        return $name === 'kotlinskidev_theme_default_mode' ? 'dark' : $default;
    });

    expect(kotlinskidev_theme_switcher_config()['defaultMode'])->toBe('dark');
});

it('falls back to auto for an invalid saved mode', function () {
    Functions\when('get_option')->alias(function ($name, $default) {
        return $name === 'kotlinskidev_theme_default_mode' ? 'invalid-mode' : $default;
    });

    expect(kotlinskidev_theme_switcher_config()['defaultMode'])->toBe('auto');
});

it('reflects the switching-enabled option as a boolean', function () {
    Functions\when('get_option')->alias(function ($name, $default) {
        return $name === 'kotlinskidev_theme_switching_enabled' ? '0' : $default;
    });

    expect(kotlinskidev_theme_switcher_config()['enabled'])->toBeFalse();
});
