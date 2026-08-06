<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_responsive_display_render(array $attrs, string $inner = '<p>content</p>'): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group">' . $inner . '</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('leaves the block untouched when there is no responsiveDisplay attribute', function () {
    $html = kotlinskidev_responsive_display_render([]);

    expect($html)->not->toContain('desktop:');
});

it('adds desktop, tablet, and mobile display classes for each configured breakpoint', function () {
    $html = kotlinskidev_responsive_display_render([
        'responsiveDisplay' => [
            'desktop' => ['display' => 'flex'],
            'tablet'  => ['display' => 'block'],
            'mobile'  => ['display' => 'none'],
        ],
    ]);

    expect($html)->toContain('desktop:flex');
    expect($html)->toContain('tablet:block');
    expect($html)->toContain('mobile:none');
});

it('adds every configured layout property for a single breakpoint', function () {
    $html = kotlinskidev_responsive_display_render([
        'responsiveDisplay' => [
            'desktop' => [
                'display' => 'flex',
                'flexDirection' => 'row',
                'justifyContent' => 'center',
                'alignItems' => 'center',
            ],
        ],
    ]);

    expect($html)->toContain('desktop:flex');
    expect($html)->toContain('desktop:row');
    expect($html)->toContain('desktop:center');
});

it('applies the is-visible-desktop class for the desktop-only visibility setting', function () {
    $html = kotlinskidev_responsive_display_render(['visibility' => 'desktop']);

    expect($html)->toContain('is-visible-desktop');
});

it('does not add a visibility class for the default both setting', function () {
    $html = kotlinskidev_responsive_display_render(['visibility' => 'both']);

    expect($html)->not->toContain('is-visible-');
});

it('does not duplicate the visibility class when already present', function () {
    $blocks = parse_blocks(
        '<!-- wp:group {"visibility":"mobile"} -->'
        . '<div class="wp-block-group is-visible-mobile">x</div>'
        . '<!-- /wp:group -->'
    );

    $html = render_block($blocks[0]);

    expect(substr_count($html, 'is-visible-mobile'))->toBe(1);
});
