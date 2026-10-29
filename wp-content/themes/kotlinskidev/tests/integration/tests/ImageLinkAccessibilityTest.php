<?php

uses(Tests\Integration\TestCase::class);

it('leaves non-image blocks untouched', function () {
    $html = '<a href="' . home_url('/en/services/') . '">x</a>';

    expect(kotlinskidev_add_image_link_aria_label($html))->toBe($html);
});

it('leaves an image block with no link untouched', function () {
    $html = '<figure class="wp-block-image"><img src="x.jpg"/></figure>';

    expect(kotlinskidev_add_image_link_aria_label($html))->toBe($html);
});

it('leaves an image block that already has an aria-label untouched', function () {
    $html = '<figure class="wp-block-image"><a href="' . home_url('/en/services/') . '" aria-label="already set">x</a></figure>';

    expect(kotlinskidev_add_image_link_aria_label($html))->toBe($html);
});

it('adds the known aria-label for a recognized icon-link href', function () {
    $href = home_url('/en/services/');
    $html = '<figure class="wp-block-image"><a href="' . $href . '"><img src="x.jpg"/></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($html);

    expect($result)->toContain('aria-label="View services"');
});

it('leaves an image block linking to an unrecognized href untouched', function () {
    $html = '<figure class="wp-block-image"><a href="' . home_url('/some-other-page/') . '"><img src="x.jpg"/></a></figure>';

    expect(kotlinskidev_add_image_link_aria_label($html))->toBe($html);
});

it('is registered on the render_block_core/image filter', function () {
    $href = home_url('/kontakt/');
    $html = '<figure class="wp-block-image"><a href="' . $href . '"><img src="x.jpg"/></a></figure>';

    $result = apply_filters('render_block_core/image', $html, ['blockName' => 'core/image']);

    expect($result)->toContain('aria-label="Kontakt"');
});
