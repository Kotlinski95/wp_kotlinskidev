<?php

require_once __DIR__ . '/../../functions/slider-modal-trigger.php';

it('recognizes a core/cover block with a swiper-slide class', function () {
    expect(kotlinskidev_is_slider_slide_block([
        'blockName' => 'core/cover',
        'attrs'     => ['className' => 'swiper-slide'],
    ]))->toBeTrue();
});

it('recognizes swiper-slide alongside other classes', function () {
    expect(kotlinskidev_is_slider_slide_block([
        'blockName' => 'core/cover',
        'attrs'     => ['className' => 'is-style-default swiper-slide is-light'],
    ]))->toBeTrue();
});

it('rejects a core/cover block without the swiper-slide class', function () {
    expect(kotlinskidev_is_slider_slide_block([
        'blockName' => 'core/cover',
        'attrs'     => ['className' => 'is-style-default'],
    ]))->toBeFalse();
});

it('rejects a core/cover block with no className at all', function () {
    expect(kotlinskidev_is_slider_slide_block([
        'blockName' => 'core/cover',
        'attrs'     => [],
    ]))->toBeFalse();
});

it('rejects a non-cover block even with a swiper-slide className', function () {
    expect(kotlinskidev_is_slider_slide_block([
        'blockName' => 'core/group',
        'attrs'     => ['className' => 'swiper-slide'],
    ]))->toBeFalse();
});

it('rejects a block with no blockName', function () {
    expect(kotlinskidev_is_slider_slide_block([]))->toBeFalse();
});
