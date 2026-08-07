<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_font_size_group_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group">content</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('rejects an invalid font size unit', function () {
    expect(kotlinskidev_sanitize_font_size_length('big'))->toBe('');
});

it('accepts a valid rem font size', function () {
    expect(kotlinskidev_sanitize_font_size_length('1.5rem'))->toBe('1.5rem');
});

it('leaves the block untouched when there is no responsiveFontSize attribute', function () {
    $html = kotlinskidev_font_size_group_render([]);

    expect($html)->not->toContain('kt-rfs-');
});

it('injects a generated class and a scoped style tag with real breakpoint media queries', function () {
    $html = kotlinskidev_font_size_group_render([
        'responsiveFontSize' => ['mobile' => '1rem', 'desktop' => '2rem'],
    ]);

    expect($html)->toContain('kt-rfs-');
    expect($html)->toContain('<style>');
    expect($html)->toContain('font-size:1rem !important');
    expect($html)->toContain('font-size:2rem !important');
});

it('produces the same generated class for the same values every time', function () {
    $values = ['mobile' => '1.25rem'];

    expect(kotlinskidev_responsive_font_size_class($values))->toBe(kotlinskidev_responsive_font_size_class($values));
});

it('leaves the block untouched when every configured size is invalid', function () {
    $html = kotlinskidev_font_size_group_render(['responsiveFontSize' => ['mobile' => 'huge']]);

    expect($html)->not->toContain('kt-rfs-');
});
