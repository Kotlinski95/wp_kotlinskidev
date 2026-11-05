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

it('adds width/height metadata for a real svg attachment via the wp_generate_attachment_metadata filter', function () {
    $id = self::factory()->attachment->create_object('icon-dimensions.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    $path = get_attached_file($id);
    file_put_contents($path, '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0"/></svg>');

    $metadata = apply_filters('wp_generate_attachment_metadata', ['filesize' => filesize($path)], $id);

    expect($metadata['width'])->toBe(24);
    expect($metadata['height'])->toBe(24);

    unlink($path);
});

it('leaves metadata unchanged for a non-svg attachment', function () {
    $id = self::factory()->attachment->create_object('photo.jpg', 0, ['post_mime_type' => 'image/jpeg']);

    $metadata = apply_filters('wp_generate_attachment_metadata', ['width' => 100, 'height' => 50], $id);

    expect($metadata)->toBe(['width' => 100, 'height' => 50]);
});

it('adds a missing xmlns to a real svg file on the add_attachment hook', function () {
    $id = self::factory()->attachment->create_object('icon-no-xmlns.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    $path = get_attached_file($id);
    file_put_contents($path, '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M0 0"/></svg>');

    kotlinskidev_ensure_svg_xmlns($id);

    expect(file_get_contents($path))->toContain('xmlns="http://www.w3.org/2000/svg"');

    unlink($path);
});

it('does not modify a real svg file that already has an xmlns', function () {
    $id = self::factory()->attachment->create_object('icon-with-xmlns.svg', 0, ['post_mime_type' => 'image/svg+xml']);
    $path = get_attached_file($id);
    $original = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';
    file_put_contents($path, $original);

    kotlinskidev_ensure_svg_xmlns($id);

    expect(file_get_contents($path))->toBe($original);

    unlink($path);
});

it('does not touch a non-svg attachment file', function () {
    $id = self::factory()->attachment->create_object('photo-no-touch.jpg', 0, ['post_mime_type' => 'image/jpeg']);
    $path = get_attached_file($id);
    file_put_contents($path, 'not-an-svg');

    kotlinskidev_ensure_svg_xmlns($id);

    expect(file_get_contents($path))->toBe('not-an-svg');

    unlink($path);
});

it('does not touch the transient cache for a non-svg attachment', function () {
    $id = self::factory()->attachment->create_object('photo.jpg', 0, ['post_mime_type' => 'image/jpeg']);
    set_transient('kotlinskidev_svg_' . $id, 'should-remain', WEEK_IN_SECONDS);

    kotlinskidev_clear_svg_cache($id);

    expect(get_transient('kotlinskidev_svg_' . $id))->toBe('should-remain');

    delete_transient('kotlinskidev_svg_' . $id);
});
