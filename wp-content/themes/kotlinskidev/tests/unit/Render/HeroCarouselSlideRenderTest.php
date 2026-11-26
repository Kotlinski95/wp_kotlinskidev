<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/above-fold-media.php';
require_once __DIR__ . '/../../../functions/breakpoints.php';
require_once __DIR__ . '/../../../functions/responsive-media.php';

function kotlinskidev_hero_carousel_slide_render(array $attributes, array $context = [], string $content = ''): string
{
    $block = (object) ['context' => $context];

    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/hero-carousel/slide/render.php',
        $attributes,
        $content,
        $block
    );
}

beforeEach(function () {
    Functions\when('get_option')->alias(static fn ($name, $default = null) => $default);
    Functions\when('get_block_wrapper_attributes')->justReturn('class="swiper-slide hero-carousel__slide"');
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('wp_style_engine_get_styles')->justReturn(['css' => '']);
    Functions\when('wp_high_priority_element_flag')->justReturn(true);
    Functions\when('wp_increase_content_media_count')->justReturn(1);
    Functions\when('wp_omit_loading_attr_threshold')->justReturn(3);
    kotlinskidev_reset_above_fold_state();
});

function kotlinskidev_above_fold_context(array $extra = []): array
{
    return array_merge(['kotlinskidev/aboveFold' => true], $extra);
}

function kotlinskidev_captured_lcp_preload(): string
{
    ob_start();
    kotlinskidev_print_lcp_preload();
    return ob_get_clean();
}

it('hands the poster image to the head preload only for the first slide of an above-the-fold carousel', function () {
    kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'first-bg.jpg'], kotlinskidev_above_fold_context());

    expect(kotlinskidev_captured_lcp_preload())->toContain('href="first-bg.jpg"');
});

it('does not print a body preload link', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($html)->not->toContain('rel="preload"');
});

it('does not claim the slot for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 1, 'bgImageUrl' => 'later.jpg'], kotlinskidev_above_fold_context());

    expect($html)->not->toContain('rel="preload"');
    expect(kotlinskidev_captured_lcp_preload())->toBe('');
});

it('does not claim the slot when the carousel is not above the fold', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'], ['kotlinskidev/aboveFold' => false]);

    expect(kotlinskidev_captured_lcp_preload())->toBe('');
    expect($html)->toContain('loading="lazy"');
    expect($html)->not->toContain('fetchpriority');
});

it('flags the first slide as the high priority element and bumps the media count', function () {
    $calls = [];
    Functions\when('wp_high_priority_element_flag')->alias(function ($flag) use (&$calls) {
        $calls[] = ['flag', $flag];
        return true;
    });
    Functions\when('wp_increase_content_media_count')->alias(function ($n) use (&$calls) {
        $calls[] = ['count', $n];
        return $n;
    });

    kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($calls)->toBe([['flag', false], ['count', 3]]);
});

it('leaves the media count untouched for a later slide', function () {
    $calls = 0;
    Functions\when('wp_high_priority_element_flag')->alias(function () use (&$calls) {
        $calls++;
        return true;
    });
    Functions\when('wp_increase_content_media_count')->alias(function () use (&$calls) {
        $calls++;
        return 0;
    });

    kotlinskidev_hero_carousel_slide_render(['slideIndex' => 1, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($calls)->toBe(0);
});

it('renders the first slide eager but without high priority when another element already holds the slot', function () {
    kotlinskidev_claim_lcp_slot([['href' => 'other.jpg']]);

    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($html)->toContain('loading="eager"');
    expect($html)->not->toContain('fetchpriority');
});

it('renders an eager, high-priority image for the first slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($html)->toContain('loading="eager"');
    expect($html)->toContain('fetchpriority="high"');
});

it('renders a lazy image with no fetchpriority for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 2, 'bgImageUrl' => 'bg.jpg'], kotlinskidev_above_fold_context());

    expect($html)->toContain('loading="lazy"');
    expect($html)->not->toContain('fetchpriority');
});

it('renders an eager video with a poster, preload none and no autoplay for the first slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 0,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageUrl' => 'poster.jpg',
    ], kotlinskidev_above_fold_context());

    expect($html)->toContain('src="bg.mp4"');
    expect($html)->toContain('preload="none"');
    expect($html)->not->toContain('<video fetchpriority');
    expect($html)->not->toMatch('/<video[^>]*fetchpriority/');
    expect($html)->not->toContain('autoplay');
    expect($html)->toContain('poster="poster.jpg"');
    expect($html)->not->toContain('data-src=');
});

it('renders a lazy video using data-src and data-poster for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageUrl' => 'poster.jpg',
    ], kotlinskidev_above_fold_context());

    expect($html)->toContain('data-src="bg.mp4"');
    expect($html)->toContain('data-poster="poster.jpg"');
    expect($html)->not->toContain(' src="bg.mp4"');
    expect($html)->not->toContain('autoplay');
});

it('renders the attachment image via wp_get_attachment_image when a media id is set', function () {
    Functions\expect('wp_get_attachment_image')
        ->once()
        ->with(5, 'full', false, Mockery::on(fn ($args) => $args['loading'] === 'eager'))
        ->andReturn('<img class="wp-attachment-image">');
    Functions\when('wp_get_attachment_url')->justReturn('attachment.jpg');

    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageId' => 5], kotlinskidev_above_fold_context());

    expect($html)->toContain('<img class="wp-attachment-image">');
});

it('renders neither image nor video when no background is configured', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0]);

    expect($html)->not->toContain('<img');
    expect($html)->not->toContain('<video');
});

it('clamps the overlay opacity between 0 and 1', function () {
    $tooHigh = kotlinskidev_hero_carousel_slide_render(['bgOverlay' => 2.5]);
    $tooLow = kotlinskidev_hero_carousel_slide_render(['bgOverlay' => -1]);

    expect($tooHigh)->toContain('--overlay-opacity: 1');
    expect($tooLow)->toContain('--overlay-opacity: 0');
});

it('renders the inner block content', function () {
    $html = kotlinskidev_hero_carousel_slide_render([], [], '<h2>Heading</h2>');

    expect($html)->toContain('<div class="hero-carousel__content">');
    expect($html)->toContain('<h2>Heading</h2>');
});

it('applies the spacing style engine output directly on the content wrapper', function () {
    Functions\when('wp_style_engine_get_styles')->justReturn(['css' => 'padding-top:2rem;']);

    $html = kotlinskidev_hero_carousel_slide_render([
        'style' => ['spacing' => ['padding' => ['top' => '2rem']]],
    ]);

    expect($html)->toContain('<div class="hero-carousel__content" style="padding-top:2rem;">');
});

it('prints data-src-alpha on the video only when an alpha source is set', function () {
    $with = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgImageUrl' => 'poster.jpg',
        'bgVideoUrl' => 'bg.webm',
        'bgVideoAlphaUrl' => 'bg.mov',
    ]);
    $without = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgImageUrl' => 'poster.jpg',
        'bgVideoUrl' => 'bg.webm',
    ]);

    expect($with)->toContain('data-src-alpha="bg.mov"');
    expect($with)->toContain('data-src="bg.webm"');
    expect($without)->not->toContain('data-src-alpha');
});

it('prints data-src-alpha on an eager first-slide video too', function () {
    $html = kotlinskidev_hero_carousel_slide_render(
        ['slideIndex' => 0, 'bgImageUrl' => 'poster.jpg', 'bgVideoUrl' => 'bg.webm', 'bgVideoAlphaUrl' => 'bg.mov'],
        kotlinskidev_above_fold_context()
    );

    expect($html)->toContain('src="bg.webm"');
    expect($html)->toContain('data-src-alpha="bg.mov"');
});


it('renders an eager poster image before the video, without a poster attribute, when the slide has an image id', function () {
    Functions\when('wp_get_attachment_url')->justReturn('poster.jpg');
    Functions\when('wp_get_attachment_image_srcset')->justReturn('poster-800.jpg 800w, poster.jpg 1600w');
    Functions\expect('wp_get_attachment_image')
        ->once()
        ->with(7, 'full', false, Mockery::on(fn ($args) => $args['class'] === 'hero-carousel__poster'
            && $args['fetchpriority'] === 'high'
            && $args['loading'] === 'eager'
            && $args['sizes'] === 'max(100vw, 800px)'))
        ->andReturn('<img class="hero-carousel__poster">');

    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 0,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageId' => 7,
    ], kotlinskidev_above_fold_context());

    expect(strpos($html, 'hero-carousel__poster'))->toBeLessThan(strpos($html, '<video'));
    expect($html)->not->toContain('poster="');
    expect(kotlinskidev_captured_lcp_preload())->toContain('imagesrcset="poster-800.jpg 800w, poster.jpg 1600w"');
    kotlinskidev_reset_above_fold_state();
});

it('adds a mobile poster to a lazy video slide that has an image id', function () {
    Functions\when('wp_get_attachment_url')->justReturn('poster.jpg');
    Functions\when('wp_get_attachment_image_url')->justReturn('poster-medium.jpg');

    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageId' => 7,
    ], kotlinskidev_above_fold_context());

    expect($html)->toContain('data-poster="poster.jpg"');
    expect($html)->toContain('data-kt-poster-mobile="poster-medium.jpg"');
    expect($html)->not->toContain('data-poster-mobile');
});

it('adds no responsive data attributes to a lazy video slide without an image id', function () {
    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageUrl' => 'poster.jpg',
    ], kotlinskidev_above_fold_context());

    expect($html)->not->toContain('data-kt-');
});

function kotlinskidev_hero_mobile_variant_attributes(): array
{
    return [
        'slideIndex' => 0,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageId' => 7,
        'responsiveMedia' => [
            'mobile' => ['id' => 9, 'url' => 'bg-m.mp4', 'type' => 'video', 'posterId' => 11, 'posterUrl' => 'poster-m.jpg'],
        ],
    ];
}

function kotlinskidev_stub_hero_variant_media(): void
{
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('wp_get_attachment_url')->alias(fn ($id) => 11 === $id ? 'poster-m.jpg' : 'poster.jpg');
    Functions\when('wp_get_attachment_image_srcset')->alias(
        fn ($id) => 11 === $id ? 'poster-m-400.jpg 400w' : 'poster-800.jpg 800w, poster.jpg 1600w'
    );
    Functions\when('wp_get_attachment_image')->alias(
        fn ($id, $size, $icon, $attr) => '<img class="hero-carousel__poster" sizes="' . $attr['sizes'] . '">'
    );
}

it('wraps the eager poster in a picture with a mobile source and 100vw sizes when a mobile variant exists', function () {
    kotlinskidev_stub_hero_variant_media();

    $html = kotlinskidev_hero_carousel_slide_render(kotlinskidev_hero_mobile_variant_attributes(), kotlinskidev_above_fold_context());

    expect($html)->toContain('<picture class="kt-responsive-media"><source media="(max-width: 781px)" srcset="poster-m-400.jpg 400w" sizes="100vw"><img class="hero-carousel__poster" sizes="100vw"></picture>');
    expect($html)->not->toContain('max(100vw, 800px)');
});

it('preloads each poster variant with the same media string as its picture source', function () {
    kotlinskidev_stub_hero_variant_media();

    $html = kotlinskidev_hero_carousel_slide_render(kotlinskidev_hero_mobile_variant_attributes(), kotlinskidev_above_fold_context());
    $head = kotlinskidev_captured_lcp_preload();

    preg_match_all('/<source media="([^"]+)"/', $html, $source_media);
    preg_match_all('/<link[^>]* media="([^"]+)"/', $head, $preload_media);

    expect($source_media[1])->toBe(['(max-width: 781px)']);
    expect($preload_media[1])->toBe(['(max-width: 781px)', '(min-width: 782px)']);
    expect($head)->toContain('href="poster-m.jpg" media="(max-width: 781px)" imagesrcset="poster-m-400.jpg 400w" imagesizes="100vw"');
    expect($head)->toContain('href="poster.jpg" media="(min-width: 782px)" imagesrcset="poster-800.jpg 800w, poster.jpg 1600w" imagesizes="100vw"');
    kotlinskidev_reset_above_fold_state();
});

it('moves the eager video src into data attributes when a mobile video exists', function () {
    kotlinskidev_stub_hero_variant_media();

    $html = kotlinskidev_hero_carousel_slide_render(kotlinskidev_hero_mobile_variant_attributes(), kotlinskidev_above_fold_context());

    expect($html)->not->toContain(' src="bg.mp4"');
    expect($html)->toContain('data-src="bg.mp4"');
    expect($html)->toContain('data-kt-src-mobile="bg-m.mp4"');
    expect($html)->not->toContain('data-kt-src-tablet');
    kotlinskidev_reset_above_fold_state();
});

it('keeps the current poster sizes and a single unmedia preload when no variant exists', function () {
    Functions\when('wp_get_attachment_url')->justReturn('poster.jpg');
    Functions\when('wp_get_attachment_image_srcset')->justReturn('poster-800.jpg 800w, poster.jpg 1600w');
    Functions\when('wp_get_attachment_image')->justReturn('<img class="hero-carousel__poster">');

    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgVideoUrl' => 'bg.mp4', 'bgImageId' => 7], kotlinskidev_above_fold_context());

    expect($html)->not->toContain('<picture');
    expect(kotlinskidev_captured_lcp_preload())->toBe('<link rel="preload" as="image" fetchpriority="high" href="poster.jpg" imagesrcset="poster-800.jpg 800w, poster.jpg 1600w" imagesizes="max(100vw, 800px)">' . "\n");
    kotlinskidev_reset_above_fold_state();
});

it('emits a mobile video and poster as data attributes on a lazy slide', function () {
    Functions\when('wp_get_attachment_url')->justReturn('poster.jpg');

    $html = kotlinskidev_hero_carousel_slide_render(
        ['slideIndex' => 1, 'bgVideoUrl' => 'bg.mp4', 'bgImageUrl' => 'poster.jpg', 'responsiveMedia' => ['mobile' => ['url' => 'bg-m.mp4', 'posterUrl' => 'poster-m.jpg']]],
        kotlinskidev_above_fold_context()
    );

    expect($html)->toContain('data-src="bg.mp4"');
    expect($html)->toContain('data-kt-src-mobile="bg-m.mp4"');
    expect($html)->toContain('data-kt-poster-mobile="poster-m.jpg"');
});

it('marks the background as alpha when an alpha source is set', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 1, 'bgVideoUrl' => 'bg.webm', 'bgVideoAlphaUrl' => 'bg.mov']);

    expect($html)->toContain('hero-carousel__bg hero-carousel__bg--alpha');
});
