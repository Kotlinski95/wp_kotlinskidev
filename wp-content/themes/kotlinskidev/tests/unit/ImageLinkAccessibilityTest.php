<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/image-link-accessibility.php';

beforeEach(function () {
    Functions\when('home_url')->alias(fn ($path) => 'https://example.test' . $path);
    Functions\when('__')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
});

it('leaves content unchanged when it is not a wp-block-image', function () {
    $content = '<figure class="wp-block-paragraph"><a href="https://example.test/en/services/">x</a></figure>';

    expect(kotlinskidev_add_image_link_aria_label($content))->toBe($content);
});

it('leaves content unchanged when the image has no link', function () {
    $content = '<figure class="wp-block-image"><img src="x.jpg"></figure>';

    expect(kotlinskidev_add_image_link_aria_label($content))->toBe($content);
});

it('leaves content unchanged when an aria-label is already present', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/en/services/" aria-label="Existing"><img src="x.jpg"></a></figure>';

    expect(kotlinskidev_add_image_link_aria_label($content))->toBe($content);
});

it('injects the matching aria-label right after the href attribute', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/en/services/"><img src="x.jpg"></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($content);

    expect($result)->toBe(
        '<figure class="wp-block-image"><a href="https://example.test/en/services/" aria-label="View services"><img src="x.jpg"></a></figure>'
    );
});

it('injects the polish label for a polish-path href', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/uslugi/"><img src="x.jpg"></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($content);

    expect($result)->toContain('aria-label="Zobacz usługi"');
});

it('leaves content unchanged when the link href does not match any known page', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/random/"><img src="x.jpg"></a></figure>';

    expect(kotlinskidev_add_image_link_aria_label($content))->toBe($content);
});

it('labels a media-file link using the image alt text', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/wp-content/uploads/2025/07/smartshopping-lighthouse.jpg" target="_blank" rel="noreferrer noopener"><img src="x.jpg" alt="Smart Shopping Lighthouse report"></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($content);

    expect($result)->toContain('aria-label="View full-size image: Smart Shopping Lighthouse report"');
});

it('falls back to a generic label for a media-file link with no alt text', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/wp-content/uploads/2025/07/photo.jpg"><img src="x.jpg" alt=""></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($content);

    expect($result)->toContain('aria-label="View full-size image"');
});

it('decodes HTML entities in the alt text before building the label', function () {
    $content = '<figure class="wp-block-image"><a href="https://example.test/wp-content/uploads/2025/07/photo.jpg"><img src="x.jpg" alt="Before &amp; after"></a></figure>';

    $result = kotlinskidev_add_image_link_aria_label($content);

    expect($result)->toContain('aria-label="View full-size image: Before & after"');
});
