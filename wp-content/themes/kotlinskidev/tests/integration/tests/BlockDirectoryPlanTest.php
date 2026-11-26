<?php

uses(Tests\Integration\TestCase::class);

it('points every planned block directory at a block.json', function () {
    $flattened = [];
    foreach (kotlinskidev_block_directory_plan() as $entry) {
        array_push($flattened, ...(is_string($entry) ? [$entry] : $entry['blocks']));
    }

    expect($flattened)->toHaveCount(80);
    foreach ($flattened as $directory) {
        expect(file_exists(get_template_directory() . '/src/blocks/' . $directory . '/block.json'))->toBeTrue($directory);
    }
});

it('gates the optional block groups behind their feature toggles in a fixed order', function () {
    $gates = array_map(
        static fn (array $entry): string => $entry['feature'],
        array_values(array_filter(kotlinskidev_block_directory_plan(), 'is_array'))
    );

    expect($gates)->toBe(['article_cards', 'project_cards', 'offers', 'article_toc', 'certificates', 'canvas_backgrounds']);
});

it('lists a gated block directory only while its feature is enabled', function () {
    $enabled = kotlinskidev_enabled_block_directories();
    $gated   = array_values(array_filter(kotlinskidev_block_directory_plan(), 'is_array'));

    foreach ($gated as $group) {
        $present = array_intersect($group['blocks'], $enabled) === $group['blocks'];
        expect($present)->toBe((bool) kotlinskidev_feature_enabled($group['feature']), $group['feature']);
    }
});

it('registers the always-on blocks with the block registry', function () {
    $registered = WP_Block_Type_Registry::get_instance();

    expect($registered->is_registered('kotlinskidev/banner-carousel'))->toBeTrue();
    expect($registered->is_registered('kotlinskidev/bg-effect-preset-settings'))->toBeTrue();
});
