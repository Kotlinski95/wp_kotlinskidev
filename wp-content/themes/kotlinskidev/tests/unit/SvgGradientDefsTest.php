<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/svg-gradient-defs.php';

it('parses rgb color stops with percentage offsets out of a css gradient string', function () {
    $stops = kotlinskidev_parse_gradient_stops(
        'linear-gradient(to left, rgb(184, 150, 255) 0%, rgb(0, 246, 255) 60%, rgb(0, 255, 240) 100%)'
    );

    expect($stops)->toBe([
        ['color' => 'rgb(184, 150, 255)', 'offset' => '0%'],
        ['color' => 'rgb(0, 246, 255)', 'offset' => '60%'],
        ['color' => 'rgb(0, 255, 240)', 'offset' => '100%'],
    ]);
});

it('parses hex color stops too', function () {
    $stops = kotlinskidev_parse_gradient_stops('linear-gradient(90deg, #ff0000 0%, #00ff00 100%)');

    expect($stops)->toBe([
        ['color' => '#ff0000', 'offset' => '0%'],
        ['color' => '#00ff00', 'offset' => '100%'],
    ]);
});

it('returns an empty array for a gradient string with no percentage-anchored stops', function () {
    expect(kotlinskidev_parse_gradient_stops(''))->toBe([]);
    expect(kotlinskidev_parse_gradient_stops('none'))->toBe([]);
});

it('finds a theme gradient by slug, preferring a custom override over the theme default', function () {
    Functions\when('wp_get_global_settings')->justReturn([
        'theme'  => [
            ['slug' => 'fancy-text-dark', 'gradient' => 'linear-gradient(to left, rgb(1,1,1) 0%, rgb(2,2,2) 100%)'],
        ],
        'custom' => [
            ['slug' => 'fancy-text-dark', 'gradient' => 'linear-gradient(to left, rgb(9,9,9) 0%, rgb(8,8,8) 100%)'],
        ],
    ]);

    expect(kotlinskidev_get_theme_gradient('fancy-text-dark'))
        ->toBe('linear-gradient(to left, rgb(9,9,9) 0%, rgb(8,8,8) 100%)');
});

it('falls back to the theme-origin gradient when there is no custom override', function () {
    Functions\when('wp_get_global_settings')->justReturn([
        'theme' => [
            ['slug' => 'fancy-text-light', 'gradient' => 'linear-gradient(to left, rgb(3,3,3) 0%, rgb(4,4,4) 100%)'],
        ],
    ]);

    expect(kotlinskidev_get_theme_gradient('fancy-text-light'))
        ->toBe('linear-gradient(to left, rgb(3,3,3) 0%, rgb(4,4,4) 100%)');
});

it('returns an empty string when the slug is not registered anywhere', function () {
    Functions\when('wp_get_global_settings')->justReturn(['theme' => []]);

    expect(kotlinskidev_get_theme_gradient('does-not-exist'))->toBe('');
});

it('returns an empty string when wp_get_global_settings returns something unexpected', function () {
    Functions\when('wp_get_global_settings')->justReturn(null);

    expect(kotlinskidev_get_theme_gradient('fancy-text-dark'))->toBe('');
});

it('does not render the defs svg when either gradient slug is missing or unparsable', function () {
    Functions\when('wp_get_global_settings')->justReturn(['theme' => []]);

    ob_start();
    kotlinskidev_render_svg_gradient_defs();
    $output = ob_get_clean();

    expect($output)->toBe('');
});

it('renders both linearGradient defs with stops sourced from the theme gradients', function () {
    Functions\when('wp_get_global_settings')->justReturn([
        'theme' => [
            ['slug' => 'fancy-text-dark', 'gradient' => 'linear-gradient(to left, rgb(184, 150, 255) 0%, rgb(0, 246, 255) 100%)'],
            ['slug' => 'fancy-text-light', 'gradient' => 'linear-gradient(to left, rgb(132, 83, 210) 0%, rgb(0, 120, 194) 100%)'],
        ],
    ]);
    Functions\when('esc_attr')->alias(fn ($t) => $t);

    ob_start();
    kotlinskidev_render_svg_gradient_defs();
    $output = ob_get_clean();

    expect($output)->toContain('id="kt-icon-gradient-dark"');
    expect($output)->toContain('id="kt-icon-gradient-light"');
    expect($output)->toContain('stop-color="rgb(184, 150, 255)"');
    expect($output)->toContain('stop-color="rgb(132, 83, 210)"');
});
