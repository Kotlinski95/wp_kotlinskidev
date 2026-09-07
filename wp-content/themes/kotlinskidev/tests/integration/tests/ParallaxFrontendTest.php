<?php

uses(Tests\Integration\TestCase::class);

it('leaves a non-cover block untouched even with enableParallax set', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"enableParallax":true} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('enable-parallax');
});

it('leaves a cover block untouched when enableParallax is not set', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg"} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('enable-parallax');
});

it('leaves a cover block untouched when enableParallax is set but there is no url', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('enable-parallax');
});

it('adds the enable-parallax class and a background-image style to a cover block with no existing style', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-cover enable-parallax');
    expect($html)->toContain("style=\"background-image:url('https://example.com/photo.jpg');\"");
});

it('prepends the background-image declaration into an existing style attribute rather than overwriting it', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover" style="min-height:400px"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain(
        "style=\"background-image:url('https://example.com/photo.jpg');min-height:400px\""
    );
});

it('transforms a section-wrapped cover block the same way as a div-wrapped one', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<section class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></section>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-cover enable-parallax');
    expect($html)->toContain("style=\"background-image:url('https://example.com/photo.jpg');\"");
});

it('only rewrites the first wp-block-cover tag, leaving inner markup untouched', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover">'
        . '<div class="wp-block-cover__inner-container">'
        . '<div class="wp-block-cover another-wp-block-cover-marker">nested</div>'
        . '</div>'
        . '</div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect(substr_count($html, 'enable-parallax'))->toBe(1);
});

it('defaults data-parallax-intensity to 15 when parallaxIntensity is not set', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('data-parallax-intensity="15"');
});

it('carries a custom parallaxIntensity through to data-parallax-intensity', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true,"parallaxIntensity":6} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('data-parallax-intensity="6"');
});

it('clamps an out-of-range parallaxIntensity to the 0-30 bounds', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true,"parallaxIntensity":999} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('data-parallax-intensity="30"');
});

it('escapes the url attribute to prevent attribute injection via a crafted block attribute', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg?x=\"><script>alert(1)</script>","enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('<script>');
});
