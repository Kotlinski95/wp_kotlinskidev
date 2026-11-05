<?php

require_once __DIR__ . '/../../functions/border-gradient.php';

it('excludes the button block from border gradients', function () {
    expect(kotlinskidev_border_gradient_excluded_blocks())->toBe(['kotlinskidev/button']);
});

it('leaves content untouched when there is no border gradient set', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_border_gradient_style($content, ['attrs' => []]))->toBe($content);
});

it('leaves content untouched when the block content is empty', function () {
    expect(kotlinskidev_apply_border_gradient_style('', ['attrs' => ['borderGradient' => 'red']]))->toBe('');
});

it('leaves excluded blocks untouched even with a border gradient set', function () {
    $content = '<a class="wp-block-button__link">Click</a>';
    $block = ['blockName' => 'kotlinskidev/button', 'attrs' => ['borderGradient' => 'linear-gradient(red, blue)']];

    expect(kotlinskidev_apply_border_gradient_style($content, $block))->toBe($content);
});
