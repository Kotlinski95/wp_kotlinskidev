<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when there is no borderGradient attribute', function () {
    $blocks = parse_blocks('<!-- wp:group --><div class="wp-block-group">x</div><!-- /wp:group -->');

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-has-gradient-border');
});

it('adds the gradient border class and css variable for a configured group block', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"borderGradient":"linear-gradient(90deg,red,blue)"} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-has-gradient-border');
    expect($html)->toContain('--kt-border-gradient:linear-gradient(90deg,red,blue)');
});

it('includes the configured border width as a css variable', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"borderGradient":"red","style":{"border":{"width":"3px"}}} -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('--kt-border-width:3px');
});

it('excludes the kotlinskidev/button block from the gradient border feature', function () {
    expect(kotlinskidev_apply_border_gradient_style(
        '<div class="wp-block">x</div>',
        ['blockName' => 'kotlinskidev/button', 'attrs' => ['borderGradient' => 'red']]
    ))->toBe('<div class="wp-block">x</div>');
});
