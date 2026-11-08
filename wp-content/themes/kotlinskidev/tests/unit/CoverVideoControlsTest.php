<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/cover-video-controls.php';

function kotlinskidev_cover_video_markup(): string
{
    return '<div class="wp-block-cover"><video class="wp-block-cover__video-background intrinsic-ignore" autoplay muted loop playsinline src="v.mp4"></video><div class="wp-block-cover__inner-container"></div></div>';
}

function kotlinskidev_cover_video_block(array $attrs): array
{
    return array('blockName' => 'core/cover', 'attrs' => array_merge(array('backgroundType' => 'video'), $attrs));
}

it('leaves the markup untouched when every control is at its default', function () {
    $content = kotlinskidev_cover_video_markup();

    expect(kotlinskidev_apply_cover_video_controls($content, kotlinskidev_cover_video_block(array())))->toBe($content);
});

it('ignores blocks that are not a cover', function () {
    $content = kotlinskidev_cover_video_markup();
    $block   = array('blockName' => 'core/group', 'attrs' => array('backgroundType' => 'video', 'coverVideoLoop' => false));

    expect(kotlinskidev_apply_cover_video_controls($content, $block))->toBe($content);
});

it('ignores covers whose background is not a video', function () {
    $content = kotlinskidev_cover_video_markup();
    $block   = array('blockName' => 'core/cover', 'attrs' => array('backgroundType' => 'image', 'coverVideoLoop' => false));

    expect(kotlinskidev_apply_cover_video_controls($content, $block))->toBe($content);
});

it('returns content unchanged when the cover has no video element', function () {
    $content = '<div class="wp-block-cover"></div>';

    expect(kotlinskidev_apply_cover_video_controls($content, kotlinskidev_cover_video_block(array('coverVideoLoop' => false))))->toBe($content);
});

it('removes loop so the video holds its last frame', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoLoop' => false)));

    expect($out)->not->toContain(' loop')->toContain(' autoplay');
});

it('removes autoplay and flags the video for first-frame display', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoAutoplay' => false)));

    expect($out)->not->toContain(' autoplay')
        ->toContain('data-kt-video-autoplay="off"')
        ->toContain('preload="auto"')
        ->toContain(' loop');
});

it('flags the video to pause while offscreen', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoPauseOffscreen' => true)));

    expect($out)->toContain('data-kt-video-pause-offscreen="true"')->toContain(' autoplay')->toContain(' loop');
});

it('flags the cover root and forces loop off when reveal-after-end is on', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoRevealAfterEnd' => true, 'coverVideoLoop' => true)));

    expect($out)->toContain('<div class="wp-block-cover" data-kt-reveal-after-end="true"')
        ->not->toContain(' loop')
        ->toContain(' autoplay');
});

it('keeps autoplay setting when reveal-after-end is on', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoRevealAfterEnd' => true, 'coverVideoAutoplay' => false)));

    expect($out)->toContain('data-kt-reveal-after-end="true"')->toContain('data-kt-video-autoplay="off"')->not->toContain(' autoplay');
});

it('adds no reveal flag when reveal-after-end is off', function () {
    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoLoop' => false)));

    expect($out)->not->toContain('data-kt-reveal-after-end');
});

function kotlinskidev_cover_fit_stub_metadata(array $sizes): void
{
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('wp_get_attachment_metadata')->alias(fn ($id) => $sizes[$id] ?? false);
}

it('adds the fit class and per-device ratios', function () {
    kotlinskidev_cover_fit_stub_metadata(array(1 => array('width' => 1920, 'height' => 1080), 3 => array('width' => 1080, 'height' => 1920)));
    $block = kotlinskidev_cover_video_block(array('coverVideoFitAspect' => true, 'id' => 1, 'responsiveMedia' => array('mobile' => array('id' => 3))));

    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), $block);

    expect($out)->toContain('kt-cover-fit-video')
        ->toContain('--kt-vr-desktop:1920 / 1080;')
        ->toContain('--kt-vr-mobile:1080 / 1920;')
        ->not->toContain('--kt-vr-tablet');
});

it('emits nothing for a device whose metadata is missing', function () {
    kotlinskidev_cover_fit_stub_metadata(array(1 => array('width' => 1920, 'height' => 1080)));
    $block = kotlinskidev_cover_video_block(array('coverVideoFitAspect' => true, 'id' => 1, 'responsiveMedia' => array('tablet' => array('id' => 99))));

    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), $block);

    expect($out)->toContain('--kt-vr-desktop:1920 / 1080;')->not->toContain('--kt-vr-tablet');
});

it('leaves the markup untouched when fit is off', function () {
    kotlinskidev_cover_fit_stub_metadata(array(1 => array('width' => 1920, 'height' => 1080)));
    $content = kotlinskidev_cover_video_markup();

    expect(kotlinskidev_apply_cover_video_controls($content, kotlinskidev_cover_video_block(array('id' => 1))))->toBe($content);
});

it('keeps the class and skips the style when no metadata is known', function () {
    kotlinskidev_cover_fit_stub_metadata(array());

    $out = kotlinskidev_apply_cover_video_controls(kotlinskidev_cover_video_markup(), kotlinskidev_cover_video_block(array('coverVideoFitAspect' => true, 'id' => 1)));

    expect($out)->toContain('kt-cover-fit-video')->not->toContain('style=');
});

it('appends to an existing style attribute', function () {
    kotlinskidev_cover_fit_stub_metadata(array(1 => array('width' => 1920, 'height' => 1080)));
    $content = str_replace('class="wp-block-cover"', 'class="wp-block-cover" style="min-height:430px"', kotlinskidev_cover_video_markup());

    $out = kotlinskidev_apply_cover_video_controls($content, kotlinskidev_cover_video_block(array('coverVideoFitAspect' => true, 'id' => 1)));

    expect($out)->toContain('style="min-height:430px;--kt-vr-desktop:1920 / 1080;"');
});
