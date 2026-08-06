<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/video-poster.php';

it('leaves non-cover blocks unchanged', function () {
    $output = '<video src="a.mp4"></video>';

    expect(add_poster_image_to_cover_video($output, ['blockName' => 'core/paragraph', 'attrs' => []]))->toBe($output);
});

it('leaves cover blocks with a non-video background unchanged', function () {
    $output = '<div class="wp-block-cover"></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'image']];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('leaves the output unchanged when a poster attribute is already present', function () {
    $output = '<video src="a.mp4" poster="existing.jpg"></video>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => 5]];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('leaves the output unchanged when the attachment has no featured image', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn(false);
    $output = '<video src="a.mp4"></video>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => 5]];

    expect(add_poster_image_to_cover_video($output, $block))->toBe($output);
});

it('injects the featured image as the poster attribute on the video tag', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn('poster.jpg');
    $output = '<div class="wp-block-cover"><video src="a.mp4" muted></video></div>';
    $block = ['blockName' => 'core/cover', 'attrs' => ['backgroundType' => 'video', 'id' => 5]];

    $result = add_poster_image_to_cover_video($output, $block);

    expect($result)->toBe('<div class="wp-block-cover"><video src="a.mp4" muted poster="poster.jpg"></video></div>');
});
