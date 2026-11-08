<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_cover_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:cover ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-cover"><div class="wp-block-cover__inner-container">content</div></div>'
        . '<!-- /wp:cover -->'
    );

    return render_block($blocks[0]);
}

it('leaves the block untouched when there is no responsiveHeight attribute', function () {
    $html = kotlinskidev_cover_render([]);

    expect($html)->not->toContain('kt-has-responsive-height');
});

it('adds per-breakpoint classes and css variables for each configured device', function () {
    $html = kotlinskidev_cover_render([
        'responsiveHeight' => [
            'desktop' => ['minHeight' => '430px'],
            'mobile'  => ['minHeight' => '200px'],
        ],
    ]);

    expect($html)->toContain('kt-has-responsive-height-desktop');
    expect($html)->toContain('kt-has-responsive-height-tablet');
    expect($html)->toContain('kt-has-responsive-height-mobile');
    expect($html)->toContain('--kt-min-height-desktop:430px');
    expect($html)->toContain('--kt-min-height-mobile:200px');
});

it('does not add the desktop class when only mobile is configured', function () {
    $html = kotlinskidev_cover_render([
        'responsiveHeight' => [
            'mobile' => ['minHeight' => '200px'],
        ],
    ]);

    expect($html)->not->toContain('kt-has-responsive-height-desktop');
    expect($html)->toContain('kt-has-responsive-height-mobile');
});

it('leaves the block untouched when every device value is invalid', function () {
    $html = kotlinskidev_cover_render(['responsiveHeight' => ['desktop' => ['minHeight' => 'not-a-length']]]);

    expect($html)->not->toContain('kt-has-responsive-height');
});
