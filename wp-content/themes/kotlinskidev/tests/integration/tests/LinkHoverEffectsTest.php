<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_link_hover_render(array $attrs, string $inner = '<p>content</p>'): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group">' . $inner . '</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('leaves the block untouched when there are no link hover effects configured', function () {
    $html = kotlinskidev_link_hover_render([]);

    expect($html)->not->toContain('kt-hover-no-background');
    expect($html)->not->toContain('kt-hover-no-underline');
});

it('adds the no-background-hover class to the wrapper', function () {
    $html = kotlinskidev_link_hover_render(['linkHoverEffects' => ['disableBackgroundHover' => true]]);

    expect($html)->toContain('kt-hover-no-background');
});

it('adds both wrapper classes when both effects are disabled', function () {
    $html = kotlinskidev_link_hover_render([
        'linkHoverEffects' => ['disableBackgroundHover' => true, 'disableUnderlineHover' => true],
    ]);

    expect($html)->toContain('kt-hover-no-background');
    expect($html)->toContain('kt-hover-no-underline');
});

it('adds the add-underline-hover class to the wrapper', function () {
    $html = kotlinskidev_link_hover_render(['linkHoverEffects' => ['enableUnderlineHover' => true]]);

    expect($html)->toContain('kt-hover-add-underline');
});

it('reaches a real dynamic (render.php-only) block the same way, e.g. kotlinskidev/scroll-to-top', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:kotlinskidev/scroll-to-top ' . wp_json_encode([
            'variant' => 'bar',
            'linkHoverEffects' => ['enableUnderlineHover' => true],
        ]) . ' /-->'
    )[0]);

    expect($html)->toContain('kt-hover-add-underline');
});

it('adds the no-link-gradient class to every anchor inside the block', function () {
    $html = kotlinskidev_link_hover_render(
        ['linkHoverEffects' => ['disableLinkGradient' => true]],
        '<p><a href="/one">One</a> and <a href="/two">Two</a></p>'
    );

    expect(substr_count($html, 'kt-hover-no-link-gradient'))->toBe(2);
});

it('does not add the link-gradient class when the block has no anchors', function () {
    $html = kotlinskidev_link_hover_render(['linkHoverEffects' => ['disableLinkGradient' => true]]);

    expect($html)->not->toContain('kt-hover-no-link-gradient');
});
