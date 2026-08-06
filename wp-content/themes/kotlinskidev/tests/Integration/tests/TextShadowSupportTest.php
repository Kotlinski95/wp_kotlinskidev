<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_text_shadow_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:paragraph ' . wp_json_encode($attrs) . ' -->'
        . '<p class="wp-block-paragraph">hello</p>'
        . '<!-- /wp:paragraph -->'
    );

    return render_block($blocks[0]);
}

it('leaves the block untouched when no text shadow is configured', function () {
    $html = kotlinskidev_text_shadow_render([]);

    expect($html)->not->toContain('text-shadow');
});

it('adds a text-shadow style to a block with no existing style attribute', function () {
    $html = kotlinskidev_text_shadow_render(['kotlinskidevTextShadow' => '2px 2px 4px #000']);

    expect($html)->toContain('style="text-shadow:2px 2px 4px #000;"');
});

it('appends the text-shadow to an existing style attribute', function () {
    $blocks = parse_blocks(
        '<!-- wp:paragraph {"kotlinskidevTextShadow":"1px 1px red"} -->'
        . '<p class="wp-block-paragraph" style="color:blue">hello</p>'
        . '<!-- /wp:paragraph -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('style="color:blue;text-shadow:1px 1px red;"');
});
