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

it('adds the align data attribute only when not left', function () {
    $left = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'buttonAlign' => 'left' ],
    ]);
    $center = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'buttonAlign' => 'center' ],
    ]);

    expect($left)->not->toContain('data-kt-load-more-align');
    expect($center)->toContain('data-kt-load-more-align="center"');
});

it('adds text, background and border color data attributes when provided', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [
            'enabled'         => true,
            'initialCount'    => 3,
            'textColor'       => '#ffffff',
            'backgroundColor' => '#111111',
            'borderColor'     => '#8209d3',
        ],
    ]);

    expect($html)->toContain('data-kt-load-more-text-color="#ffffff"');
    expect($html)->toContain('data-kt-load-more-bg-color="#111111"');
    expect($html)->toContain('data-kt-load-more-border-color="#8209d3"');
});

it('adds border width and radius data attributes only away from defaults', function () {
    $default = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'borderWidth' => 0, 'borderRadius' => 6 ],
    ]);
    $custom = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'borderWidth' => 2, 'borderRadius' => 20 ],
    ]);

    expect($default)->not->toContain('data-kt-load-more-border-width');
    expect($default)->not->toContain('data-kt-load-more-border-radius');
    expect($custom)->toContain('data-kt-load-more-border-width="2"');
    expect($custom)->toContain('data-kt-load-more-border-radius="20"');
});

it('adds hover text, background and border color data attributes when provided', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [
            'enabled'              => true,
            'initialCount'         => 3,
            'hoverTextColor'       => '#000000',
            'hoverBackgroundColor' => '#eeeeee',
            'hoverBorderColor'     => '#8209d3',
        ],
    ]);

    expect($html)->toContain('data-kt-load-more-hover-text-color="#000000"');
    expect($html)->toContain('data-kt-load-more-hover-bg-color="#eeeeee"');
    expect($html)->toContain('data-kt-load-more-hover-border-color="#8209d3"');
});

it('omits hover color data attributes when not provided', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3 ],
    ]);

    expect($html)->not->toContain('data-kt-load-more-hover-text-color');
    expect($html)->not->toContain('data-kt-load-more-hover-bg-color');
    expect($html)->not->toContain('data-kt-load-more-hover-border-color');
});

it('adds the underline data attribute only when enabled', function () {
    $html = kotlinskidev_load_more_group_render([
        'loadMore' => [ 'enabled' => true, 'initialCount' => 3, 'underline' => true ],
    ]);

    expect($html)->toContain('data-kt-load-more-underline="1"');
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
