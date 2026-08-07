<?php

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../includes/hover-animations.php';

it('leaves content unchanged when there is no hover animation attribute', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_render_block_with_hover_animation($content, ['attrs' => []]))->toBe($content);
});

it('leaves content unchanged for an unrecognized animation name', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-not-real']];

    expect(kotlinskidev_render_block_with_hover_animation($content, $block))->toBe($content);
});

it('leaves empty content unchanged', function () {
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale']];

    expect(kotlinskidev_render_block_with_hover_animation('', $block))->toBe('');
});

it('merges a valid hover animation class into an existing class attribute', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="wp-block hover-scale">Hi</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});
