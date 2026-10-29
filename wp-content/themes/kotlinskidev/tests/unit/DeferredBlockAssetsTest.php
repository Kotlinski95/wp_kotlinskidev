<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/deferred-block-assets.php';

beforeEach(function () {
    Functions\when('apply_filters')->alias(fn ($tag, $default) => $default);
});

it('lists the deferrable block assets, with hero-carousel defaulting above the fold', function () {
    $assets = kotlinskidev_get_deferrable_block_assets();

    expect($assets)->toHaveKeys([
        'wpe/slider',
        'kotlinskidev/gallery-lightbox',
        'kotlinskidev/banner-carousel',
        'kotlinskidev/hero-carousel',
    ]);
    expect($assets['kotlinskidev/hero-carousel']['default_above_fold'])->toBeTrue();
});

it('maps each block to its above-the-fold default', function () {
    $defaults = kotlinskidev_get_above_fold_defaults();

    expect($defaults)->toBe([
        'wpe/slider' => false,
        'kotlinskidev/gallery-lightbox' => false,
        'kotlinskidev/banner-carousel' => false,
        'kotlinskidev/hero-carousel' => true,
    ]);
});

it('includes a block using its default when there is no per-block override', function () {
    $blocks = [['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []]];
    $defaults = ['kotlinskidev/hero-carousel' => true];

    expect(kotlinskidev_scan_blocks_for_above_fold($blocks, $defaults))->toBe(['kotlinskidev/hero-carousel']);
});

it('excludes a block whose default is true when explicitly overridden to false', function () {
    $blocks = [['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => ['kotlinskidevAboveFold' => false]]];
    $defaults = ['kotlinskidev/hero-carousel' => true];

    expect(kotlinskidev_scan_blocks_for_above_fold($blocks, $defaults))->toBe([]);
});

it('includes a block whose default is false when explicitly overridden to true', function () {
    $blocks = [['blockName' => 'wpe/slider', 'attrs' => ['kotlinskidevAboveFold' => true]]];
    $defaults = ['wpe/slider' => false];

    expect(kotlinskidev_scan_blocks_for_above_fold($blocks, $defaults))->toBe(['wpe/slider']);
});

it('ignores blocks that are not in the deferrable defaults map', function () {
    $blocks = [['blockName' => 'core/paragraph', 'attrs' => ['kotlinskidevAboveFold' => true]]];

    expect(kotlinskidev_scan_blocks_for_above_fold($blocks, ['wpe/slider' => false]))->toBe([]);
});

it('recurses into inner blocks to find above-fold matches', function () {
    $blocks = [
        [
            'blockName' => 'core/group',
            'attrs' => [],
            'innerBlocks' => [
                ['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []],
            ],
        ],
    ];
    $defaults = ['kotlinskidev/hero-carousel' => true];

    expect(kotlinskidev_scan_blocks_for_above_fold($blocks, $defaults))->toBe(['kotlinskidev/hero-carousel']);
});

it('deduplicates repeated matching block names', function () {
    $blocks = [
        ['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []],
        ['blockName' => 'kotlinskidev/hero-carousel', 'attrs' => []],
    ];
    $defaults = ['kotlinskidev/hero-carousel' => true];

    expect(array_values(kotlinskidev_scan_blocks_for_above_fold($blocks, $defaults)))
        ->toBe(['kotlinskidev/hero-carousel']);
});

it('returns no above-fold blocks outside of a singular view', function () {
    Functions\when('is_singular')->justReturn(false);

    expect(kotlinskidev_get_above_fold_block_names())->toBe([]);
});

it('defers the style handles of every block not marked above the fold', function () {
    $handles = kotlinskidev_get_deferred_block_style_handles();

    expect($handles)->toContain('wpe-slider-style');
    expect($handles)->toContain('kotlinskidev-gallery-lightbox-view-style');
    expect($handles)->toContain('kotlinskidev-banner-carousel-style');
    expect($handles)->toContain('kotlinskidev-hero-carousel-style');
});
