<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_load_more_group_render(array $attrs, string $inner = 'content'): string
{
    $blocks = parse_blocks(
        '<!-- wp:group ' . wp_json_encode($attrs) . ' -->'
        . '<div class="wp-block-group">' . $inner . '</div>'
        . '<!-- /wp:group -->'
    );

    return render_block($blocks[0]);
}

it('leaves the block untouched when there is no loadMore attribute', function () {
    $html = kotlinskidev_load_more_group_render([]);

    expect($html)->not->toContain('kt-has-load-more');
});

it('leaves the block untouched when loadMore is disabled', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => false, 'initialCount' => 3 ],
    ]);

    expect($html)->not->toContain('kt-has-load-more');
});

it('leaves the block untouched when initialCount is zero', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 0 ],
    ]);

    expect($html)->not->toContain('kt-has-load-more');
});

it('adds the load-more class and initial-count data attribute through the real block pipeline', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3 ],
    ]);

    expect($html)->toContain('kt-has-load-more');
    expect($html)->toContain('data-kt-load-more-initial="3"');
    expect($html)->not->toContain('data-kt-load-more-label');
});

it('adds the custom button label as a data attribute when provided', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'buttonLabel' => 'Pokaż więcej' ],
    ]);

    expect($html)->toContain('data-kt-load-more-label="Pokaż więcej"');
});

it('does not apply loadMore attributes to a block other than core/group', function () {
    $blocks = parse_blocks(
        '<!-- wp:paragraph {"loadMore":{"enabled":true,"initialCount":3}} -->'
        . '<p>content</p>'
        . '<!-- /wp:paragraph -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-has-load-more');
});
