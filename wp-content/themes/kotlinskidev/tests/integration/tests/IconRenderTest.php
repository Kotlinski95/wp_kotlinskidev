<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_seed_icon_attachment(string $svg = '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M0 0"/></svg>'): int
{
    $id = test()->factory()->attachment->create_object('icon.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, $svg, WEEK_IN_SECONDS);

    return $id;
}

it('renders the icon block with a real inline svg', function () {
    $id = kotlinskidev_seed_icon_attachment();
    $blocks = parse_blocks('<!-- wp:kotlinskidev/icon ' . wp_json_encode(['mediaId' => $id]) . ' /-->');

    $html = render_block($blocks[0]);

    expect($html)->toContain('<svg aria-hidden="true" focusable="false" fill="currentColor"');
    expect($html)->toContain('class="kt-icon');
    expect($html)->not->toContain('fill="#000"');
});

it('overrides the default decorative attributes with role=img and aria-label when set', function () {
    $id = kotlinskidev_seed_icon_attachment();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/icon ' . wp_json_encode(['mediaId' => $id, 'ariaLabel' => 'GitHub profile']) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('role="img"');
    expect($html)->toContain('aria-label="GitHub profile"');
    expect($html)->not->toContain('aria-hidden');
});

it('adds the tooltip class and data attribute when showTooltip is enabled with an aria label', function () {
    $id = kotlinskidev_seed_icon_attachment();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/icon ' . wp_json_encode([
            'mediaId' => $id,
            'ariaLabel' => 'GitHub profile',
            'showTooltip' => true,
        ]) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('class="kt-icon kt-tooltip');
    expect($html)->toContain('data-tooltip="GitHub profile"');
});

it('does not add the tooltip when showTooltip is disabled even with an aria label', function () {
    $id = kotlinskidev_seed_icon_attachment();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/icon ' . wp_json_encode(['mediaId' => $id, 'ariaLabel' => 'GitHub profile']) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('class="kt-icon wp-block-kotlinskidev-icon"');
    expect($html)->not->toContain('kt-tooltip');
});

it('renders nothing for a missing attachment', function () {
    $blocks = parse_blocks('<!-- wp:kotlinskidev/icon ' . wp_json_encode(['mediaId' => 999999]) . ' /-->');

    $html = render_block($blocks[0]);

    expect($html)->toBe('');
});
