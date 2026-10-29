<?php

uses(Tests\Integration\TestCase::class);

function render_group_with_responsive_order(array $responsiveOrder): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode(['responsiveOrder' => $responsiveOrder]) . ' -->'
        . '<div class="wp-block-group">x</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('leaves a block untouched when there is no responsiveOrder attribute', function () {
    $blocks = parse_blocks('<!-- wp:group --><div class="wp-block-group">x</div><!-- /wp:group -->');

    expect(render_block($blocks[0]))->not->toContain('order-');
});

it('adds no order class for a value of integer 0', function () {
    $html = render_group_with_responsive_order(['desktop' => 0]);

    expect($html)->not->toContain('order-desktop');
});

it('adds no order class for a value of string "0" (loose comparison correctly treats it as default)', function () {
    $html = render_group_with_responsive_order(['desktop' => '0']);

    expect($html)->not->toContain('order-desktop');
});

it('adds the order-desktop class for a positive value', function () {
    $html = render_group_with_responsive_order(['desktop' => 5]);

    expect($html)->toContain('order-desktop-5');
});

it('adds the order-tablet class for the minimum allowed value of -1', function () {
    $html = render_group_with_responsive_order(['tablet' => -1]);

    expect($html)->toContain('order-tablet--1');
});

it('adds the order-mobile class for the maximum allowed value of 20', function () {
    $html = render_group_with_responsive_order(['mobile' => 20]);

    expect($html)->toContain('order-mobile-20');
});

it('rejects a value above the maximum allowed range', function () {
    $html = render_group_with_responsive_order(['desktop' => 21]);

    expect($html)->not->toContain('order-desktop');
});

it('rejects a value below the minimum allowed range', function () {
    $html = render_group_with_responsive_order(['desktop' => -2]);

    expect($html)->not->toContain('order-desktop');
});

it('applies all three breakpoint classes at once when all three are set', function () {
    $html = render_group_with_responsive_order(['desktop' => 3, 'tablet' => -1, 'mobile' => 7]);

    expect($html)->toContain('order-desktop-3');
    expect($html)->toContain('order-tablet--1');
    expect($html)->toContain('order-mobile-7');
});

it('merges the order class into an existing class attribute rather than overwriting it', function () {
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode(['responsiveOrder' => ['desktop' => 4]]) . ' -->'
        . '<div class="wp-block-group my-custom-class">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('my-custom-class');
    expect($html)->toContain('order-desktop-4');
});

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'kotlinskidev_add_responsive_order_attributes'))->not->toBeFalse();
});
