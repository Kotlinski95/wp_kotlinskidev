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
require_once __DIR__ . '/../../functions/background-effects/render.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('sanitize_hex_color')->alias(function ($color) {
        return preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', (string) $color) ? $color : null;
    });
});

it('leaves the block content unchanged when backgroundEffectPresetId is missing', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_bg_effect_preset($content, ['attrs' => []]))->toBe($content);
});

it('leaves the block content unchanged when backgroundEffectPresetId is zero', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => 0]]))->toBe($content);
});

it('leaves empty block content unchanged', function () {
    expect(kotlinskidev_apply_bg_effect_preset('', ['attrs' => ['backgroundEffectPresetId' => 5]]))->toBe('');
});

it('leaves the block content unchanged when the preset does not resolve', function () {
    Functions\when('get_post_status')->justReturn('draft');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');

    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => 5]]))->toBe($content);
});

it('injects the effect class and CSS custom properties onto the root tag', function () {
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
                'color2' => '#445566',
                'color3' => '',
                'duration' => 20,
            ],
        ],
    ]);

    $content = '<div class="wp-block-group">Hi</div>';

    $result = kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => 5]]);

    expect($result)->toBe(
        '<div class="wp-block-group kt-bg-fx-aurora" style="--kt-bg-fx-duration:20s;--kt-bg-fx-color-1:#112233;--kt-bg-fx-color-2:#445566;">Hi</div>'
    );
});

it('replaces an already-baked manual effect class rather than stacking both', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        [
            'blockName' => 'kotlinskidev/bg-effect-preset-settings',
            'attrs' => ['effectType' => 'wave', 'color1' => '', 'color2' => '', 'color3' => '', 'duration' => 8],
        ],
    ]);

    $content = '<div class="wp-block-group kt-bg-fx-shimmer-text">Hi</div>';

    $result = kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => 5]]);

    expect($result)->toContain('kt-bg-fx-wave');
    expect($result)->not->toContain('kt-bg-fx-shimmer-text');
});

it('preserves an existing style attribute on the root tag', function () {
    Functions\when('get_post_status')->justReturn('publish');
    Functions\when('get_post_type')->justReturn('kt_bg_effect_preset');
    Functions\when('get_transient')->justReturn(false);
    Functions\when('set_transient')->justReturn(true);
    Functions\when('get_post_field')->justReturn('');
    Functions\when('parse_blocks')->justReturn([
        [
            'blockName' => 'kotlinskidev/bg-effect-preset-settings',
            'attrs' => ['effectType' => 'wave', 'color1' => '', 'color2' => '', 'color3' => '', 'duration' => 8],
        ],
    ]);

    $content = '<div class="wp-block" style="color:red;">Hi</div>';

    $result = kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => 5]]);

    expect($result)->toContain('color:red;--kt-bg-fx-duration:8s;');
});
