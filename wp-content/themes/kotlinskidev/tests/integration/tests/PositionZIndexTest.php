<?php

uses(Tests\Integration\TestCase::class);

it('leaves the block untouched when neither attribute is set', function () {
    $html = kotlinskidev_apply_position_z_index_classes('<div class="wp-block">x</div>', ['attrs' => []]);

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('leaves the block untouched for unrecognized values', function () {
    $html = kotlinskidev_apply_position_z_index_classes(
        '<div class="wp-block">x</div>',
        ['attrs' => ['kotlinskidevPosition' => 'fixed-ish', 'kotlinskidevZIndex' => '99']]
    );

    expect($html)->toBe('<div class="wp-block">x</div>');
});

it('adds both classes through the real render_block pipeline', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:paragraph {"kotlinskidevPosition":"absolute","kotlinskidevZIndex":"2"} --><p class="wp-block">x</p><!-- /wp:paragraph -->'
    )[0]);

    expect($html)->toContain('kt-position-absolute');
    expect($html)->toContain('kt-z-2');
});

it('adds no class through the real render_block pipeline when attributes are absent', function () {
    $html = render_block(parse_blocks(
        '<!-- wp:paragraph --><p class="wp-block">x</p><!-- /wp:paragraph -->'
    )[0]);

    expect($html)->not->toContain('kt-position-');
    expect($html)->not->toContain('kt-z-');
});
