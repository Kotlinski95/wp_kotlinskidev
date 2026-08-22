<?php

use Brain\Monkey\Functions;

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
});

it('preloads the poster image only for the first, non-lazy slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg']);

    expect($html)->toContain('<link rel="preload" as="image" fetchpriority="high" href="bg.jpg">');
});

it('does not preload for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 1, 'bgImageUrl' => 'bg.jpg']);

    expect($html)->not->toContain('rel="preload"');
});

it('treats the first slide as lazy when the carousel context requests lazy loading', function () {
    $html = kotlinskidev_hero_carousel_slide_render(
        ['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg'],
        ['kotlinskidev/lazyLoad' => true]
    );

    expect($html)->not->toContain('rel="preload"');
    expect($html)->toContain('loading="lazy"');
});

it('renders an eager, high-priority image for the first slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageUrl' => 'bg.jpg']);

    expect($html)->toContain('loading="eager"');
    expect($html)->toContain('fetchpriority="high"');
});

it('renders a lazy image with no fetchpriority for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 2, 'bgImageUrl' => 'bg.jpg']);

    expect($html)->toContain('loading="lazy"');
    expect($html)->not->toContain('fetchpriority');
});

it('renders an eager autoplaying video with a poster for the first slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 0,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageUrl' => 'poster.jpg',
    ]);

    expect($html)->toContain('src="bg.mp4"');
    expect($html)->toContain('autoplay');
    expect($html)->toContain('poster="poster.jpg"');
    expect($html)->not->toContain('data-src=');
});

it('renders a lazy video using data-src and data-poster for a later slide', function () {
    $html = kotlinskidev_hero_carousel_slide_render([
        'slideIndex' => 1,
        'bgVideoUrl' => 'bg.mp4',
        'bgImageUrl' => 'poster.jpg',
    ]);

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

    $html = kotlinskidev_hero_carousel_slide_render(['slideIndex' => 0, 'bgImageId' => 5]);

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
