<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    kotlinskidev_reset_above_fold_state();
});

afterEach(function () {
    kotlinskidev_reset_above_fold_state();
});

it('claims the slot with the explicit poster of a flagged video cover and prints the preload', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'kotlinskidevAboveFold' => true,
            'poster' => 'https://example.com/poster.jpg',
        ],
    ];

    control_block_lazy_loading('<video src="a.mp4"></video>', $block);

    ob_start();
    kotlinskidev_print_lcp_preload();
    $html = ob_get_clean();

    expect($html)->toContain('rel="preload"');
    expect($html)->toContain('as="image"');
    expect($html)->toContain('href="https://example.com/poster.jpg"');
    expect($html)->toContain('fetchpriority="high"');
});

it('falls back to the attachment featured image as the poster', function () {
    $attachment_id = self::factory()->attachment->create_upload_object(
        DIR_TESTDATA . '/images/canola.jpg'
    );
    $post_id = self::factory()->post->create();
    set_post_thumbnail($post_id, $attachment_id);

    $block = [
        'blockName' => 'core/cover',
        'attrs' => ['backgroundType' => 'video', 'kotlinskidevAboveFold' => true, 'id' => $post_id],
    ];

    expect(kotlinskidev_get_cover_video_poster_url($block))->toBe(get_the_post_thumbnail_url($post_id));
});

it('prints no preload for a video cover that is not flagged above the fold', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => ['backgroundType' => 'video', 'poster' => 'https://example.com/poster.jpg'],
    ];

    control_block_lazy_loading('<video src="a.mp4"></video>', $block);

    ob_start();
    kotlinskidev_print_lcp_preload();

    expect(ob_get_clean())->toBe('');
});

it('prints the preload only for the first of two flagged video covers', function () {
    $first = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'kotlinskidevAboveFold' => true, 'poster' => 'https://example.com/one.jpg']];
    $second = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'kotlinskidevAboveFold' => true, 'poster' => 'https://example.com/two.jpg']];

    control_block_lazy_loading('<video src="a.mp4"></video>', $first);
    control_block_lazy_loading('<video src="b.mp4"></video>', $second);

    ob_start();
    kotlinskidev_print_lcp_preload();
    $html = ob_get_clean();

    expect($html)->toContain('one.jpg');
    expect($html)->not->toContain('two.jpg');
});
