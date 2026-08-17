<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_seed_icon_extension_attachment(): int
{
    $id = test()->factory()->attachment->create_object('arrow.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', WEEK_IN_SECONDS);

    return $id;
}

it('splices the icon before the label on a real kotlinskidev/button render', function () {
    $icon_id = kotlinskidev_seed_icon_extension_attachment();
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/button ' . wp_json_encode([
            'text'    => 'Contact',
            'url'     => 'https://example.test',
            'iconId'  => $icon_id,
        ]) . ' /-->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('<span class="kt-icon kt-icon--inline">');
    expect(strpos($html, 'kt-icon--inline'))->toBeLessThan(strpos($html, 'Contact'));
});

it('splices the icon before the label on a real core/button render', function () {
    $icon_id = kotlinskidev_seed_icon_extension_attachment();
    $blocks = parse_blocks(
        '<!-- wp:button ' . wp_json_encode(['iconId' => $icon_id]) . ' -->'
        . '<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.test">Buy now</a></div>'
        . '<!-- /wp:button -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-icon--inline');
    expect(strpos($html, 'kt-icon--inline'))->toBeLessThan(strpos($html, 'Buy now'));
});

it('leaves the block untouched when iconId is not set', function () {
    $blocks = parse_blocks(
        '<!-- wp:button -->'
        . '<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.test">Buy now</a></div>'
        . '<!-- /wp:button -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('kt-icon');
});

it('is registered on the render_block filter', function () {
    expect(has_filter('render_block', 'kotlinskidev_apply_icon_extension'))->not->toBeFalse();
});
