<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when backgroundEffectPresetId is missing or zero', function () {
    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => []]);
    expect($html)->toBe('<div class="wp-block">x</div>');

    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => ['backgroundEffectPresetId' => 0]]);
    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced preset does not exist', function () {
    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => ['backgroundEffectPresetId' => 999999]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced preset is unpublished', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'draft',
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings {"effectType":"aurora"} /-->',
    ]);

    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => ['backgroundEffectPresetId' => $preset_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the referenced id belongs to a different post type', function () {
    $post_id = self::factory()->post->create(['post_type' => 'post', 'post_status' => 'publish']);

    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => ['backgroundEffectPresetId' => $post_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched when the preset has no settings block', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:paragraph --><p>Not a settings block</p><!-- /wp:paragraph -->',
    ]);

    $html = kotlinskidev_apply_bg_effect_preset('<div class="wp-block">x</div>', ['attrs' => ['backgroundEffectPresetId' => $preset_id]]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('injects the effect class and CSS custom properties right onto the root tag, across varied wrapper tags', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings ' . wp_json_encode([
            'effectType' => 'wave',
            'color1'     => '#112233',
            'duration'   => 10,
        ]) . ' /-->',
    ]);

    foreach (['div', 'section', 'figure'] as $tag) {
        $content = "<$tag class=\"wrapper\">content</$tag>";
        $html = kotlinskidev_apply_bg_effect_preset($content, ['attrs' => ['backgroundEffectPresetId' => $preset_id]]);

        expect($html)->toContain('class="wrapper kt-bg-fx-wave"');
        expect($html)->toContain('style="--kt-bg-fx-duration:10s;--kt-bg-fx-color-1:#112233;"');
    }
});

it('clamps a malicious duration and falls back to gradient-shift for an unrecognized effect type when building the real preset', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings ' . wp_json_encode([
            'effectType' => 'not-a-real-effect',
            'duration'   => 99999,
        ]) . ' /-->',
    ]);

    $preset = kotlinskidev_build_bg_effect_preset($preset_id);

    expect($preset['effectType'])->toBe('gradient-shift');
    expect($preset['duration'])->toBe(30.0);
});

it('replaces an already-baked manual effect class rather than stacking both, through the real render_block pipeline', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings {"effectType":"glow-border"} /-->',
    ]);

    $html = render_block(parse_blocks(
        '<!-- wp:group ' . wp_json_encode([
            'className'              => 'kt-bg-fx-shimmer-text',
            'backgroundEffectPresetId' => $preset_id,
        ]) . ' --><div class="wp-block-group kt-bg-fx-shimmer-text">x</div><!-- /wp:group -->'
    )[0]);

    expect($html)->toContain('kt-bg-fx-glow-border');
    expect($html)->not->toContain('kt-bg-fx-shimmer-text');
});

it('invalidates the cached preset when the post is updated', function () {
    $preset_id = self::factory()->post->create([
        'post_type'    => 'kt_bg_effect_preset',
        'post_status'  => 'publish',
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings {"effectType":"aurora","duration":12} /-->',
    ]);

    $first = kotlinskidev_build_bg_effect_preset($preset_id);
    expect($first['duration'])->toBe(12.0);

    wp_update_post([
        'ID'           => $preset_id,
        'post_content' => '<!-- wp:kotlinskidev/bg-effect-preset-settings {"effectType":"aurora","duration":25} /-->',
    ]);

    $second = kotlinskidev_build_bg_effect_preset($preset_id);
    expect($second['duration'])->toBe(25.0);
});
