<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/breakpoints.php';
require_once __DIR__ . '/../../functions/responsive-media.php';

beforeEach(function () {
    Functions\stubEscapeFunctions();
    Functions\when('esc_url')->returnArg();
    Functions\when('get_option')->alias(static fn ($name, $default = null) => $default);
});

function kotlinskidev_responsive_image_cover(): string
{
    return '<div class="wp-block-cover"><img class="wp-block-cover__image-background wp-image-5" alt="" src="desktop.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container"></div></div>';
}

function kotlinskidev_responsive_video_cover(): string
{
    return '<div class="wp-block-cover"><video class="wp-block-cover__video-background" autoplay muted loop playsinline src="desktop.mp4"></video><div class="wp-block-cover__inner-container"></div></div>';
}

function kotlinskidev_responsive_block(string $type, string $url, array $slots): array
{
    return array(
        'blockName' => 'core/cover',
        'attrs'     => array('backgroundType' => $type, 'url' => $url, 'responsiveMedia' => $slots),
    );
}

it('resolves an empty tablet slot to desktop and an empty mobile slot to tablet', function () {
    expect(kotlinskidev_resolve_responsive_media('d.jpg', array()))->toBe(array('desktop' => 'd.jpg', 'tablet' => 'd.jpg', 'mobile' => 'd.jpg'));
    expect(kotlinskidev_resolve_responsive_media('d.jpg', array('tablet' => array('url' => 't.jpg'))))->toBe(array('desktop' => 'd.jpg', 'tablet' => 't.jpg', 'mobile' => 't.jpg'));
    expect(kotlinskidev_resolve_responsive_media('d.jpg', array('mobile' => array('url' => 'm.jpg'))))->toBe(array('desktop' => 'd.jpg', 'tablet' => 'd.jpg', 'mobile' => 'm.jpg'));
});

it('ignores malformed slots', function () {
    expect(kotlinskidev_resolve_responsive_media('d.jpg', array('mobile' => 'oops', 'tablet' => array('url' => 5))))->toBe(array('desktop' => 'd.jpg', 'tablet' => 'd.jpg', 'mobile' => 'd.jpg'));
});

it('leaves a native cover untouched when no responsive media is set', function () {
    $content = kotlinskidev_responsive_image_cover();

    expect(kotlinskidev_apply_responsive_media($content, array('blockName' => 'core/cover', 'attrs' => array('url' => 'desktop.jpg'))))->toBe($content);
    expect(kotlinskidev_apply_responsive_media($content, kotlinskidev_responsive_block('image', 'desktop.jpg', array())))->toBe($content);
});

it('leaves the cover untouched when slots equal the desktop media', function () {
    $content = kotlinskidev_responsive_image_cover();
    $block   = kotlinskidev_responsive_block('image', 'desktop.jpg', array('mobile' => array('url' => 'desktop.jpg')));

    expect(kotlinskidev_apply_responsive_media($content, $block))->toBe($content);
});

it('ignores blocks that are not a cover and empty content', function () {
    $content = kotlinskidev_responsive_image_cover();
    $block   = array('blockName' => 'core/group', 'attrs' => array('url' => 'd.jpg', 'responsiveMedia' => array('mobile' => array('url' => 'm.jpg'))));

    expect(kotlinskidev_apply_responsive_media($content, $block))->toBe($content);
    expect(kotlinskidev_apply_responsive_media('', kotlinskidev_responsive_block('image', 'd.jpg', array('mobile' => array('url' => 'm.jpg')))))->toBe('');
});

it('wraps an image cover in a picture with a mobile source', function () {
    $block = kotlinskidev_responsive_block('image', 'desktop.jpg', array('mobile' => array('url' => 'mobile.jpg')));
    $out   = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_cover(), $block);

    expect($out)->toContain('<picture class="kt-responsive-media">')
        ->toContain('<source media="(max-width: 781px)" srcset="mobile.jpg">')
        ->toContain('src="desktop.jpg"')
        ->toContain('</picture>')
        ->not->toContain('min-width: 782px');
});

it('adds a tablet source covering the tablet range', function () {
    $block = kotlinskidev_responsive_block('image', 'desktop.jpg', array('tablet' => array('url' => 'tablet.jpg')));
    $out   = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_cover(), $block);

    expect($out)->toContain('<source media="(max-width: 781px)" srcset="tablet.jpg">')
        ->toContain('<source media="(min-width: 782px) and (max-width: 1023px)" srcset="tablet.jpg">');
});

it('moves a video cover src into data attributes with the breakpoints', function () {
    $block = kotlinskidev_responsive_block('video', 'desktop.mp4', array('mobile' => array('url' => 'mobile.mp4')));
    $out   = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_video_cover(), $block);

    expect($out)->not->toContain(' src="desktop.mp4"')
        ->toContain('data-kt-src-desktop="desktop.mp4"')
        ->toContain('data-kt-src-tablet="desktop.mp4"')
        ->toContain('data-kt-src-mobile="mobile.mp4"')
        ->toContain('data-kt-bp-mobile="781"')
        ->toContain('data-kt-bp-tablet="1023"')
        ->toContain(' autoplay');
});

it('returns a video cover unchanged when it has no video element', function () {
    $content = '<div class="wp-block-cover"></div>';
    $block   = kotlinskidev_responsive_block('video', 'd.mp4', array('mobile' => array('url' => 'm.mp4')));

    expect(kotlinskidev_apply_responsive_media($content, $block))->toBe($content);
});

it('resolves posters so a slot with its own video never inherits another video poster', function () {
    $slots = array('mobile' => array('url' => 'm.mp4', 'poster' => 'm.jpg'), 'tablet' => array('url' => 't.mp4'));

    expect(kotlinskidev_resolve_responsive_posters('d.jpg', $slots))->toBe(array('desktop' => 'd.jpg', 'tablet' => '', 'mobile' => 'm.jpg'));
});

it('lets an empty slot inherit the poster of the slot it falls back to', function () {
    $slots = array('tablet' => array('url' => 't.mp4', 'poster' => 't.jpg'));

    expect(kotlinskidev_resolve_responsive_posters('d.jpg', $slots))->toBe(array('desktop' => 'd.jpg', 'tablet' => 't.jpg', 'mobile' => 't.jpg'));
    expect(kotlinskidev_resolve_responsive_posters('d.jpg', array()))->toBe(array('desktop' => 'd.jpg', 'tablet' => 'd.jpg', 'mobile' => 'd.jpg'));
});

it('looks up the featured image of each slot attachment as its poster', function () {
    Functions\when('get_the_post_thumbnail_url')->alias(static fn ($id) => $id === 7 ? 'poster-7.jpg' : false);

    $slots = kotlinskidev_responsive_media_with_posters(array(
        'mobile' => array('id' => 7, 'url' => 'm.mp4'),
        'tablet' => array('id' => 8, 'url' => 't.mp4'),
    ));

    expect($slots['mobile']['poster'])->toBe('poster-7.jpg')
        ->and($slots['tablet']['poster'])->toBe('');
});

it('writes per-device poster attributes and drops the desktop poster when they differ', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn('mobile-poster.jpg');
    $content = '<div class="wp-block-cover"><video class="wp-block-cover__video-background" autoplay muted playsinline src="desktop.mp4" poster="desktop-poster.jpg"></video></div>';
    $block   = kotlinskidev_responsive_block('video', 'desktop.mp4', array('mobile' => array('id' => 7, 'url' => 'mobile.mp4')));

    $out = kotlinskidev_apply_responsive_media($content, $block);

    expect($out)->toContain('data-kt-poster-desktop="desktop-poster.jpg"')
        ->toContain('data-kt-poster-mobile="mobile-poster.jpg"')
        ->toContain('data-kt-poster-tablet="desktop-poster.jpg"')
        ->not->toContain(' poster="desktop-poster.jpg"');
});

it('gives a slot video without a featured image no poster instead of the desktop one', function () {
    Functions\when('get_the_post_thumbnail_url')->justReturn(false);
    $content = '<div class="wp-block-cover"><video class="wp-block-cover__video-background" autoplay muted playsinline src="desktop.mp4" poster="desktop-poster.jpg"></video></div>';
    $block   = kotlinskidev_responsive_block('video', 'desktop.mp4', array('tablet' => array('id' => 9, 'url' => 'tablet.mp4')));

    $out = kotlinskidev_apply_responsive_media($content, $block);

    expect($out)->toContain('data-kt-poster-tablet=""')
        ->toContain('data-kt-poster-desktop="desktop-poster.jpg"')
        ->not->toContain(' poster="desktop-poster.jpg"');
});
