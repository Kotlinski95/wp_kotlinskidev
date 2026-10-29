<?php

it('returns the default deferrable block registry', function () {
    $registry = kotlinskidev_get_deferrable_block_assets();

    expect($registry)->toHaveKey('kotlinskidev/hero-carousel');
    expect($registry['kotlinskidev/hero-carousel']['default_above_fold'])->toBeTrue();
    expect($registry['wpe/slider']['style'])->toBe(['wpe-slider-style']);
});

it('is filterable through the real WordPress hook system', function () {
    add_filter('kotlinskidev_deferrable_block_assets', function (array $registry) {
        $registry['kotlinskidev/test-block'] = array('style' => array('test-block-style'));

        return $registry;
    });

    $registry = kotlinskidev_get_deferrable_block_assets();

    expect($registry)->toHaveKey('kotlinskidev/test-block');
    expect($registry['kotlinskidev/test-block']['style'])->toBe(['test-block-style']);

    remove_all_filters('kotlinskidev_deferrable_block_assets');
});

it('derives per-block above-fold defaults from the registry', function () {
    $defaults = kotlinskidev_get_above_fold_defaults();

    expect($defaults['kotlinskidev/hero-carousel'])->toBeTrue();
    expect($defaults['wpe/slider'])->toBeFalse();
});
