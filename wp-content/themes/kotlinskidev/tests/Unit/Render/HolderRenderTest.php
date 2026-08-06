<?php

use Brain\Monkey\Functions;

it('wraps the inner block content with the kt-holder wrapper attributes', function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '"'
    );

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/holder/render.php',
        [],
        '<p>Inner content</p>'
    );

    expect($html)->toContain('<div class="kt-holder">');
    expect($html)->toContain('<p>Inner content</p>');
});
