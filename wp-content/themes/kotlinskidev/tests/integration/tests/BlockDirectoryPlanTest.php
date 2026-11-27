<?php

uses(Tests\Integration\TestCase::class);

it('plans each block directory once and backs it with a block.json', function () {
    $planned = [];
    foreach (kotlinskidev_block_directory_plan() as $entry) {
        array_push($planned, ...(is_string($entry) ? [$entry] : $entry['blocks']));
    }

    expect($planned)->toBe(array_values(array_unique($planned)));
    foreach ($planned as $directory) {
        expect(file_exists(get_template_directory() . '/src/blocks/' . $directory . '/block.json'))->toBeTrue($directory);
    }
});

it('registers every shipped block.json that is not planned through another module', function () {
    $planned = [];
    foreach (kotlinskidev_block_directory_plan() as $entry) {
        array_push($planned, ...(is_string($entry) ? [$entry] : $entry['blocks']));
    }

    $root     = get_template_directory() . '/src/blocks/';
    $registry = WP_Block_Type_Registry::get_instance();
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file->getFilename() !== 'block.json') {
            continue;
        }
        $directory = str_replace('\\', '/', substr($file->getPath(), strlen($root)));
        if (in_array($directory, $planned, true)) {
            continue;
        }
        $name = json_decode(file_get_contents($file->getPathname()), true)['name'];
        expect($registry->is_registered($name))->toBeTrue($directory);
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
