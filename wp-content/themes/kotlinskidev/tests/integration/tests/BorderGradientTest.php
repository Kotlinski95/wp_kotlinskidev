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

it('applies the gradient border class and css variable to the inner link for a core/button block', function () {
    $html = kotlinskidev_apply_border_gradient_style(
        '<div class="wp-block-button is-style-outline"><a class="wp-block-button__link" href="#">Go</a></div>',
        ['blockName' => 'core/button', 'attrs' => ['borderGradient' => 'red']]
    );

    expect($html)->toContain('<a');
    expect($html)->toContain('class="wp-block-button__link kt-has-gradient-border"');
    expect($html)->toContain('style="--kt-border-gradient:red;"');
    expect($html)->not->toContain('wp-block-button kt-has-gradient-border');
    expect($html)->not->toContain('is-style-outline kt-has-gradient-border');
});

it('leaves a core/button block untouched when it has no wp-block-button__link tag', function () {
    $html = '<div class="wp-block-button is-style-outline">Go</div>';

    expect(kotlinskidev_apply_border_gradient_style(
        $html,
        ['blockName' => 'core/button', 'attrs' => ['borderGradient' => 'red']]
    ))->toBe($html);
});
