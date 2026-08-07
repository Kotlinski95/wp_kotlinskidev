<?php

use Brain\Monkey\Functions;

function kotlinskidev_simple_grid_render(array $attributes, int $innerBlockCount, string $content = ''): string
{
    $block = (object) ['inner_blocks' => array_fill(0, $innerBlockCount, (object) [])];

    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/simple-grid/render.php',
        $attributes,
        $content,
        $block,
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"'
    );
});

it('sets the column count css variable from the number of inner blocks', function () {
    $html = kotlinskidev_simple_grid_render([], 3);

    expect($html)->toContain('--kt-sg-cols:3');
});

it('never lets the column count drop below 1, even with no inner blocks', function () {
    $html = kotlinskidev_simple_grid_render([], 0);

    expect($html)->toContain('--kt-sg-cols:1');
});

it('adds a mobile column override, clamped to the desktop column count', function () {
    $html = kotlinskidev_simple_grid_render(['mobileColumns' => 2], 3);

    expect($html)->toContain('--kt-sg-cols-mobile:2');
});

it('clamps a mobile column override that exceeds the desktop count', function () {
    $html = kotlinskidev_simple_grid_render(['mobileColumns' => 10], 3);

    expect($html)->toContain('--kt-sg-cols-mobile:3');
});

it('omits the mobile override entirely when not configured', function () {
    $html = kotlinskidev_simple_grid_render([], 3);

    expect($html)->not->toContain('--kt-sg-cols-mobile');
});

it('adds a tablet column override, clamped to the desktop column count', function () {
    $html = kotlinskidev_simple_grid_render(['tabletColumns' => 2], 4);

    expect($html)->toContain('--kt-sg-cols-tablet:2');
});

it('renders the inner block content', function () {
    $html = kotlinskidev_simple_grid_render([], 2, '<div>Item</div>');

    expect($html)->toContain('<div>Item</div>');
});
