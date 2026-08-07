<?php

uses(Tests\Integration\TestCase::class);

it('allows svg and svgz uploads', function () {
    $mimes = kotlinskidev_allow_svg_uploads([]);

    expect($mimes['svg'])->toBe('image/svg+xml');
    expect($mimes['svgz'])->toBe('image/svg+xml');
});

it('returns an empty string when the attachment file does not exist on disk', function () {
    $id = self::factory()->attachment->create_object('missing.svg', 0, ['post_mime_type' => 'image/svg+xml']);

    expect(kotlinskidev_load_svg_content($id))->toBe('');
});

it('inlines a real svg into wp_get_attachment_image output for an svg attachment', function () {
    $id = self::factory()->attachment->create_object('icon.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', WEEK_IN_SECONDS);

    $result = kotlinskidev_inline_svg_image('<img class="attachment-full" src="icon.svg">', $id);

    expect($result)->toContain('<svg aria-hidden="true" focusable="false" class="attachment-full"');

    delete_transient('kotlinskidev_svg_' . $id);
});

it('leaves the image markup untouched for a non-svg attachment', function () {
    $id = self::factory()->attachment->create_object('photo.jpg', 0, ['post_mime_type' => 'image/jpeg']);

    $html = '<img class="attachment-full" src="photo.jpg">';
    expect(kotlinskidev_inline_svg_image($html, $id))->toBe($html);
});

it('inlines a real svg into the core/image block render output', function () {
    $id = self::factory()->attachment->create_object('icon.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', WEEK_IN_SECONDS);

    $blocks = parse_blocks(
        '<!-- wp:image {"id":' . $id . '} -->'
        . '<figure class="wp-block-image"><img src="icon.svg" alt="" class="wp-image-' . $id . '"/></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->toContain('<svg aria-hidden="true" focusable="false"');

    delete_transient('kotlinskidev_svg_' . $id);
});

it('leaves the block untouched when the image block has no attachment id', function () {
    $blocks = parse_blocks(
        '<!-- wp:image -->'
        . '<figure class="wp-block-image"><img src="external.jpg" alt=""/></figure>'
        . '<!-- /wp:image -->'
    );

    $html = render_block($blocks[0]);

    expect($html)->not->toContain('<svg');
});

it('clears the svg transient cache when an svg attachment is edited', function () {
    $id = self::factory()->attachment->create_object('icon.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    set_transient('kotlinskidev_svg_' . $id, '<svg></svg>', WEEK_IN_SECONDS);

    kotlinskidev_clear_svg_cache($id);

    expect(get_transient('kotlinskidev_svg_' . $id))->toBeFalse();
});

it('does not touch the transient cache for a non-svg attachment', function () {
    $id = self::factory()->attachment->create_object('photo.jpg', 0, ['post_mime_type' => 'image/jpeg']);
    set_transient('kotlinskidev_svg_' . $id, 'should-remain', WEEK_IN_SECONDS);

    kotlinskidev_clear_svg_cache($id);

    expect(get_transient('kotlinskidev_svg_' . $id))->toBe('should-remain');

    delete_transient('kotlinskidev_svg_' . $id);
});
