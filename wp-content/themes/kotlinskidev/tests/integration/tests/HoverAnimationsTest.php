<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when no hover animation attribute is set', function () {
    $html = kotlinskidev_render_block_with_hover_animation('<div class="wp-block">x</div>', ['attrs' => []]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched for an unrecognized animation name', function () {
    $html = kotlinskidev_render_block_with_hover_animation('<div class="wp-block">x</div>', ['attrs' => ['hoverAnimation' => 'hover-explode']]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('appends a valid hover animation class to an existing class attribute', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div class="wp-block">x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-jump']]
    );

    expect($html)->toBe('<div class="wp-block hover-jump">x</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div>x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-scale']]
    );

    expect($html)->toBe('<div class="hover-scale">x</div>');
});

it('accepts every documented hover animation name', function () {
    foreach ([
        'hover-jump', 'hover-jump-subtle', 'hover-jump-smooth', 'hover-jump-strong',
        'hover-jump-shadow', 'hover-scale', 'hover-fade', 'hover-rotate', 'hover-bounce',
    ] as $animation) {
        $html = kotlinskidev_render_block_with_hover_animation(
            '<div class="wp-block">x</div>',
            ['attrs' => ['hoverAnimation' => $animation]]
        );

        expect($html)->toContain($animation);
    }
});
