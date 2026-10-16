<?php

uses(Tests\Integration\TestCase::class);

it('registers kt_canvas_scene as a translatable post type for polylang', function () {
    $post_types = kotlinskidev_pll_register_canvas_scenes(['post' => 'post'], false);

    expect($post_types)->toHaveKey('kt_canvas_scene');
});

it('leaves the block untouched when canvasSceneId is missing or zero', function () {
    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => []]);
    expect($html)->toBe('<div class="wp-block">x</div>');

    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => ['canvasSceneId' => 0]]);
    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced scene does not exist', function () {
    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => ['canvasSceneId' => 999999]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced scene is unpublished', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'draft',
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-noise {"opacity":0.1} /-->',
    ]);

    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => ['canvasSceneId' => $scene_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced id belongs to a different post type', function () {
    $post_id = self::factory()->post->create(['post_type' => 'post', 'post_status' => 'publish']);

    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => ['canvasSceneId' => $post_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the scene has no recognized layer blocks', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:paragraph --><p>Not a layer</p><!-- /wp:paragraph -->',
    ]);

    $html = kotlinskidev_apply_canvas_background('<div class="wp-block">x</div>', ['attrs' => ['canvasSceneId' => $scene_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('injects the canvas recipe markup right after the opening tag, across varied wrapper tags', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-gradient {"angleDeg":90,"speed":0.5} /-->'
            . '<!-- wp:kotlinskidev/canvas-layer-blob {"count":4} /-->',
    ]);

    foreach (['div', 'section', 'figure'] as $tag) {
        $content = "<$tag class=\"wrapper\">content</$tag>";
        $html = kotlinskidev_apply_canvas_background($content, ['attrs' => ['canvasSceneId' => $scene_id]]);

        expect($html)->toStartWith("<$tag class=\"wrapper kt-has-canvas-bg\"><div class=\"kt-canvas-bg\" data-canvas-recipe=\"");
        expect(substr_count($html, 'kt-canvas-bg'))->toBe(1);
    }
});

it('clamps a malicious angle value and drops an unrecognized layer when building the real recipe', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-gradient {"angleDeg":99999} /-->'
            . '<!-- wp:core/paragraph --><p>x</p><!-- /wp:core/paragraph -->',
    ]);

    $recipe = kotlinskidev_build_canvas_recipe($scene_id);

    expect($recipe['layers'])->toHaveCount(1);
    expect($recipe['layers'][0]['type'])->toBe('gradient');
    expect($recipe['layers'][0]['params']['angleDeg'])->toBe(360.0);
});

it('resolves and renders through the real render_block pipeline on a registered dynamic block', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-noise {"opacity":0.2} /-->',
    ]);

    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant'       => 'bar',
            'canvasSceneId' => $scene_id,
        ]) . ' /-->'
    )[0]);

    expect($html)->toContain('kt-canvas-bg');
    expect($html)->toContain('data-canvas-recipe=');
});

it('invalidates the cached recipe when the scene post is updated', function () {
    $scene_id = self::factory()->post->create([
        'post_type'    => 'kt_canvas_scene',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-blob {"count":2} /-->',
    ]);

    $first = kotlinskidev_build_canvas_recipe($scene_id);
    expect($first['layers'][0]['params']['count'])->toBe(2);

    wp_update_post([
        'ID'           => $scene_id,
        'post_content' => '<!-- wp:kotlinskidev/canvas-layer-blob {"count":6} /-->',
    ]);

    $second = kotlinskidev_build_canvas_recipe($scene_id);
    expect($second['layers'][0]['params']['count'])->toBe(6);
});
