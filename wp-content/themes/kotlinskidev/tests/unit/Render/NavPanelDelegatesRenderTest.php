<?php

use Brain\Monkey\Functions;

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('wp_unique_id')->justReturn('7');
});

it('nav-search-panel delegates to the same markup as search-panel', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-search-panel/render.php',
        ['label' => 'Find Anything']
    );

    expect($html)->toContain('kt-search-panel__trigger');
    expect($html)->toContain('Find Anything');
});

it('nav-language-panel delegates to nothing when polylang is not active, same as language-panel', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/nav-language-panel/render.php',
        ['label' => '']
    );

    expect($html)->toBe('');
});
