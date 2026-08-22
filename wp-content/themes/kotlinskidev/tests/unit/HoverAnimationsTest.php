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

it('merges primary and additional effect classes together', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['hover-scale', 'hover-rotate']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump hover-scale hover-rotate">Hi</div>');
});

it('drops unrecognized values from hoverAnimationExtra', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['not-real']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});

it('deduplicates a value repeated between primary and extra', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['hover-jump']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});

it('adds the opacity class when hoverOpacityEnabled is set, even with no animation picked', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverOpacityEnabled' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="has-hover-opacity">Hi</div>');
});

it('combines an animation with the opacity class', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale', 'hoverOpacityEnabled' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-scale has-hover-opacity">Hi</div>');
});
