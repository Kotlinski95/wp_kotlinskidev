<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/theme-switcher.php';

it('renders nothing when theme switching is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $name === 'kotlinskidev_theme_switching_enabled' ? false : $default);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/theme-switcher/render.php',
        []
    );

    expect($html)->toBe('');
});

it('renders the theme switcher button when switching is enabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('get_template_directory')->justReturn('/nonexistent-theme-dir');
    Functions\when('esc_attr__')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/theme-switcher/render.php',
        []
    );

    expect($html)->toContain('class="theme-switcher kt-tooltip kt-tooltip--below"');
    expect($html)->toContain('id="theme-toggle"');
});

it('sets the tooltip text and aria-label to the same translated string', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('get_template_directory')->justReturn('/nonexistent-theme-dir');
    Functions\when('esc_attr__')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/theme-switcher/render.php',
        []
    );

    expect($html)->toContain('aria-label="Toggle light and dark theme"');
    expect($html)->toContain('data-tooltip="Toggle light and dark theme"');
});
