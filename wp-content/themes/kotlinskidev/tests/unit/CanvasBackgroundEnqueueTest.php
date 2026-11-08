<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/canvas/enqueue.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
    Functions\when('get_option')->alias(fn ($name, $default) => $default);
});

it('finds no canvas scene block in an empty list', function () {
    expect(kotlinskidev_scan_blocks_for_canvas_scene([]))->toBeFalse();
});

it('finds no canvas scene block when canvasSceneId is zero or missing', function () {
    $blocks = [
        ['blockName' => 'core/group', 'attrs' => []],
        ['blockName' => 'core/paragraph', 'attrs' => ['canvasSceneId' => 0]],
    ];

    expect(kotlinskidev_scan_blocks_for_canvas_scene($blocks))->toBeFalse();
});

it('finds a canvas scene block at the top level', function () {
    $blocks = [
        ['blockName' => 'core/group', 'attrs' => ['canvasSceneId' => 5]],
    ];

    expect(kotlinskidev_scan_blocks_for_canvas_scene($blocks))->toBeTrue();
});

it('finds a canvas scene block nested inside innerBlocks', function () {
    $blocks = [
        [
            'blockName' => 'core/group',
            'attrs' => [],
            'innerBlocks' => [
                ['blockName' => 'core/paragraph', 'attrs' => ['canvasSceneId' => 9]],
            ],
        ],
    ];

    expect(kotlinskidev_scan_blocks_for_canvas_scene($blocks))->toBeTrue();
});

it('does not enqueue the script when the feature toggle is disabled', function () {
    Functions\when('get_option')->alias(fn ($name, $default) => ['project_cards']);
    Functions\when('is_singular')->justReturn(true);
    $wpEnqueueScriptCalled = false;
    Functions\when('wp_enqueue_script')->alias(function () use (&$wpEnqueueScriptCalled) {
        $wpEnqueueScriptCalled = true;
    });

    kotlinskidev_enqueue_canvas_background_script();

    expect($wpEnqueueScriptCalled)->toBeFalse();
});

it('does not enqueue the script outside a singular post', function () {
    Functions\when('is_singular')->justReturn(false);
    $wpEnqueueScriptCalled = false;
    Functions\when('wp_enqueue_script')->alias(function () use (&$wpEnqueueScriptCalled) {
        $wpEnqueueScriptCalled = true;
    });

    kotlinskidev_enqueue_canvas_background_script();

    expect($wpEnqueueScriptCalled)->toBeFalse();
});
