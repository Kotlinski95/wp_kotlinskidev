<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/above-fold-media.php';

beforeEach(function () {
    Functions\when('wp_high_priority_element_flag')->justReturn(true);
    Functions\when('wp_increase_content_media_count')->justReturn(1);
    Functions\when('wp_omit_loading_attr_threshold')->justReturn(3);
    kotlinskidev_reset_above_fold_state();
});

it('lists the supported media blocks with their defaults', function () {
    expect(kotlinskidev_get_above_fold_media_blocks())->toBe([
        'core/image' => false,
        'core/cover' => false,
        'core/video' => false,
        'kotlinskidev/hero-carousel' => true,
        'kotlinskidev/device-frame' => false,
    ]);
});

it('defaults core media blocks to below the fold', function () {
    foreach (['core/image', 'core/cover', 'core/video'] as $name) {
        expect(kotlinskidev_is_above_fold(['blockName' => $name, 'attrs' => []]))->toBeFalse();
    }
});

it('prefers the kotlinskidevAboveFold attribute over everything else', function () {
    expect(kotlinskidev_is_above_fold(['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => true, 'kotlinskidevSkipLazy' => false]]))->toBeTrue();
    expect(kotlinskidev_is_above_fold(['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => false, 'kotlinskidevSkipLazy' => true]]))->toBeFalse();
});

it('falls back to the legacy kotlinskidevSkipLazy attribute', function () {
    expect(kotlinskidev_is_above_fold(['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]]))->toBeTrue();
});

it('treats a device frame as above the fold when its legacy loading or priority says so', function () {
    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/device-frame', 'attrs' => ['loading' => 'eager']]))->toBeTrue();
    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/device-frame', 'attrs' => ['fetchPriority' => 'high']]))->toBeTrue();
    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/device-frame', 'attrs' => ['loading' => 'lazy', 'fetchPriority' => 'auto']]))->toBeFalse();
});

it('lets an explicit toggle override the device frame legacy attributes', function () {
    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/device-frame', 'attrs' => ['loading' => 'eager', 'kotlinskidevAboveFold' => false]]))->toBeFalse();
});

it('only defaults the first hero-carousel to above the fold', function () {
    $carousel = ['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []];

    expect(kotlinskidev_is_above_fold($carousel))->toBeTrue();
    expect(kotlinskidev_is_above_fold($carousel))->toBeFalse();
    expect(kotlinskidev_is_above_fold($carousel))->toBeFalse();
});

it('lets a later hero-carousel opt in with its own toggle', function () {
    kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []]);

    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => ['kotlinskidevAboveFold' => true]]))->toBeTrue();
});

it('does not default a lazy-loaded first hero-carousel to above the fold', function () {
    expect(kotlinskidev_is_above_fold(['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => ['lazyLoad' => true]]))->toBeFalse();
});

it('bakes the resolved flag into the hero-carousel block attributes', function () {
    $first = kotlinskidev_resolve_hero_carousel_above_fold(['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []]);
    $second = kotlinskidev_resolve_hero_carousel_above_fold(['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []]);

    expect($first['attrs']['kotlinskidevAboveFold'])->toBeTrue();
    expect($second['attrs']['kotlinskidevAboveFold'])->toBeFalse();
});

it('leaves other blocks untouched when resolving the hero-carousel flag', function () {
    $block = ['blockName' => 'core/image', 'attrs' => []];

    expect(kotlinskidev_resolve_hero_carousel_above_fold($block))->toBe($block);
});
