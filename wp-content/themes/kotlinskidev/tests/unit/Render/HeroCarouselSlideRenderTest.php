<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/above-fold-media.php';

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
    kotlinskidev_claim_lcp_slot('other.jpg');

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
    expect($html)->toContain('fetchpriority="high"');
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
