<?php

require_once __DIR__ . '/../../functions/responsive-display.php';

it('leaves content unchanged when there is no responsiveDisplay attribute', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_add_responsive_display_attributes($content, ['attrs' => []]))->toBe($content);
});

it('leaves content unchanged when no device value is an array', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveDisplay' => ['desktop' => 'not-an-array']]];

    expect(kotlinskidev_add_responsive_display_attributes($content, $block))->toBe($content);
});

it('leaves content unchanged when every device property is empty', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['responsiveDisplay' => ['desktop' => [], 'tablet' => [], 'mobile' => []]]];

    expect(kotlinskidev_add_responsive_display_attributes($content, $block))->toBe($content);
});

it('leaves content unchanged when visibility is both', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_block_visibility($content, ['attrs' => ['visibility' => 'both']]))->toBe($content);
});

it('leaves content unchanged when block content is empty', function () {
    expect(kotlinskidev_apply_block_visibility('', ['attrs' => ['visibility' => 'desktop']]))->toBe('');
});

it('leaves content unchanged when there is no visibility attribute at all', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_block_visibility($content, ['attrs' => []]))->toBe($content);
});
