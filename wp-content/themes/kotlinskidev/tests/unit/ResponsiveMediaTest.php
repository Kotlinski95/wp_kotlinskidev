<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/breakpoints.php';
require_once __DIR__ . '/../../functions/responsive-media.php';

beforeEach(function () {
    Functions\stubEscapeFunctions();
    Functions\when('esc_url')->returnArg();
    Functions\when('absint')->alias(static fn ($value) => abs((int) $value));
    Functions\when('wp_get_attachment_metadata')->justReturn(false);
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

    expect($out)->toContain('<source media="(max-width: 1023px)" srcset="tablet.jpg">')
        ->not->toContain('min-width');
});

it('moves a video cover src into data attributes without breakpoint data', function () {
    $block = kotlinskidev_responsive_block('video', 'desktop.mp4', array('mobile' => array('url' => 'mobile.mp4')));
    $out   = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_video_cover(), $block);

    expect($out)->not->toContain(' src="desktop.mp4"')
        ->toContain('data-kt-src-desktop="desktop.mp4"')
        ->toContain('data-kt-src-tablet="desktop.mp4"')
        ->toContain('data-kt-src-mobile="mobile.mp4"')
        ->not->toContain('data-kt-bp-')
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

function kotlinskidev_responsive_image_block_markup(): string
{
    return '<figure class="wp-block-image size-large"><img src="desktop.jpg" alt="" class="wp-image-5" sizes="(max-width: 1200px) 100vw, 1200px"/></figure>';
}

function kotlinskidev_responsive_core_block(string $name, array $attrs): array
{
    return array('blockName' => $name, 'attrs' => $attrs);
}

it('registers the responsiveMedia attribute on core blocks listed in the registry only', function () {
    $args = kotlinskidev_responsive_media_register_attribute(array('attributes' => array('id' => array('type' => 'number'))), 'core/image');

    expect($args['attributes'])->toHaveKey('responsiveMedia')
        ->and($args['attributes']['responsiveMedia'])->toBe(array('type' => 'object', 'default' => array()));
    expect(kotlinskidev_responsive_media_register_attribute(array('attributes' => array()), 'core/group'))->toBe(array('attributes' => array()));
    expect(kotlinskidev_responsive_media_register_attribute(array('attributes' => array()), 'kotlinskidev/device-frame'))->toBe(array('attributes' => array()));
});

it('reads the adapter registry shared with the editor', function () {
    expect(kotlinskidev_responsive_media_registry())->toMatchArray(array(
        'core/image'                       => 'image',
        'core/cover'                       => 'cover',
        'core/video'                       => 'video',
        'kotlinskidev/hero-carousel-slide' => 'hero-slide',
        'kotlinskidev/device-frame'        => 'device-frame',
    ));
});

it('leaves a core image without responsive media byte-identical', function () {
    $content = kotlinskidev_responsive_image_block_markup();

    expect(kotlinskidev_apply_responsive_media($content, kotlinskidev_responsive_core_block('core/image', array('id' => 5))))->toBe($content);
    expect(kotlinskidev_apply_responsive_media($content, kotlinskidev_responsive_core_block('core/image', array('responsiveMedia' => array()))))->toBe($content);
    expect(kotlinskidev_apply_responsive_media($content, kotlinskidev_responsive_core_block('core/image', array('responsiveMedia' => array('mobile' => array('url' => 'desktop.jpg'))))))->toBe($content);
});

it('wraps a core image in a picture with a srcset source using the slot attachment', function () {
    Functions\when('wp_get_attachment_image_srcset')->justReturn('mobile-400.webp 400w, mobile-828.webp 828w');
    $block = kotlinskidev_responsive_core_block('core/image', array('id' => 5, 'responsiveMedia' => array('mobile' => array('id' => 9, 'url' => 'mobile-828.webp'))));

    $out = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_block_markup(), $block);

    expect($out)->toContain('<figure class="wp-block-image size-large"><picture class="kt-responsive-media"><source media="(max-width: 781px)" srcset="mobile-400.webp 400w, mobile-828.webp 828w" sizes="(max-width: 1200px) 100vw, 1200px"><img src="desktop.jpg"')
        ->toContain('</picture></figure>');
});

it('falls back to the slot url when the slot has no attachment id', function () {
    $block = kotlinskidev_responsive_core_block('core/image', array('responsiveMedia' => array('mobile' => array('url' => 'mobile.webp'))));

    $out = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_block_markup(), $block);

    expect($out)->toContain('<source media="(max-width: 781px)" srcset="mobile.webp"');
});

it('gives the same source to the mobile and tablet ranges when only a tablet slot is set', function () {
    $block = kotlinskidev_responsive_core_block('core/image', array('responsiveMedia' => array('tablet' => array('url' => 'tablet.webp'))));

    $out = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_block_markup(), $block);

    expect(substr_count($out, '<source'))->toBe(1);
    expect($out)->toContain('<source media="(max-width: 1023px)" srcset="tablet.webp"');
});

it('moves a core video src into per-device data attributes and keeps its controls', function () {
    $content = '<figure class="wp-block-video"><video controls poster="poster.jpg" src="desktop.mp4"></video></figure>';
    $block   = kotlinskidev_responsive_core_block('core/video', array('id' => 4, 'responsiveMedia' => array('mobile' => array('url' => 'mobile.mp4', 'posterUrl' => 'mobile.jpg'))));

    $out = kotlinskidev_apply_responsive_media($content, $block);

    expect($out)->not->toContain(' src="desktop.mp4"')
        ->toContain('data-kt-src-desktop="desktop.mp4"')
        ->toContain('data-kt-src-mobile="mobile.mp4"')
        ->toContain('data-kt-poster-mobile="mobile.jpg"')
        ->toContain('data-kt-poster-tablet="poster.jpg"')
        ->toContain(' controls');
});

it('leaves a core video without variants byte-identical', function () {
    $content = '<figure class="wp-block-video"><video controls src="desktop.mp4"></video></figure>';

    expect(kotlinskidev_apply_responsive_media($content, kotlinskidev_responsive_core_block('core/video', array('id' => 4))))->toBe($content);
});

it('resolves per-device sources and posters with the medium_large mobile default', function () {
    Functions\when('wp_get_attachment_image_url')->justReturn('poster-medium.jpg');

    $assets = kotlinskidev_resolve_responsive_media_assets(
        array('src' => 'd.mp4', 'poster' => 'd.jpg', 'poster_id' => 3),
        array(),
        true
    );

    expect($assets['mobile'])->toBe(array('src' => 'd.mp4', 'poster' => 'poster-medium.jpg'))
        ->and($assets['tablet'])->toBe(array('src' => 'd.mp4', 'poster' => 'd.jpg'))
        ->and($assets['desktop'])->toBe(array('src' => 'd.mp4', 'poster' => 'd.jpg'));
});

it('does not apply the medium_large default when a slot is set or the default is off', function () {
    Functions\when('wp_get_attachment_image_url')->justReturn('poster-medium.jpg');
    $desktop = array('src' => 'd.mp4', 'poster' => 'd.jpg', 'poster_id' => 3);

    $with_slot = kotlinskidev_resolve_responsive_media_assets($desktop, array('mobile' => array('url' => 'm.mp4', 'posterUrl' => 'm.jpg')), true);
    $no_default = kotlinskidev_resolve_responsive_media_assets($desktop, array(), false);

    expect($with_slot['mobile'])->toBe(array('src' => 'm.mp4', 'poster' => 'm.jpg'));
    expect($no_default['mobile']['poster'])->toBe('d.jpg');
});

it('builds preload entries whose media strings equal the picture source media strings', function () {
    $breakpoints = kotlinskidev_get_breakpoints();
    $assets      = array('mobile' => 'm.jpg', 'tablet' => 'd.jpg', 'desktop' => 'd.jpg');
    $srcsets     = array('mobile' => 'm-400.jpg 400w', 'desktop' => 'd-800.jpg 800w');

    $entries = kotlinskidev_responsive_media_preload_entries($assets, $srcsets, '100vw', $breakpoints);
    $picture = kotlinskidev_responsive_media_picture('<img>', $assets, $breakpoints, $srcsets, '100vw');
    preg_match_all('/<source media="([^"]+)"/', $picture, $source_media);

    expect(array_column($entries, 'media'))->toBe(array('(max-width: 781px)', '(min-width: 782px)'));
    expect($source_media[1])->toBe(array('(max-width: 781px)'));
    expect($entries[1])->toBe(array('href' => 'd.jpg', 'srcset' => 'd-800.jpg 800w', 'sizes' => '100vw', 'media' => '(min-width: 782px)'));
});

it('emits a single media-less preload entry when every device uses the same asset', function () {
    $entries = kotlinskidev_responsive_media_preload_entries(
        array('mobile' => 'd.jpg', 'tablet' => 'd.jpg', 'desktop' => 'd.jpg'),
        array(),
        '',
        kotlinskidev_get_breakpoints()
    );

    expect($entries)->toBe(array(array('href' => 'd.jpg', 'srcset' => '', 'sizes' => '', 'media' => '')));
});

it('resolves alpha sources per device from slots that carry an alpha file', function () {
    $slots = array('mobile' => array('url' => 'm.webm', 'alphaUrl' => 'm.mov'));

    expect(kotlinskidev_responsive_media_alpha_sources('d.mov', $slots))->toBe(array('desktop' => 'd.mov', 'tablet' => 'd.mov', 'mobile' => 'm.mov'));
    expect(kotlinskidev_responsive_media_alpha_sources('d.mov', array()))->toBe(array('desktop' => 'd.mov', 'tablet' => 'd.mov', 'mobile' => 'd.mov'));
});

it('drops slots without an alpha file on an alpha slide so the desktop pair is used', function () {
    $slots = kotlinskidev_responsive_media_alpha_slots(array(
        'mobile' => array('url' => 'm.webm'),
        'tablet' => array('url' => 't.webm', 'alphaUrl' => 't.mov'),
    ));

    expect(array_keys($slots))->toBe(array('tablet'));
    expect(kotlinskidev_resolve_responsive_media('d.webm', $slots))->toBe(array('desktop' => 'd.webm', 'tablet' => 't.webm', 'mobile' => 't.webm'));
    expect(kotlinskidev_responsive_media_alpha_sources('d.mov', $slots))->toBe(array('desktop' => 'd.mov', 'tablet' => 't.mov', 'mobile' => 't.mov'));
    expect(kotlinskidev_responsive_media_alpha_slots(array('mobile' => array('url' => 'm.webm'))))->toBe(array());
});

it('prints per-device alpha data attributes only where they differ from desktop', function () {
    $sources = kotlinskidev_responsive_media_alpha_sources('d.mov', array('mobile' => array('url' => 'm.webm', 'alphaUrl' => 'm.mov')));

    expect(kotlinskidev_responsive_media_data_attributes($sources, 'src-alpha'))->toBe(' data-kt-src-alpha-mobile="m.mov"');
});

it('adds width and height to a source from the slot attachment metadata', function () {
    Functions\when('wp_get_attachment_image_srcset')->justReturn('mobile-400.webp 400w');
    Functions\when('wp_get_attachment_metadata')->alias(static fn ($id) => 9 === $id ? array('width' => 828, 'height' => 1200) : false);
    $block = kotlinskidev_responsive_core_block('core/image', array('id' => 5, 'responsiveMedia' => array('mobile' => array('id' => 9, 'url' => 'mobile-828.webp'))));

    $out = kotlinskidev_apply_responsive_media(kotlinskidev_responsive_image_block_markup(), $block);

    expect($out)->toContain('sizes="(max-width: 1200px) 100vw, 1200px" width="828" height="1200"><img');
});

it('omits source dimensions when attachment metadata is missing', function () {
    $dimensions = kotlinskidev_responsive_media_source_dimensions(array('mobile' => array('id' => 9, 'url' => 'm.webp')));

    expect($dimensions)->toBe(array());
    expect(kotlinskidev_responsive_media_source_size_attributes(array()))->toBe('');
    expect(kotlinskidev_responsive_media_source_size_attributes(array('width' => 100, 'height' => 0)))->toBe('');
});

it('reads dimensions from the poster id key and falls back from mobile to tablet', function () {
    Functions\when('wp_get_attachment_metadata')->alias(static fn ($id) => array('width' => $id * 10, 'height' => $id * 20));

    $dimensions = kotlinskidev_responsive_media_source_dimensions(array('tablet' => array('url' => 't.jpg', 'posterId' => 4)), 'posterId');

    expect($dimensions)->toBe(array(
        'mobile' => array('width' => 40, 'height' => 80),
        'tablet' => array('width' => 40, 'height' => 80),
    ));
});

it('passes explicit dimensions through the picture builder', function () {
    $assets = array('mobile' => 'm.jpg', 'tablet' => 'd.jpg', 'desktop' => 'd.jpg');

    $picture = kotlinskidev_responsive_media_picture('<img>', $assets, kotlinskidev_get_breakpoints(), array(), '', array('mobile' => array('width' => 640, 'height' => 480)));

    expect($picture)->toContain('<source media="(max-width: 781px)" srcset="m.jpg" width="640" height="480"><img>');
});
