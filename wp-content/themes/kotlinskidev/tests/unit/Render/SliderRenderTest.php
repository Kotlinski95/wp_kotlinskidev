<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/responsive-width.php';

function kotlinskidev_slider_render(array $attributes, string $content = ''): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/slider/render.php',
        $attributes,
        $content
    );
}

function kotlinskidev_slider_swiper_settings(string $html): array
{
    preg_match('/data-swiper="([^"]+)"/', $html, $matches);
    return json_decode(htmlspecialchars_decode($matches[1]), true);
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"'
    );
    Functions\when('wp_kses_data')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('wp_json_encode')->alias('json_encode');
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unique_id')->alias(fn ($prefix = '') => $prefix . '1');
});

it('defaults keyboard navigation to enabled and other toggles to disabled', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([]));

    expect($settings['keyboard'])->toBeTrue();
    expect($settings['autoplay'])->toBeFalse();
    expect($settings['navigation'])->toBeFalse();
    expect($settings['pagination'])->toBeFalse();
    expect($settings['loop'])->toBeFalse();
});

it('allows keyboard navigation to be explicitly disabled', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render(['keyboard' => false]));

    expect($settings['keyboard'])->toBeFalse();
});

it('defaults every slidesPer* setting to 1 and spaceBetween to 16', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([]));

    expect($settings['slidesPerView'])->toBe(1);
    expect($settings['slidesPerMobile'])->toBe(1);
    expect($settings['slidesPerTablet'])->toBe(1);
    expect($settings['slidesPerDesktop'])->toBe(1);
    expect($settings['spaceBetween'])->toBe(16);
});

it('reflects every configured setting', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([
        'autoplay' => true,
        'autoplayTime' => 8,
        'navigation' => true,
        'pagination' => true,
        'slidesPerView' => 3,
        'loop' => true,
        'scrollbar' => true,
        'mousewheel' => true,
        'spaceBetween' => 32,
    ]));

    expect($settings)->toMatchArray([
        'autoplay' => true,
        'autoplayTime' => 8,
        'navigation' => true,
        'pagination' => true,
        'slidesPerView' => 3,
        'loop' => true,
        'scrollbar' => true,
        'mousewheel' => true,
        'spaceBetween' => 32,
    ]);
});

it('renders the inner block content inside the swiper-wrapper', function () {
    $html = kotlinskidev_slider_render([], '<div class="swiper-slide">Slide</div>');

    expect($html)->toContain('<div class="swiper-wrapper">');
    expect($html)->toContain('<div class="swiper-slide">Slide</div>');
});

it('renders a swiper-pagination element outside the carousel by default when pagination is enabled', function () {
    $html = kotlinskidev_slider_render(['pagination' => true]);

    expect($html)->toContain('<div class="swiper-pagination kt-pagination-outside"></div>');
});

it('renders the swiper-pagination element without the outside class when paginationPlacement is inside', function () {
    $html = kotlinskidev_slider_render(['pagination' => true, 'paginationPlacement' => 'inside']);

    expect($html)->toContain('<div class="swiper-pagination"></div>');
});

it('omits the swiper-pagination element when pagination is disabled', function () {
    $html = kotlinskidev_slider_render(['pagination' => false]);

    expect($html)->not->toContain('swiper-pagination');
});

it('omits the swiper-pagination element when scrollbar is enabled instead', function () {
    $html = kotlinskidev_slider_render(['pagination' => true, 'scrollbar' => true]);

    expect($html)->not->toContain('swiper-pagination');
});

it('defaults centerSlides to false and peek to 20 in the swiper settings', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([]));

    expect($settings['centerSlides'])->toBeFalse();
});

it('adds the has-center-slides class and slide-width/max-width custom properties when centerSlides is enabled', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => true, 'peek' => 25, 'slideMaxWidth' => 800]);

    expect($html)->toContain('class="swiper has-center-slides"');
    expect($html)->toContain('style="--kt-slider-slide-width: 50%; --kt-slider-slide-max-width: 800px"');
});

it('omits the slide-width style when centerSlides is disabled', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => false, 'peek' => 25]);

    expect($html)->toContain('class="swiper"');
    expect($html)->toContain('style=""');
});

it('clamps peek to a sane 0-40 range', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => true, 'peek' => 90]);

    expect($html)->toContain('--kt-slider-slide-width: 20%');
});

it('defaults slideMaxWidth to 900px', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => true]);

    expect($html)->toContain('--kt-slider-slide-max-width: 900px');
});

it('accepts a legacy bare-number slideMaxWidth as px, unclamped', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => true, 'slideMaxWidth' => 10]);

    expect($html)->toContain('--kt-slider-slide-max-width: 10px');
});

it('accepts a unit-aware slideMaxWidth string in rem, %, or vw', function () {
    expect(
        kotlinskidev_slider_render(['centerSlides' => true, 'slideMaxWidth' => '56.25rem'])
    )->toContain('--kt-slider-slide-max-width: 56.25rem');

    expect(
        kotlinskidev_slider_render(['centerSlides' => true, 'slideMaxWidth' => '80%'])
    )->toContain('--kt-slider-slide-max-width: 80%');

    expect(
        kotlinskidev_slider_render(['centerSlides' => true, 'slideMaxWidth' => '70vw'])
    )->toContain('--kt-slider-slide-max-width: 70vw');
});

it('falls back to the 900px default for an invalid slideMaxWidth value', function () {
    $html = kotlinskidev_slider_render(['centerSlides' => true, 'slideMaxWidth' => 'not-a-length']);

    expect($html)->toContain('--kt-slider-slide-max-width: 900px');
});

it('defaults continuousAutoplay and showProgress to false in the swiper settings', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([]));

    expect($settings['continuousAutoplay'])->toBeFalse();
});

it('reflects continuousAutoplay when enabled', function () {
    $settings = kotlinskidev_slider_swiper_settings(
        kotlinskidev_slider_render(['continuousAutoplay' => true])
    );

    expect($settings['continuousAutoplay'])->toBeTrue();
});

it('renders the progress circle when autoplay and showProgress are both enabled', function () {
    $html = kotlinskidev_slider_render(['autoplay' => true, 'showProgress' => true]);

    expect($html)->toContain('class="swiper-progress"');
    expect($html)->toContain('class="swiper-progress-fill"');
    expect($html)->toContain('class="swiper-progress-track"');
});

it('omits the progress circle when showProgress is disabled', function () {
    $html = kotlinskidev_slider_render(['autoplay' => true, 'showProgress' => false]);

    expect($html)->not->toContain('swiper-progress');
});

it('omits the progress circle when autoplay is disabled, even if showProgress is on', function () {
    $html = kotlinskidev_slider_render(['autoplay' => false, 'showProgress' => true]);

    expect($html)->not->toContain('swiper-progress');
});

it('omits the progress circle in continuousAutoplay mode, even if showProgress is on — the circle assumes a discrete per-slide delay', function () {
    $html = kotlinskidev_slider_render([
        'autoplay' => true,
        'showProgress' => true,
        'continuousAutoplay' => true,
    ]);

    expect($html)->not->toContain('swiper-progress');
});

it('gives each progress circle gradient a unique id so multiple sliders on one page do not collide', function () {
    $html = kotlinskidev_slider_render(['autoplay' => true, 'showProgress' => true]);

    expect($html)->toContain('id="kt-slider-progress-1"');
    expect($html)->toContain('stroke="url(#kt-slider-progress-1)"');
});

it('defaults draggable to true in the swiper settings', function () {
    $settings = kotlinskidev_slider_swiper_settings(kotlinskidev_slider_render([]));

    expect($settings['draggable'])->toBeTrue();
});

it('reflects draggable when explicitly disabled', function () {
    $settings = kotlinskidev_slider_swiper_settings(
        kotlinskidev_slider_render(['draggable' => false])
    );

    expect($settings['draggable'])->toBeFalse();
});
