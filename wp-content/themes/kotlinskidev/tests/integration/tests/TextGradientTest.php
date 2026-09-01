<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when there is no textGradient attribute', function () {
    $blocks = parse_blocks('<!-- wp:paragraph --><p class="wp-block-paragraph">x</p><!-- /wp:paragraph -->');

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-gradient-text');
});

it('adds the gradient-text class and css variable for a configured paragraph block', function () {
    $blocks = parse_blocks(
        '<!-- wp:paragraph {"textGradient":"linear-gradient(90deg,red,blue)"} -->'
        . '<p class="wp-block-paragraph">x</p>'
        . '<!-- /wp:paragraph -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-gradient-text');
    expect($html)->toContain('--kt-text-gradient:linear-gradient(90deg,red,blue)');
});

it('adds the gradient-text class and css variable for a configured heading block', function () {
    $blocks = parse_blocks(
        '<!-- wp:heading {"textGradient":"red","level":2} -->'
        . '<h2 class="wp-block-heading">x</h2>'
        . '<!-- /wp:heading -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-gradient-text');
    expect($html)->toContain('style="--kt-text-gradient:red;"');
});

it('does not duplicate the gradient-text class when already present', function () {
    $html = kotlinskidev_apply_text_gradient_style(
        '<p class="wp-block-paragraph kt-gradient-text">x</p>',
        ['attrs' => ['textGradient' => 'red']]
    );

    expect(substr_count($html, 'kt-gradient-text'))->toBe(1);
});
