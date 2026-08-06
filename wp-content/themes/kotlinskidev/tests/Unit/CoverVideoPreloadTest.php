<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/cover-video-preload.php';

function kotlinskidev_video_cover_block(array $overrides = []): array
{
    return array_replace_recursive([
        'blockName' => 'core/cover',
        'attrs' => [
            'backgroundType' => 'video',
            'kotlinskidevSkipLazy' => true,
            'poster' => 'poster.jpg',
        ],
    ], $overrides);
}

it('returns the poster url for a matching skip-lazy video cover block', function () {
    expect(extract_poster_from_block(kotlinskidev_video_cover_block()))->toBe(['poster.jpg']);
});

it('returns nothing when the cover block has not opted out of lazy loading', function () {
    $block = kotlinskidev_video_cover_block(['attrs' => ['kotlinskidevSkipLazy' => false]]);

    expect(extract_poster_from_block($block))->toBe([]);
});

it('returns nothing for a cover block whose background is not a video', function () {
    $block = kotlinskidev_video_cover_block(['attrs' => ['backgroundType' => 'image']]);

    expect(extract_poster_from_block($block))->toBe([]);
});

it('returns nothing for a non-cover block', function () {
    expect(extract_poster_from_block(['blockName' => 'core/paragraph', 'attrs' => []]))->toBe([]);
});

it('falls back to the attachment featured image url when there is no poster attribute', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn('thumb.jpg');
    $block = kotlinskidev_video_cover_block(['attrs' => ['poster' => null, 'id' => 5]]);
    unset($block['attrs']['poster']);
    $block['attrs']['id'] = 5;

    expect(extract_poster_from_block($block))->toBe(['thumb.jpg']);
});

it('returns nothing when there is neither a poster attribute nor an attachment id', function () {
    $block = kotlinskidev_video_cover_block();
    unset($block['attrs']['poster']);

    expect(extract_poster_from_block($block))->toBe([]);
});

it('recurses into inner blocks to find nested video cover posters', function () {
    $block = [
        'blockName' => 'core/group',
        'attrs' => [],
        'innerBlocks' => [kotlinskidev_video_cover_block(['attrs' => ['poster' => 'nested.jpg']])],
    ];

    expect(extract_poster_from_block($block))->toBe(['nested.jpg']);
});

it('combines posters from multiple sibling inner blocks', function () {
    $block = [
        'blockName' => 'core/group',
        'attrs' => [],
        'innerBlocks' => [
            kotlinskidev_video_cover_block(['attrs' => ['poster' => 'one.jpg']]),
            kotlinskidev_video_cover_block(['attrs' => ['poster' => 'two.jpg']]),
        ],
    ];

    expect(extract_poster_from_block($block))->toBe(['one.jpg', 'two.jpg']);
});

it('returns an empty array when there is no current post', function () {
    global $post;
    $post = null;

    expect(get_cover_video_poster_preloads())->toBe([]);
});

it('returns an empty array when the post has no blocks', function () {
    global $post;
    $post = (object) ['ID' => 9001, 'post_content' => 'plain text'];
    Functions\when('has_blocks')->justReturn(false);

    expect(get_cover_video_poster_preloads())->toBe([]);
});

it('collects and deduplicates poster urls from the parsed post content', function () {
    global $post;
    $post = (object) ['ID' => 9002, 'post_content' => 'has blocks'];
    Functions\when('has_blocks')->justReturn(true);
    Functions\when('parse_blocks')->justReturn([
        kotlinskidev_video_cover_block(['attrs' => ['poster' => 'dup.jpg']]),
        kotlinskidev_video_cover_block(['attrs' => ['poster' => 'dup.jpg']]),
        kotlinskidev_video_cover_block(['attrs' => ['poster' => 'unique.jpg']]),
    ]);

    expect(array_values(get_cover_video_poster_preloads()))->toBe(['dup.jpg', 'unique.jpg']);
});
