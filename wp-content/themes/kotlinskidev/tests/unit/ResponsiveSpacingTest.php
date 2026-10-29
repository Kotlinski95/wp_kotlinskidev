<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/breakpoints.php';
require_once __DIR__ . '/../../functions/responsive-spacing.php';

beforeEach(function () {
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
    Functions\when('wp_json_encode')->alias('json_encode');
});

it('strips empty and zero-px values regardless of sign allowance', function () {
    expect(kotlinskidev_sanitize_spacing_length('', false))->toBe('');
    expect(kotlinskidev_sanitize_spacing_length('0px', false))->toBe('');
    expect(kotlinskidev_sanitize_spacing_length('0px', true))->toBe('');
});

it('rejects a negative value when negatives are not allowed', function () {
    expect(kotlinskidev_sanitize_spacing_length('-10px', false))->toBe('');
});

it('accepts a negative value when negatives are allowed', function () {
    expect(kotlinskidev_sanitize_spacing_length('-10px', true))->toBe('-10px');
});

it('accepts positive values with supported units regardless of sign allowance', function () {
    foreach (['10px', '5%', '1.5rem'] as $value) {
        expect(kotlinskidev_sanitize_spacing_length($value, false))->toBe($value);
        expect(kotlinskidev_sanitize_spacing_length($value, true))->toBe($value);
    }
});

it('rejects unsupported units', function () {
    expect(kotlinskidev_sanitize_spacing_length('10pt', false))->toBe('');
});

it('collects only the valid, non-zero sides for a set device/type', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'desktopPadding' => ['top' => '10px', 'right' => '0px', 'bottom' => '', 'left' => '-5px'],
    ]);

    expect($values)->toBe([
        'desktop' => ['padding' => ['top' => '10px']],
    ]);
});

it('allows negative values for margin but not padding', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'desktopMargin' => ['top' => '-5px'],
        'desktopPadding' => ['top' => '-5px'],
    ]);

    expect($values)->toBe([
        'desktop' => ['margin' => ['top' => '-5px']],
    ]);
});

it('skips a device/type entirely when its value is not an array', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'tabletPadding' => 'not-an-array',
    ]);

    expect($values)->toBe([]);
});

it('returns an empty array when there are no responsive-spacing attributes at all', function () {
    expect(kotlinskidev_collect_responsive_spacing_values([]))->toBe([]);
});

it('collects across multiple devices and types independently', function () {
    $values = kotlinskidev_collect_responsive_spacing_values([
        'desktopPadding' => ['top' => '10px'],
        'mobileMargin' => ['bottom' => '2rem'],
    ]);

    expect($values)->toBe([
        'desktop' => ['padding' => ['top' => '10px']],
        'mobile' => ['margin' => ['bottom' => '2rem']],
    ]);
});

it('builds a stable, deterministic class name from the collected values', function () {
    $values = ['desktop' => ['padding' => ['top' => '10px']]];

    $class = kotlinskidev_responsive_spacing_class($values);

    expect($class)->toBe('kt-rspc-' . substr(md5(json_encode($values)), 0, 10));
});

it('produces different class names for different values', function () {
    $classA = kotlinskidev_responsive_spacing_class(['desktop' => ['padding' => ['top' => '10px']]]);
    $classB = kotlinskidev_responsive_spacing_class(['desktop' => ['padding' => ['top' => '20px']]]);

    expect($classA)->not->toBe($classB);
});

it('returns an empty string when there are no values to build css from', function () {
    expect(kotlinskidev_build_responsive_spacing_css('kt-rspc-abc', []))->toBe('');
});

it('builds a single media-scoped rule combining padding and margin declarations', function () {
    $css = kotlinskidev_build_responsive_spacing_css('kt-rspc-abc', [
        'desktop' => [
            'padding' => ['top' => '10px'],
            'margin' => ['bottom' => '2rem'],
        ],
    ]);

    expect($css)->toBe('@media (min-width: 1024px){.kt-rspc-abc{padding-top:10px !important;margin-bottom:2rem !important;}}');
});

it('emits one media block per device with values', function () {
    $css = kotlinskidev_build_responsive_spacing_css('kt-rspc-abc', [
        'desktop' => ['padding' => ['top' => '10px']],
        'mobile' => ['margin' => ['bottom' => '2rem']],
    ]);

    expect($css)->toBe(
        '@media (min-width: 1024px){.kt-rspc-abc{padding-top:10px !important;}}'
        . '@media (max-width: 781px){.kt-rspc-abc{margin-bottom:2rem !important;}}'
    );
});

it('skips a device whose padding/margin sub-arrays are both empty', function () {
    $css = kotlinskidev_build_responsive_spacing_css('kt-rspc-abc', [
        'tablet' => ['padding' => []],
    ]);

    expect($css)->toBe('');
});
