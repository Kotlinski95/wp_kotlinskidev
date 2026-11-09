<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/above-fold-media.php';
require_once __DIR__ . '/../../functions/cover-image-classes.php';

beforeEach(function () {
    Functions\when('get_theme_mod')->justReturn('skip-lazy');
    Functions\when('wp_high_priority_element_flag')->justReturn(true);
    Functions\when('wp_increase_content_media_count')->justReturn(1);
    Functions\when('wp_omit_loading_attr_threshold')->justReturn(3);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    kotlinskidev_reset_above_fold_state();
});

it('leaves unrelated block types unchanged', function () {
    $output = '<img src="a.jpg" loading="lazy">';

    expect(control_block_lazy_loading($output, ['blockName' => 'core/paragraph']))->toBe($output);
});

it('leaves the output unchanged when the block does not opt out of lazy loading', function () {
    $output = '<img src="a.jpg" loading="lazy">';
    $block = ['blockName' => 'core/image', 'attrs' => []];

    expect(control_block_lazy_loading($output, $block))->toBe($output);
});

it('strips lazy-loading attributes and forces eager/high-priority loading on images', function () {
    $output = '<img src="a.jpg" loading="lazy" fetchpriority="low" data-src="b.jpg">';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->not->toContain('loading="lazy"');
    expect($result)->not->toContain('data-src=');
    expect($result)->toContain('loading="eager"');
    expect($result)->toContain('fetchpriority="high"');
});

it('adds the configured lazy class and debug class to an existing image class attribute', function () {
    $output = '<img src="a.jpg" class="wp-image-1">';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('class="wp-image-1 skip-lazy no-lazy-loading"');
});

it('creates a fresh class attribute on an image with none', function () {
    $output = '<img src="a.jpg">';
    $block = ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('class="skip-lazy no-lazy-loading"');
});

it('also strips lazy-loading attributes and adds classes to video elements', function () {
    $output = '<video src="a.mp4" loading="lazy" data-src="b.mp4"></video>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->not->toContain('loading="lazy"');
    expect($result)->toContain('fetchpriority="high"');
    expect($result)->toContain('class="skip-lazy no-lazy-loading"');
});

it('returns the incoming loading value unchanged when not inside a render_block filter', function () {
    Functions\when('doing_filter')->justReturn(false);

    expect(disable_wp_lazy_loading_for_blocks('lazy', null, null))->toBe('lazy');
});

it('forces eager loading when the current block has opted out of lazy loading', function () {
    Functions\when('doing_filter')->justReturn(true);
    global $current_block_skip_lazy;
    $current_block_skip_lazy = true;

    expect(disable_wp_lazy_loading_for_blocks('lazy', null, null))->toBe('eager');
});

it('leaves the loading value unchanged when the current block has not opted out', function () {
    Functions\when('doing_filter')->justReturn(true);
    global $current_block_skip_lazy;
    $current_block_skip_lazy = false;

    expect(disable_wp_lazy_loading_for_blocks('lazy', null, null))->toBe('lazy');
});

it('sets the skip-lazy global flag to true for an opted-out cover/image block', function () {
    global $current_block_skip_lazy;

    set_lazy_loading_context('output', ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevAboveFold' => true]]);

    expect($current_block_skip_lazy)->toBeTrue();
});

it('sets the skip-lazy global flag to false for a block that has not opted out', function () {
    global $current_block_skip_lazy;

    set_lazy_loading_context('output', ['blockName' => 'core/image', 'attrs' => []]);

    expect($current_block_skip_lazy)->toBeFalse();
});

it('does not touch the skip-lazy flag for unrelated block types', function () {
    global $current_block_skip_lazy;
    $current_block_skip_lazy = 'sentinel';

    $result = set_lazy_loading_context('output', ['blockName' => 'core/paragraph', 'attrs' => []]);

    expect($current_block_skip_lazy)->toBe('sentinel');
    expect($result)->toBe('output');
});

it('inserts eager attributes before the closing slash of a self-closing image', function () {
    $output = '<img src="a.jpg" class="x" />';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toBe('<img src="a.jpg" class="x skip-lazy no-lazy-loading" loading="eager" fetchpriority="high">');
    expect($result)->not->toContain('/ loading');
});

it('still honours the legacy kotlinskidevSkipLazy attribute', function () {
    $output = '<img src="a.jpg" loading="lazy">';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('loading="eager"');
    expect($result)->toContain('fetchpriority="high"');
});

it('gives only the first flagged block high priority and the second eager loading only', function () {
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $first = control_block_lazy_loading('<img src="a.jpg">', $block);
    $second = control_block_lazy_loading('<img src="b.jpg">', $block);

    expect($first)->toContain('fetchpriority="high"');
    expect($second)->toContain('loading="eager"');
    expect($second)->not->toContain('fetchpriority');
});

it('applies the treatment to core/video blocks', function () {
    $block = ['blockName' => 'core/video', 'attrs' => ['kotlinskidevAboveFold' => true]];

    $result = control_block_lazy_loading('<video src="a.mp4"></video>', $block);

    expect($result)->toContain('fetchpriority="high"');
    expect($result)->toContain('no-lazy-loading');
});

it('claims the slot with the poster url for a flagged video cover', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => ['kotlinskidevAboveFold' => true, 'backgroundType' => 'video', 'poster' => 'poster.jpg'],
    ];

    control_block_lazy_loading('<video src="a.mp4"></video>', $block);

    ob_start();
    kotlinskidev_print_lcp_preload();
    expect(ob_get_clean())->toBe('<link rel="preload" as="image" fetchpriority="high" href="poster.jpg">' . "\n");
});

it('falls back to the attachment thumbnail as the video cover poster', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn('thumb.jpg');
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => 5]];

    expect(kotlinskidev_get_cover_video_poster_url($block))->toBe('thumb.jpg');
});

it('returns no poster for a non-video cover or other block', function () {
    expect(kotlinskidev_get_cover_video_poster_url(['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'image', 'poster' => 'p.jpg']]))->toBe('');
    expect(kotlinskidev_get_cover_video_poster_url(['blockName' => 'core/image', 'attrs' => []]))->toBe('');
    expect(kotlinskidev_get_cover_video_poster_url(['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video']]))->toBe('');
});
