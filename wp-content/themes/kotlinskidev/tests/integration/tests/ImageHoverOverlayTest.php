<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when the overlay is not enabled', function () {
    $blocks = parse_blocks(
        '<!-- wp:image {"sizeSlug":"full"} -->'
        . '<figure class="wp-block-image size-full"><img src="a.jpg" alt=""/></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toBe('<figure class="wp-block-image size-full"><img src="a.jpg" alt=""/></figure>');
});

it('inserts the overlay markup inside the figure when enabled with a heading and description', function () {
    $blocks = parse_blocks(
        '<!-- wp:image {"sizeSlug":"full","kotlinskidevOverlayEnabled":true,"kotlinskidevOverlayHeading":"Our Work","kotlinskidevOverlayDescription":"See the case study"} -->'
        . '<figure class="wp-block-image size-full"><img src="a.jpg" alt=""/></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-image-hover-overlay');
    expect($html)->toContain('<span class="kt-image-hover-overlay__heading">Our Work</span>');
    expect($html)->toContain('<span class="kt-image-hover-overlay__description">See the case study</span>');
    expect($html)->toEndWith('</figure>');
});

it('preserves the figcaption alongside the overlay when the image has a caption', function () {
    $blocks = parse_blocks(
        '<!-- wp:image {"sizeSlug":"full","kotlinskidevOverlayEnabled":true,"kotlinskidevOverlayHeading":"Our Work"} -->'
        . '<figure class="wp-block-image size-full"><img src="a.jpg" alt=""/><figcaption class="wp-element-caption">A caption</figcaption></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('<figcaption class="wp-element-caption">A caption</figcaption>');
    expect($html)->toContain('kt-image-hover-overlay__heading');
});

it('escapes the heading and description on the frontend', function () {
    $blocks = parse_blocks(
        '<!-- wp:image {"sizeSlug":"full","kotlinskidevOverlayEnabled":true,"kotlinskidevOverlayHeading":"<script>alert(1)<\/script>"} -->'
        . '<figure class="wp-block-image size-full"><img src="a.jpg" alt=""/></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('<script>');
});

it('leaves other blocks untouched even with overlay attrs set', function () {
    $html = kotlinskidev_apply_image_overlay(
        '<div class="wp-block-columns">x</div>',
        [
            'blockName' => 'core/columns',
            'attrs' => ['kotlinskidevOverlayEnabled' => true, 'kotlinskidevOverlayHeading' => 'Hi'],
        ]
    );

    expect($html)->not->toContain('kt-image-hover-overlay');
});
