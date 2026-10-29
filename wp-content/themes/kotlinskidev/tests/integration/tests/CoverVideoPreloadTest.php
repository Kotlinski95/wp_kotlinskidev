<?php

uses(Tests\Integration\TestCase::class);

beforeEach(function () {
    global $post;
    $this->originalPost = $post;
});

afterEach(function () {
    global $post;
    $post = $this->originalPost;
});

it('extracts the explicit poster url from a video cover block with lazy loading skipped', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'kotlinskidevSkipLazy' => true,
            'poster' => 'https://example.com/poster.jpg',
        ],
        'innerBlocks' => [],
    ];

    expect(extract_poster_from_block($block))->toBe(['https://example.com/poster.jpg']);
});

it('falls back to the attachment featured image when no explicit poster is set', function () {
    $attachment_id = self::factory()->attachment->create_upload_object(
        DIR_TESTDATA . '/images/canola.jpg'
    );
    $post_id = self::factory()->post->create();
    set_post_thumbnail($post_id, $attachment_id);

    $block = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'kotlinskidevSkipLazy' => true,
            'id' => $post_id,
        ],
        'innerBlocks' => [],
    ];

    expect(extract_poster_from_block($block))->toBe([get_the_post_thumbnail_url($post_id)]);
});

it('returns no poster for a video cover block that has not opted out of lazy loading', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'poster' => 'https://example.com/poster.jpg',
        ],
        'innerBlocks' => [],
    ];

    expect(extract_poster_from_block($block))->toBe([]);
});

it('returns no poster for a non-video cover block', function () {
    $block = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'image',
            'kotlinskidevSkipLazy' => true,
            'poster' => 'https://example.com/poster.jpg',
        ],
        'innerBlocks' => [],
    ];

    expect(extract_poster_from_block($block))->toBe([]);
});

it('returns no poster for an unrelated block type', function () {
    $block = ['blockName' => 'core/paragraph', 'attrs' => [], 'innerBlocks' => []];

    expect(extract_poster_from_block($block))->toBe([]);
});

it('recurses into inner blocks to find a nested video cover poster', function () {
    $inner = [
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'kotlinskidevSkipLazy' => true,
            'poster' => 'https://example.com/nested-poster.jpg',
        ],
        'innerBlocks' => [],
    ];
    $outer = ['blockName' => 'core/group', 'attrs' => [], 'innerBlocks' => [$inner]];

    expect(extract_poster_from_block($outer))->toBe(['https://example.com/nested-poster.jpg']);
});

it('returns no preload urls when the current post has no blocks', function () {
    global $post;
    $post = self::factory()->post->create_and_get(['post_content' => 'plain text, no blocks']);

    expect(get_cover_video_poster_preloads())->toBe([]);
});

it('returns the poster url for the current post when it contains an eligible video cover', function () {
    global $post;
    $post = self::factory()->post->create_and_get([
        'post_content' => '<!-- wp:cover {"backgroundType":"video","kotlinskidevSkipLazy":true,"poster":"https://example.com/p.jpg"} -->'
            . '<div class="wp-block-cover"></div>'
            . '<!-- /wp:cover -->',
    ]);

    expect(get_cover_video_poster_preloads())->toBe(['https://example.com/p.jpg']);
});

it('outputs a preload link tag for each poster url', function () {
    global $post;
    $post = self::factory()->post->create_and_get([
        'post_content' => '<!-- wp:cover {"backgroundType":"video","kotlinskidevSkipLazy":true,"poster":"https://example.com/p.jpg"} -->'
            . '<div class="wp-block-cover"></div>'
            . '<!-- /wp:cover -->',
    ]);

    ob_start();
    add_cover_video_poster_preloads();
    $html = ob_get_clean();

    expect($html)->toContain('rel="preload"');
    expect($html)->toContain('as="image"');
    expect($html)->toContain('href="https://example.com/p.jpg"');
    expect($html)->toContain('fetchpriority="high"');
});
