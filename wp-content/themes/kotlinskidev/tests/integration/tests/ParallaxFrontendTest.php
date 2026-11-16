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

it('adds the enable-parallax class and a data-kt-parallax-bg attribute to a below-the-fold cover block', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-cover enable-parallax');
    expect($html)->toContain('data-kt-parallax-bg="https://example.com/photo.jpg"');
    expect($html)->not->toContain('background-image');
});

it('keeps an existing style attribute intact and adds the parallax data attribute for a below-the-fold cover', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<div class="wp-block-cover" style="min-height:400px"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('style="min-height:400px"');
    expect($html)->toContain('data-kt-parallax-bg="https://example.com/photo.jpg"');
    expect($html)->not->toContain('background-image');
});

it('transforms a section-wrapped cover block the same way as a div-wrapped one', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true} -->'
        . '<section class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></section>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-cover enable-parallax');
    expect($html)->toContain('data-kt-parallax-bg="https://example.com/photo.jpg"');
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

it('escapes the url attribute to prevent attribute injection via a crafted block attribute', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg?x=\"><script>alert(1)</script>","enableParallax":true} -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('<script>');
});

it('keeps the inline background-image style for an above-the-fold cover block', function () {
    $blocks = parse_blocks(
        '<!-- wp:cover {"url":"https://example.com/photo.jpg","enableParallax":true,"kotlinskidevAboveFold":true} -->'
        . '<div class="wp-block-cover" style="min-height:400px"><div class="wp-block-cover__inner-container">x</div></div>'
        . '<!-- /wp:cover -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain("style=\"background-image:url('https://example.com/photo.jpg');min-height:400px\"");
    expect($html)->not->toContain('data-kt-parallax-bg');
});
