<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/cover-image-classes.php';

beforeEach(function () {
    Functions\when('get_theme_mod')->justReturn('skip-lazy');
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
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->not->toContain('loading="lazy"');
    expect($result)->not->toContain('data-src=');
    expect($result)->toContain('loading="eager"');
    expect($result)->toContain('fetchpriority="high"');
});

it('adds the configured lazy class and debug class to an existing image class attribute', function () {
    $output = '<img src="a.jpg" class="wp-image-1">';
    $block = ['blockName' => 'core/image', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('class="wp-image-1 skip-lazy no-lazy-loading"');
});

it('creates a fresh class attribute on an image with none', function () {
    $output = '<img src="a.jpg">';
    $block = ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]];

    $result = control_block_lazy_loading($output, $block);

    expect($result)->toContain('class="skip-lazy no-lazy-loading"');
});

it('also strips lazy-loading attributes and adds classes to video elements', function () {
    $output = '<video src="a.mp4" loading="lazy" data-src="b.mp4"></video>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]];

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

    set_lazy_loading_context('output', ['blockName' => 'core/cover', 'attrs' => ['kotlinskidevSkipLazy' => true]]);

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
