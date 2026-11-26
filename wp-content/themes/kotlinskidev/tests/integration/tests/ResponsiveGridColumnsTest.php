<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_grid_group_render(array $attrs): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group is-layout-grid">content</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'kotlinskidev_apply_responsive_grid_columns_style'))->toBe(10);
});

it('accepts column counts from 1 to 12 and rounds fractions', function () {
    expect(kotlinskidev_sanitize_grid_columns(1))->toBe('1');
    expect(kotlinskidev_sanitize_grid_columns('12'))->toBe('12');
    expect(kotlinskidev_sanitize_grid_columns(2.6))->toBe('3');
});

it('rejects out-of-range and non-numeric column counts', function () {
    foreach ([0, 13, -2, 'abc', '', null, [], 0.4] as $value) {
        expect(kotlinskidev_sanitize_grid_columns($value))->toBe('');
    }
});

it('builds one declaration per valid device in desktop, tablet, mobile order', function () {
    expect(kotlinskidev_build_responsive_grid_columns_declarations([
        'mobile'  => 1,
        'desktop' => 4,
        'tablet'  => 99,
    ]))->toBe(['--kt-grid-columns-desktop:4', '--kt-grid-columns-mobile:1']);
});

it('adds the class and custom properties to a grid group', function () {
    $html = kotlinskidev_grid_group_render([
        'layout'                  => ['type' => 'grid'],
        'kotlinskidevGridColumns' => ['desktop' => 4, 'tablet' => 2, 'mobile' => 1],
    ]);

    expect($html)->toContain('kt-has-responsive-grid-columns');
    expect($html)->toContain('--kt-grid-columns-desktop:4;--kt-grid-columns-tablet:2;--kt-grid-columns-mobile:1;');
});

it('skips blocks whose layout is not a grid', function () {
    $html = kotlinskidev_grid_group_render([
        'layout'                  => ['type' => 'flex'],
        'kotlinskidevGridColumns' => ['desktop' => 4],
    ]);

    expect($html)->not->toContain('kt-has-responsive-grid-columns');
    expect($html)->not->toContain('--kt-grid-columns');
});

it('skips blocks without the attribute or with only invalid values', function () {
    expect(kotlinskidev_grid_group_render(['layout' => ['type' => 'grid']]))->not->toContain('kt-has-responsive-grid-columns');
    expect(kotlinskidev_grid_group_render([
        'layout'                  => ['type' => 'grid'],
        'kotlinskidevGridColumns' => ['desktop' => 40],
    ]))->not->toContain('kt-has-responsive-grid-columns');
});

it('keeps an existing style attribute and does not duplicate the class', function () {
    $html = kotlinskidev_apply_responsive_grid_columns_style(
        '<div class="wp-block-group kt-has-responsive-grid-columns" style="gap:1px;">x</div>',
        ['attrs' => ['layout' => ['type' => 'grid'], 'kotlinskidevGridColumns' => ['tablet' => 3]]]
    );

    expect($html)->toBe('<div class="wp-block-group kt-has-responsive-grid-columns" style="gap:1px;--kt-grid-columns-tablet:3;">x</div>');
});

it('returns empty content untouched', function () {
    expect(kotlinskidev_apply_responsive_grid_columns_style('', ['attrs' => ['layout' => ['type' => 'grid'], 'kotlinskidevGridColumns' => ['desktop' => 2]]]))->toBe('');
});
