<?php

use Brain\Monkey\Functions;

function kotlinskidev_scroll_section_render(array $attributes, string $content = ''): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-section/render.php',
        $attributes,
        $content
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('defaults markers to false, slide width to auto, and trigger to center', function () {
    $html = kotlinskidev_scroll_section_render([]);

    expect($html)->toContain('data-markers="false"');
    expect($html)->toContain('data-slide-width="auto"');
    expect($html)->toContain('data-trigger="center"');
});

it('reflects configured markers, slide width, and trigger', function () {
    $html = kotlinskidev_scroll_section_render(['markers' => true, 'slideWidth' => 'full', 'trigger' => 'top']);

    expect($html)->toContain('data-markers="true"');
    expect($html)->toContain('data-slide-width="full"');
    expect($html)->toContain('data-trigger="top"');
});

it('applies a background style only when a background color is set', function () {
    $withoutBg = kotlinskidev_scroll_section_render([]);
    $withBg = kotlinskidev_scroll_section_render(['backgroundColor' => '#111111']);

    expect($withoutBg)->toContain('style=""');
    expect($withBg)->toContain('style="background: #111111;"');
});

it('renders the inner block content inside the track', function () {
    $html = kotlinskidev_scroll_section_render([], '<div>Slide</div>');

    expect($html)->toContain('<div class="scroll-section__track scrollx-section">');
    expect($html)->toContain('<div>Slide</div>');
});

it('scroll-section item wraps its inner block content', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="scroll-section__item"');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/scroll-section/item/render.php',
        [],
        '<p>Item content</p>'
    );

    expect($html)->toContain('<div class="scroll-section__item">');
    expect($html)->toContain('<p>Item content</p>');
});
