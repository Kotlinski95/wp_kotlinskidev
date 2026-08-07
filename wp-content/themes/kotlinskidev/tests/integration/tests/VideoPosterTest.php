<?php

uses(Tests\Integration\TestCase::class);

it('leaves a non-cover block untouched', function () {
    $output = '<div class="wp-block-group">x</div>';
    $block = ['blockName' => 'core/group', 'attrs' => []];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('leaves a non-video cover block untouched', function () {
    $output = '<div class="wp-block-cover">x</div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'image']];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('leaves a video cover block untouched when a poster attribute is already present', function () {
    $output = '<div class="wp-block-cover"><video poster="already-set.jpg"></video></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => 123]];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('leaves a video cover block untouched when the attachment has no featured image', function () {
    $post_id = self::factory()->post->create();
    $output = '<div class="wp-block-cover"><video></video></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => $post_id]];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('adds the poster attribute to the video tag from the attachment featured image', function () {
    $attachment_id = self::factory()->attachment->create_upload_object(
        DIR_TESTDATA . '/images/canola.jpg'
    );
    $video_id = self::factory()->post->create();
    set_post_thumbnail($video_id, $attachment_id);

    $output = '<div class="wp-block-cover"><video class="wp-block-cover__video-background"></video></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => $video_id]];

    $result = add_poster_image_to_cover_video($output, $block);

    expect($result)->toContain('poster="' . get_the_post_thumbnail_url($video_id) . '"');
    expect($result)->toContain('class="wp-block-cover__video-background"');
});

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'add_poster_image_to_cover_video'))->not->toBeFalse();
});
