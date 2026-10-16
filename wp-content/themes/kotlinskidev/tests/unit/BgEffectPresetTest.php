<?php

use Brain\Monkey\Functions;

if (!function_exists('has_filter')) {
    function has_filter(...$args)
    {
        return false;
    }
}

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/polylang-content-resolution.php';
require_once __DIR__ . '/../../functions/background-effects/preset.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('sanitize_hex_color')->alias(function ($color) {
        return preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', (string) $color) ? $color : null;
    });
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
});

it('lists the five recognized effect types', function () {
    expect(kotlinskidev_bg_effect_types())->toBe([
        'gradient-shift',
        'aurora',
        'wave',
        'shimmer-text',
        'glow-border',
    ]);
});

it('returns the documented default duration for each effect type', function () {
    expect(kotlinskidev_bg_effect_default_duration('gradient-shift'))->toBe(15.0);
    expect(kotlinskidev_bg_effect_default_duration('aurora'))->toBe(12.0);
    expect(kotlinskidev_bg_effect_default_duration('wave'))->toBe(8.0);
    expect(kotlinskidev_bg_effect_default_duration('shimmer-text'))->toBe(6.0);
    expect(kotlinskidev_bg_effect_default_duration('glow-border'))->toBe(6.0);
});

it('sanitizes a color to the default when empty or invalid', function () {
    expect(kotlinskidev_sanitize_bg_effect_color(null, '#ffffff'))->toBe('#ffffff');
    expect(kotlinskidev_sanitize_bg_effect_color('javascript:alert(1)', '#ffffff'))->toBe('#ffffff');
});

it('accepts a valid hex color', function () {
    expect(kotlinskidev_sanitize_bg_effect_color('#abc123', '#ffffff'))->toBe('#abc123');
});

it('accepts a preset color variable', function () {
    expect(kotlinskidev_sanitize_bg_effect_color('var(--wp--preset--color--primary)', '#ffffff'))
        ->toBe('var(--wp--preset--color--primary)');
});

it('clamps a duration within its documented bounds', function () {
    expect(kotlinskidev_sanitize_bg_effect_number(-5, 1, 30, 15))->toBe(1.0);
    expect(kotlinskidev_sanitize_bg_effect_number(999, 1, 30, 15))->toBe(30.0);
    expect(kotlinskidev_sanitize_bg_effect_number('not-a-number', 1, 30, 15))->toBe(15.0);
});

it('returns an empty preset for an id of zero', function () {
    expect(kotlinskidev_build_bg_effect_preset(0))->toBe([]);
});

it('returns an empty preset for an unpublished post', function () {
    Functions\when('get_post_status')->justReturn('draft');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');

    expect(kotlinskidev_build_bg_effect_preset(5))->toBe([]);
});

it('returns an empty preset when the id does not belong to a kt_bg_effect_preset post', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('post');

    expect(kotlinskidev_build_bg_effect_preset(5))->toBe([]);
});

it('resolves a published preset with sanitized params, caching the result', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        [
            'blockName' => 'kotlinskidev/bg-effect-preset-settings',
            'attrs' => [
                'effectType' => 'aurora',
                'color1' => '#112233',
                'color2' => '',
                'color3' => 'javascript:alert(1)',
                'duration' => 20,
            ],
        ],
    ]);

    expect(kotlinskidev_build_bg_effect_preset(5))->toBe([
        'effectType' => 'aurora',
        'color1' => '#112233',
        'color2' => '',
        'color3' => '',
        'duration' => 20.0,
    ]);
});

it('falls back to gradient-shift for an unrecognized effect type', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        [
            'blockName' => 'kotlinskidev/bg-effect-preset-settings',
            'attrs' => ['effectType' => 'not-a-real-effect'],
        ],
    ]);

    $preset = kotlinskidev_build_bg_effect_preset(5);

    expect($preset['effectType'])->toBe('gradient-shift');
    expect($preset['duration'])->toBe(15.0);
});

it('returns an empty preset when the post has no settings block', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        ['blockName' => 'core/paragraph', 'attrs' => []],
    ]);

    expect(kotlinskidev_build_bg_effect_preset(5))->toBe([]);
});
