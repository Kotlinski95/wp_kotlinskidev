<?php

require_once __DIR__ . '/../../functions/text-gradient.php';

it('leaves content untouched when there is no text gradient set', function () {
    $content = '<p class="wp-block">Hi</p>';

    expect(kotlinskidev_apply_text_gradient_style($content, ['attrs' => []]))->toBe($content);
});

it('leaves content untouched when the block content is empty', function () {
    expect(kotlinskidev_apply_text_gradient_style('', ['attrs' => ['textGradient' => 'red']]))->toBe('');
});
