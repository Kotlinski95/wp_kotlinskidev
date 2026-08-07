<?php

use Brain\Monkey\Functions;

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
    Functions\when('get_block_wrapper_attributes')->justReturn('class="swiper"');
    Functions\when('wp_kses_data')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));
    Functions\when('wp_json_encode')->alias('json_encode');
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
