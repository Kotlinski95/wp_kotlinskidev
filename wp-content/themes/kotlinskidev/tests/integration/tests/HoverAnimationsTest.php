<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when no hover animation attribute is set', function () {
    $html = kotlinskidev_render_block_with_hover_animation('<div class="wp-block">x</div>', ['attrs' => []]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched for an unrecognized animation name', function () {
    $html = kotlinskidev_render_block_with_hover_animation('<div class="wp-block">x</div>', ['attrs' => ['hoverAnimation' => 'hover-explode']]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('appends a valid hover animation class to an existing class attribute', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div class="wp-block">x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-jump']]
    );

    expect($html)->toBe('<div class="wp-block hover-jump">x</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div>x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-scale']]
    );

    expect($html)->toBe('<div class="hover-scale">x</div>');
});

it('accepts every documented hover animation name', function () {
    foreach ([
        'hover-jump', 'hover-jump-subtle', 'hover-jump-smooth', 'hover-jump-strong',
        'hover-jump-shadow', 'hover-scale', 'hover-fade', 'hover-rotate', 'hover-bounce',
    ] as $animation) {
        $html = kotlinskidev_render_block_with_hover_animation(
            '<div class="wp-block">x</div>',
            ['attrs' => ['hoverAnimation' => $animation]]
        );

        expect($html)->toContain($animation);
    }
});

it('combines a primary animation with additional effects into one class list', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div>x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['hover-scale', 'hover-rotate']]]
    );

    expect($html)->toBe('<div class="hover-jump hover-scale hover-rotate">x</div>');
});

it('adds the opacity class alongside an animation', function () {
    $html = kotlinskidev_render_block_with_hover_animation(
        '<div class="wp-block">x</div>',
        ['attrs' => ['hoverAnimation' => 'hover-scale', 'hoverOpacityEnabled' => true]]
    );

    expect($html)->toBe('<div class="wp-block hover-scale has-hover-opacity">x</div>');
});

it('applies the hover color CSS custom properties to a real dynamic block, since it never goes through blocks.getSaveContent.extraProps', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'bar',
            'hoverBackgroundColor' => '#8209d3',
            'hoverTextColor' => 'linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)',
        ]) . ' /-->'
    )[0]);

    expect($html)->toContain('has-hover-color-transition');
    expect($html)->toContain('has-hover-text-gradient');
    expect($html)->toContain('--hover-bg-color:#8209d3');
    expect($html)->toContain('--hover-text-color:linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)');
});

it('does not add the text-gradient class for a flat hover text color on a real dynamic block', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'bar',
            'hoverTextColor' => '#ffffff',
        ]) . ' /-->'
    )[0]);

    expect($html)->toContain('has-hover-color-transition');
    expect($html)->not->toContain('has-hover-text-gradient');
});
