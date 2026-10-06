<?php

require_once __DIR__ . '/../../functions/responsive-width.php';
require_once __DIR__ . '/../../functions/responsive-height.php';

it('returns no declarations for an empty responsiveHeight array', function () {
    expect(kotlinskidev_build_responsive_height_declarations([]))->toBe([]);
});

it('builds a min-height custom property for a device', function () {
    $declarations = kotlinskidev_build_responsive_height_declarations([
        'desktop' => ['minHeight' => '430px'],
    ]);

    expect($declarations)->toBe(['--kt-min-height-desktop:430px']);
});

it('skips a device entirely when its settings are not an array', function () {
    $declarations = kotlinskidev_build_responsive_height_declarations([
        'desktop' => 'not-an-array',
    ]);

    expect($declarations)->toBe([]);
});

it('omits a device when its min-height value fails sanitization', function () {
    $declarations = kotlinskidev_build_responsive_height_declarations([
        'desktop' => ['minHeight' => 'not-a-length'],
    ]);

    expect($declarations)->toBe([]);
});

it('builds declarations across all three devices in order', function () {
    $declarations = kotlinskidev_build_responsive_height_declarations([
        'desktop' => ['minHeight' => '430px'],
        'tablet' => ['minHeight' => '300px'],
        'mobile' => ['minHeight' => 'none'],
    ]);

    expect($declarations)->toBe([
        '--kt-min-height-desktop:430px',
        '--kt-min-height-tablet:300px',
        '--kt-min-height-mobile:none',
    ]);
});

it('ignores a device with no minHeight key at all', function () {
    $declarations = kotlinskidev_build_responsive_height_declarations([
        'desktop' => [],
    ]);

    expect($declarations)->toBe([]);
});

it('returns no classes for an empty responsiveHeight array', function () {
    expect(kotlinskidev_build_responsive_height_classes([]))->toBe([]);
});

it('cascades the desktop class down to tablet and mobile when neither overrides it', function () {
    $classes = kotlinskidev_build_responsive_height_classes([
        'desktop' => ['minHeight' => '430px'],
    ]);

    expect($classes)->toBe([
        'kt-has-responsive-height-desktop',
        'kt-has-responsive-height-tablet',
        'kt-has-responsive-height-mobile',
    ]);
});

it('adds tablet and mobile classes when only those devices are set', function () {
    $classes = kotlinskidev_build_responsive_height_classes([
        'tablet' => ['minHeight' => '300px'],
    ]);

    expect($classes)->toBe(['kt-has-responsive-height-tablet', 'kt-has-responsive-height-mobile']);
});

it('does not add the desktop class when only mobile is set', function () {
    $classes = kotlinskidev_build_responsive_height_classes([
        'mobile' => ['minHeight' => '200px'],
    ]);

    expect($classes)->toBe(['kt-has-responsive-height-mobile']);
});
