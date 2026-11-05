<?php

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/');
}

require_once __DIR__ . '/../../includes/hover-animations.php';

it('leaves content unchanged when there is no hover animation attribute', function () {
    $content = '<div class="wp-block">Hi</div>';

    expect(kotlinskidev_render_block_with_hover_animation($content, ['attrs' => []]))->toBe($content);
});

it('leaves content unchanged for an unrecognized animation name', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-not-real']];

    expect(kotlinskidev_render_block_with_hover_animation($content, $block))->toBe($content);
});

it('leaves empty content unchanged', function () {
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale']];

    expect(kotlinskidev_render_block_with_hover_animation('', $block))->toBe('');
});

it('merges a valid hover animation class into an existing class attribute', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="wp-block hover-scale">Hi</div>');
});

it('adds a fresh class attribute when the element has none', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});

it('merges primary and additional effect classes together', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['hover-scale', 'hover-rotate']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump hover-scale hover-rotate">Hi</div>');
});

it('drops unrecognized values from hoverAnimationExtra', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['not-real']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});

it('deduplicates a value repeated between primary and extra', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-jump', 'hoverAnimationExtra' => ['hover-jump']]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-jump">Hi</div>');
});

it('adds the opacity class when hoverOpacityEnabled is set, even with no animation picked', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverOpacityEnabled' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="has-hover-opacity">Hi</div>');
});

it('combines an animation with the opacity class', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverAnimation' => 'hover-scale', 'hoverOpacityEnabled' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="hover-scale has-hover-opacity">Hi</div>');
});

it('adds the color-transition and bg-color classes and CSS custom property for a hover background color', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverBackgroundColor' => '#8209d3']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="has-hover-color-transition has-hover-bg-color" style="--hover-bg-color:#8209d3;">Hi</div>'
    );
});

it('does not add the text-color class or declaration for a hover background color alone', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverBackgroundColor' => '#8209d3']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->not->toContain('has-hover-text-color');
    expect($result)->not->toContain('--hover-text-color');
});

it('adds the text-gradient class and passes the gradient value through for a hover text gradient', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverTextColor' => 'linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="has-hover-color-transition has-hover-text-color has-hover-text-gradient" style="--hover-text-color:linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%);">Hi</div>'
    );
});

it('does not add the bg-color class or declaration for a hover text color alone', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverTextColor' => '#ffffff']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->not->toContain('has-hover-bg-color');
    expect($result)->not->toContain('--hover-bg-color');
});

it('does not add the text-gradient class for a flat hover text color', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverTextColor' => '#ffffff']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="has-hover-color-transition has-hover-text-color" style="--hover-text-color:#ffffff;">Hi</div>'
    );
});

it('adds the border class and CSS custom property for a hover border color', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverBorderColor' => '#8209d3']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="has-hover-border" style="--hover-border-color:#8209d3;">Hi</div>');
});

it('combines a hover border color with the color-transition and bg-color classes', function () {
    $content = '<div>Hi</div>';
    $block = ['attrs' => ['hoverBackgroundColor' => '#8209d3', 'hoverBorderColor' => '#ffffff']];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="has-hover-color-transition has-hover-bg-color has-hover-border" style="--hover-bg-color:#8209d3;--hover-border-color:#ffffff;">Hi</div>'
    );
});

it('combines hover background and text colors with an animation class', function () {
    $content = '<div class="wp-block">Hi</div>';
    $block = [
        'attrs' => [
            'hoverAnimation' => 'hover-jump',
            'hoverBackgroundColor' => '#8209d3',
            'hoverTextColor' => '#ffffff',
        ],
    ];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="wp-block hover-jump has-hover-color-transition has-hover-bg-color has-hover-text-color" style="--hover-bg-color:#8209d3;--hover-text-color:#ffffff;">Hi</div>'
    );
});

it('adds the has-enhanced-hover-glow class when hoverEnhancedGlow is set', function () {
    $content = '<div class="wp-block-button">Hi</div>';
    $block = ['attrs' => ['hoverEnhancedGlow' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="wp-block-button has-enhanced-hover-glow">Hi</div>');
});

it('does not add the has-enhanced-hover-glow class when hoverEnhancedGlow is false', function () {
    $content = '<div class="wp-block-button">Hi</div>';
    $block = ['attrs' => ['hoverEnhancedGlow' => false]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe('<div class="wp-block-button">Hi</div>');
});

it('suppresses has-hover-text-color when hoverEnhancedGlow is also set, but still sets the CSS custom properties for the glow to read', function () {
    $content = '<div class="wp-block-button">Hi</div>';
    $block = ['attrs' => ['hoverTextColor' => '#ffffff', 'hoverEnhancedGlow' => true]];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->toBe(
        '<div class="wp-block-button has-hover-color-transition has-enhanced-hover-glow" style="--hover-text-color:#ffffff;--hover-text-spotlight-color:#ffffff;">Hi</div>'
    );
});

it('does not set --hover-text-spotlight-color when the hover text color is a gradient, since embedding a gradient string as a radial-gradient color-stop is invalid CSS', function () {
    $content = '<div class="wp-block-button">Hi</div>';
    $block = [
        'attrs' => [
            'hoverTextColor' => 'linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)',
            'hoverEnhancedGlow' => true,
        ],
    ];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->not->toContain('--hover-text-spotlight-color');
    expect($result)->toContain('--hover-text-color:linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)');
});

it('still adds has-hover-text-gradient when hoverEnhancedGlow is set with a gradient hover text color, since hover-glow.scss needs it to pick its gradient-safe background-image branch', function () {
    $content = '<div class="wp-block-button">Hi</div>';
    $block = [
        'attrs' => [
            'hoverTextColor' => 'linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)',
            'hoverEnhancedGlow' => true,
        ],
    ];

    $result = kotlinskidev_render_block_with_hover_animation($content, $block);

    expect($result)->not->toContain('has-hover-text-color');
    expect($result)->toContain('has-hover-text-gradient');
    expect($result)->toContain('has-enhanced-hover-glow');
});
