<?php

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../functions/position-z-index.php';

it('leaves content unchanged when neither attribute is set', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_apply_position_z_index_classes($content, ['attrs' => []]))->toBe($content);
});

it('leaves empty content unchanged', function () {
    $block = ['attrs' => ['kotlinskidevPosition' => 'absolute']];

    expect(kotlinskidev_apply_position_z_index_classes('', $block))->toBe('');
});

it('ignores an unrecognized position value', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['kotlinskidevPosition' => 'fixed-ish']];

    expect(kotlinskidev_apply_position_z_index_classes($content, $block))->toBe($content);
});

it('ignores an unrecognized z-index value', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['kotlinskidevZIndex' => '99']];

    expect(kotlinskidev_apply_position_z_index_classes($content, $block))->toBe($content);
});

it('merges a valid position class into an existing class attribute', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['kotlinskidevPosition' => 'relative']];

    $result = kotlinskidev_apply_position_z_index_classes($content, $block);

    expect($result)->toBe('<div class="wp-block kt-position-relative">Hi</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['kotlinskidevPosition' => 'absolute', 'kotlinskidevZIndex' => '2']];

    $result = kotlinskidev_apply_position_z_index_classes($content, $block);

    expect($result)->toBe('<div class="kt-position-absolute kt-z-2">Hi</div>');
});

it('applies the z-index class on its own, without a position value', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['kotlinskidevZIndex' => 'below']];

    $result = kotlinskidev_apply_position_z_index_classes($content, $block);

    expect($result)->toBe('<div class="wp-block kt-z-below">Hi</div>');
});

it('accepts every documented position value', function () {
    foreach (['static', 'relative', 'absolute', 'sticky'] as $position) {
        $result = kotlinskidev_apply_position_z_index_classes(
            '<div class="wp-block">Hi</div>',
            ['attrs' => ['kotlinskidevPosition' => $position]]
        );

        expect($result)->toContain('kt-position-' . $position);
    }
});

it('accepts every documented z-index value', function () {
    foreach (['below', '0', '1', '2', '3', '4', '5'] as $zIndex) {
        $result = kotlinskidev_apply_position_z_index_classes(
            '<div class="wp-block">Hi</div>',
            ['attrs' => ['kotlinskidevZIndex' => $zIndex]]
        );

        expect($result)->toContain('kt-z-' . $zIndex);
    }
});
